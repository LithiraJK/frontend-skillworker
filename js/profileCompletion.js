$(document).ready(function() {
  let currentStep = 1;
  const totalSteps = $(".step").length;
  let isPremiumUser = false; // This would be set based on user's subscription
  let activeCategories = []; // Store fetched categories
  let activeLocations = []; // Store fetched locations

  // Fallback cookie utility if jQuery Cookie is not available
  const cookieUtil = {
    get: function(name) {
      if (typeof $.cookie === 'function') {
        return $.cookie(name);
      }
      // Fallback to vanilla JavaScript
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  };

  // Check user premium status (you would get this from backend)
  // For demo purposes, let's simulate this
  checkPremiumStatus();

  // Fetch active categories from API
  fetchActiveCategories();

  // Fetch active locations from API
  fetchActiveLocations();

  // Initialize existing bootstrap select dropdowns
  $('.selectpicker').selectpicker();

  // Next button
  $(".nextBtn").click(function () {
    const stepDiv = $(".step[data-step='" + currentStep + "']");
    // Basic validation
    let valid = true;
    stepDiv.find("input[required]").each(function () {
      if ($(this).val() === "") valid = false;
    });
    if (!valid) {
      alert("Please fill all required fields");
      return;
    }
    stepDiv.removeClass("active");
    currentStep++;
    $(".step[data-step='" + currentStep + "']").addClass("active");
    updateProgress();
    updateStepIndicator();
  });

  // Previous button
  $(".prevBtn").click(function () {
    $(".step[data-step='" + currentStep + "']").removeClass("active");
    currentStep--;
    $(".step[data-step='" + currentStep + "']").addClass("active");
    updateProgress();
    updateStepIndicator();
  });

  // Add new category dynamically (Premium feature)
  $("#addCategoryBtn").click(function () {
    if (!isPremiumUser) {
      Swal.fire({
        icon: 'info',
        title: 'Premium Feature',
        text: 'Multiple categories are available for premium users only. Upgrade to Premium to unlock this feature!',
        confirmButtonText: 'Upgrade to Premium',
        showCancelButton: true,
        cancelButtonText: 'Maybe Later'
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to premium upgrade page
          window.open('#premium-upgrade', '_blank');
        }
      });
      return;
    }

    const categoryCount = $(".category-item").length;
    const maxCategories = isPremiumUser ? 5 : 1;

    if (categoryCount >= maxCategories) {
      alert(`Maximum ${maxCategories} categories allowed for your plan.`);
      return;
    }

    const newCategoryId = "category_" + (categoryCount + 1);

    const categoryHtml = `<div class="mb-3 category-item">
      <label class="form-label">Category 0${categoryCount + 1}</label>
      <select class="form-select selectpicker categoryInput" id="${newCategoryId}" data-live-search="true" data-size="5">
        ${generateCategoryOptions()}
      </select>
      <button type="button" class="btn btn-sm btn-danger mt-2 removeCategoryBtn">Remove</button>
    </div>`;

    // Append the new category
    $("#categoryContainer").append(categoryHtml);

    // Initialize bootstrap-select for the new dropdown
    $(`#${newCategoryId}`).selectpicker();

    console.log("New category dropdown added with ID:", newCategoryId);
    updateCategoryButton();
  });

  // Remove category
  $(document).on("click", ".removeCategoryBtn", function () {
    const categoryItem = $(this).closest(".category-item");
    const selectElement = categoryItem.find('.selectpicker');

    // Destroy bootstrap-select instance before removing
    if (selectElement.length) {
      selectElement.selectpicker('destroy');
    }

    // Remove the category item
    categoryItem.remove();

    // Don't allow removing if it's the last category
    if ($(".category-item").length === 0) {
      alert("You must have at least one category selected.");
      $("#addCategoryBtn").click(); // Add one back
    }

    console.log("Category removed. Remaining categories:", $(".category-item").length);
    updateCategoryButton();
  });

  // Add new location dynamically
  $("#addLocationBtn").click(function () {
    const locationCount = $(".location-item").length;
    const newLocationId = "workingArea_" + (locationCount + 1);

    const locationHtml = `<div class="mb-3 location-item">
      <label class="form-label">Working Area ${locationCount + 1}</label>
      <select class="form-select selectpicker locationInput" id="${newLocationId}" data-live-search="true" data-size="5">
        ${generateLocationOptions()}
      </select>
      <button type="button" class="btn btn-sm btn-danger mt-2 removeLocationBtn">Remove</button>
    </div>`;

    // Append the new location
    $("#locationContainer").append(locationHtml);

    // Initialize bootstrap-select for the new dropdown
    $(`#${newLocationId}`).selectpicker();

    console.log("New location dropdown added with ID:", newLocationId);
  });

  // Remove location
  $(document).on("click", ".removeLocationBtn", function () {
    const locationItem = $(this).closest(".location-item");
    const selectElement = locationItem.find('.selectpicker');

    // Destroy bootstrap-select instance before removing
    if (selectElement.length) {
      selectElement.selectpicker('destroy');
    }

    // Remove the location item
    locationItem.remove();

    // Don't allow removing if it's the last location
    if ($(".location-item").length === 0) {
      $("#addLocationBtn").click(); // Add one back
    }

    console.log("Location removed. Remaining locations:", $(".location-item").length);
  });

  // Update progress bar
  function updateProgress() {
    const percent = (currentStep / totalSteps) * 100;
    $("#wizardProgress").css("width", percent + "%");
  }

  // Update step indicator
  function updateStepIndicator() {
    $(".step-indicator .step-item").each(function () {
      const step = $(this).data("step");
      $(this).toggleClass("completed", step < currentStep);
    });
  }

  // Check premium status (simulate API call)
  function checkPremiumStatus() {
    // In real application, this would be an AJAX call to your backend
    // For demo, let's randomly assign premium status
    const userPlan = localStorage.getItem('userPlan') || 'free';
    isPremiumUser = userPlan === 'premium';

    console.log('User plan:', userPlan, 'isPremium:', isPremiumUser);
    updateCategoryButton();
  }

  // Fetch active categories from API
  async function fetchActiveCategories() {
    console.log('Fetching active categories from API...');

    // Show loading state
    $('.categoryInput').html('<option value="">Loading categories...</option>').selectpicker('refresh');

    // Get token from cookie if available (for authenticated requests)
    const token = cookieUtil.get('token');
    console.log('Token available:', token ? 'Yes' : 'No');

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add Authorization header if token exists
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = 'Bearer ' + token;
      console.log('Adding Authorization header');
    } else {
      console.log('No token found, making request without authentication');
    }

    $.ajax({
      type: 'GET',
      url: 'http://localhost:8080/api/v1/category/getactive',
      headers: headers,
      timeout: 10000, // 10 second timeout
      success: function (response) {
        console.log('Categories fetched successfully:', response);
        console.log('Response status:', response.status);
        console.log('Response message:', response.message);

        // Handle your specific API response format
        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          activeCategories = response.data;
          console.log('Categories extracted from response.data:', activeCategories);
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          activeCategories = response;
          console.log('Categories extracted as direct array:', activeCategories);
        } else {
          console.warn('Unexpected response format:', response);
          activeCategories = [];
        }

        // Populate existing category dropdowns
        populateCategoryDropdowns();

        // Show success toast
        if (activeCategories.length > 0) {
          showToast(`${activeCategories.length} categories loaded successfully`, 'success');
        } else {
          showToast('No active categories found', 'warning');
        }
      },
      error: function (xhr, status, error) {
        console.error('Failed to fetch categories:', error);
        console.error('Status:', status);
        console.error('Response:', xhr.responseText);

        // Show error toast
        showToast('Failed to load categories. Using default options.', 'warning');

        // Fallback to default categories if API fails
        activeCategories = [
          { id: 1, name: 'No Active Categories', status: 'ACTIVE' }
        ];

        console.log('Using fallback categories:', activeCategories);
        populateCategoryDropdowns();

        // Add retry button in the first category dropdown
        const retryHtml = `
          <div class="mt-2">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="fetchActiveCategories()">
              <i class="fas fa-refresh me-1"></i>Retry Loading Categories
            </button>
          </div>
        `;
        $('.category-item:first').append(retryHtml);
      }
    });
  }

  // Show toast notifications
  function showToast(message, type = 'info') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  }

  // Populate category dropdowns with fetched data
  function populateCategoryDropdowns() {
    console.log('Populating category dropdowns with', activeCategories.length, 'categories');
    console.log('Category data:', activeCategories);

    // Generate options HTML
    let optionsHtml = '<option value="">Select a Category</option>';

    if (activeCategories.length === 0) {
      optionsHtml = '<option value="">No categories available</option>';
    } else {
      activeCategories.forEach(category => {
        // Your API returns: { id: 1, name: "Plumbing", description: "He is Good Plumbing" }
        const categoryId = category.id;
        const categoryName = category.name;
        const categoryDescription = category.description;

        if (categoryName) {
          // Use ID as value and name as display text, description as title attribute for tooltip
          optionsHtml += `<option value="${categoryId}" title="${categoryDescription || ''}">${categoryName}</option>`;
          console.log(`Added category: ID=${categoryId}, Name=${categoryName}`);
        }
      });
    }

    // Update all existing category dropdowns
    $('.categoryInput').each(function () {
      const currentValue = $(this).val(); // Preserve selected value

      // Update options
      $(this).html(optionsHtml);

      // Restore selected value if it still exists
      if (currentValue && currentValue !== "Loading categories...") {
        $(this).val(currentValue);
      }

      // Refresh bootstrap-select
      $(this).selectpicker('refresh');
    });

    console.log('Category dropdowns populated successfully');

    // Show success message if categories loaded
    if (activeCategories.length > 0) {
      console.log(`✅ ${activeCategories.length} active categories loaded successfully`);
    }
  }

  function generateCategoryOptions() {
    let optionsHtml = '<option value="">Select a Category</option>';

    activeCategories.forEach(category => {
      const categoryId = category.id;
      const categoryName = category.name;

      if (categoryName) {
        optionsHtml += `<option value="${categoryId}" title="${categoryName || ''}">${categoryName}</option>`;
      }
    });

    return optionsHtml;
  }

  // Fetch active locations from API
  async function fetchActiveLocations() {
    console.log('Fetching active locations from API...');

    // Show loading state
    $('.locationInput').html('<option value="">Loading locations...</option>').selectpicker('refresh');

    // Get token from cookie if available (for authenticated requests)
    const token = cookieUtil.get('token');
    console.log('Token available for locations:', token ? 'Yes' : 'No');

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add Authorization header if token exists
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = 'Bearer ' + token;
      console.log('Adding Authorization header for locations');
    } else {
      console.log('No token found, making location request without authentication');
    }

    $.ajax({
      type: 'GET',
      url: 'http://localhost:8080/api/v1/location/getactive',
      headers: headers,
      timeout: 10000, // 10 second timeout
      success: function (response) {
        console.log('Locations fetched successfully:', response);
        console.log('Response status:', response.status);
        console.log('Response message:', response.message);

        // Handle your specific API response format
        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          activeLocations = response.data;
          console.log('Locations extracted from response.data:', activeLocations);
        } else if (Array.isArray(response)) {
          // Fallback for direct array response
          activeLocations = response;
          console.log('Locations extracted as direct array:', activeLocations);
        } else {
          console.warn('Unexpected location response format:', response);
          activeLocations = [];
        }

        // Populate existing location dropdowns
        populateLocationDropdowns();

        // Show success toast
        if (activeLocations.length > 0) {
          showToast(`${activeLocations.length} locations loaded successfully`, 'success');
        } else {
          showToast('No active locations found', 'warning');
        }
      },
      error: function (xhr, status, error) {
        console.error('Failed to fetch locations:', error);
        console.error('Status:', status);
        console.error('Response:', xhr.responseText);

        // Show error toast
        showToast('Failed to load locations. Using default options.', 'warning');

        // Fallback to default locations if API fails
        activeLocations = [
          { location_id: 1, district: 'No Active District', active: true }
        ];

        console.log('Using fallback locations:', activeLocations);
        populateLocationDropdowns();

        // Add retry button in the first location dropdown
        const retryHtml = `
          <div class="mt-2">
            <button type="button" class="btn btn-sm btn-outline-primary" onclick="fetchActiveLocations()">
              <i class="fas fa-refresh me-1"></i>Retry Loading Locations
            </button>
          </div>
        `;
        $('.location-item:first').append(retryHtml);
      }
    });
  }

  // Populate location dropdowns with fetched data
  function populateLocationDropdowns() {
    console.log('Populating location dropdowns with', activeLocations.length, 'locations');
    console.log('Location data:', activeLocations);

    // Generate options HTML
    let optionsHtml = '<option value="">Select a District</option>';

    if (activeLocations.length === 0) {
      optionsHtml = '<option value="">No locations available</option>';
    } else {
      activeLocations.forEach(location => {
  
        const locationId = location.location_id;
        const locationName = location.district;

        if (locationName) {
          // Use location_id as value and district as display text
          optionsHtml += `<option value="${locationId}">${locationName}</option>`;
          console.log(`Added location: ID=${locationId}, Name=${locationName}`);
        }
      });
    }

    // Update all existing location dropdowns
    $('.locationInput').each(function () {
      const currentValue = $(this).val(); // Preserve selected value

      // Update options
      $(this).html(optionsHtml);

      // Restore selected value if it still exists
      if (currentValue && currentValue !== "Loading locations...") {
        $(this).val(currentValue);
      }

      // Refresh bootstrap-select
      $(this).selectpicker('refresh');
    });

    console.log('Location dropdowns populated successfully');

    // Show success message if locations loaded
    if (activeLocations.length > 0) {
      console.log(`✅ ${activeLocations.length} active locations loaded successfully`);
    }
  }

  // Generate location options HTML (for new dropdowns)
  function generateLocationOptions() {
    let optionsHtml = '<option value="">Select a District</option>';

    activeLocations.forEach(location => {
      // Your API returns: { location_id: 1, district: "COLOMBO", active: true }
      const locationId = location.location_id;
      const locationName = location.district;

      if (locationName) {
        // Use location_id as value and district as display text
        optionsHtml += `<option value="${locationId}">${locationName}</option>`;
      }
    });

    return optionsHtml;
  }

  // Update category button based on premium status
  function updateCategoryButton() {
    const categoryCount = $(".category-item").length;
    const maxCategories = isPremiumUser ? 5 : 1;

    if (!isPremiumUser) {
      $("#addCategoryBtn").html('<i class="fas fa-crown me-1"></i>Add Category (Premium Only)')
        .removeClass('btn-success')
        .addClass('btn-warning');
    } else {
      $("#addCategoryBtn").html('<i class="fas fa-plus me-1"></i>Add Category')
        .removeClass('btn-warning')
        .addClass('btn-success');

      if (categoryCount >= maxCategories) {
        $("#addCategoryBtn").prop('disabled', true)
          .html(`<i class="fas fa-check me-1"></i>Maximum Categories (${maxCategories})`);
      } else {
        $("#addCategoryBtn").prop('disabled', false);
      }
    }
  }

  // Simulate premium upgrade
  // window.simulatePremiumUpgrade = function () {
  //   localStorage.setItem('userPlan', 'premium');
  //   isPremiumUser = true;
  //   updateCategoryButton();

  //   Swal.fire({
  //     icon: 'success',
  //     title: 'Welcome to Premium!',
  //     text: 'You can now add up to 5 categories.',
  //     timer: 2000
  //   });
  // };

  // Make fetchActiveCategories globally accessible for retry button
  window.fetchActiveCategories = fetchActiveCategories;

  // Make fetchActiveLocations globally accessible for retry button
  window.fetchActiveLocations = fetchActiveLocations;

  // Submit form
  $("#profileWizard").submit(function (e) {
    e.preventDefault();

    // Collect form data
    const profileData = {
      phoneNumbers: [
        $("#phone1").val(),
        $("#phone2").val()
      ],
      experience: $("#experience").val(),
      bio: $("#bio").val(),
      skills: $("#skills").val().split(",").map(skill => skill.trim()),
      categoryIds: [],
      locationIds: [],
      profilePictureUrl: $("#profilePicture")[0]?.files[0] ? URL.createObjectURL($("#profilePicture")[0].files[0]) : "",
    };

    // Collect all category values
    $(".category-item select").each(function () {
      const categoryValue = $(this).val();
      if (categoryValue !== "" && categoryValue !== null) {
        profileData.categoryIds.push(categoryValue);
      }
    });

    // Collect all location values
    $(".location-item select").each(function () {
      const locationValue = $(this).val();
      if (locationValue !== "" && locationValue !== null) {
        profileData.locationIds.push(locationValue);
      }
    });

    console.log("Profile Data to submit:", profileData);
    console.log("Selected categories:", profileData.categoryIds);
    console.log("Selected locations:", profileData.locationIds);

    // Show success message with category and location count
    const categoryText = profileData.categoryIds.length === 1 ? 'category' : 'categories';
    const locationText = profileData.locationIds.length === 1 ? 'location' : 'locations';

    Swal.fire({
      icon: 'success',
      title: 'Profile Completed!',
      html: `
        <div class="text-start">
          <p><strong>Summary:</strong></p>
          <ul>
            <li>${profileData.categoryIds.length} ${categoryText} selected</li>
            <li>${profileData.locationIds.length} ${locationText} selected</li>
          </ul>
          <p class="small text-muted">Check console for detailed data.</p>
        </div>
      `,
      confirmButtonText: 'Continue to Dashboard'
    }).then(() => {
      // Redirect to appropriate dashboard
      window.location.href = '../pages/workerDashboard.html';
    });



    // TODO: send `profileData` to backend via AJAX
    $.ajax({
      type: 'POST',
      url: 'http://localhost:8080/api/v1/worker/register',
      data: JSON.stringify(profileData),
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + $.cookie('token')
      },
      success: function(response) {
        console.log('Profile saved successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Profile Saved!',
          text: 'Your profile has been completed successfully.'
        }).then(() => {
          window.location.href = '../pages/workerDashboard.html';
        });
      },
      error: function(xhr, status, error) {
        console.error('Profile save failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Failed to save profile. Please try again.'
        });
      }
    });
    
  });
});
