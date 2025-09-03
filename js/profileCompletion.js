import tokenHandler from './util/tokenRefreshHandler.js'; 


$(document).ready(function () {
  let currentStep = 1;
  const totalSteps = $(".step").length;
  let isPremiumUser = false; 
  let activeCategories = []; 
  let activeLocations = []; 
  const token = cookieUtil.get('token');
     if (token) {
          tokenHandler.scheduleSilentRefresh(token);
      }


  
  const cookieUtil = {
    get: function (name) {
      if (typeof $.cookie === 'function') {
        return $.cookie(name);
      }
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }
  };

  checkPremiumStatus();

  fetchActiveCategories();

  fetchActiveLocations();

  $('.selectpicker').selectpicker();

  $(".nextBtn").click(function () {
    const stepDiv = $(".step[data-step='" + currentStep + "']");

    let valid = true;
    stepDiv.find("input[required]").each(function () {
      if ($(this).val() === "") valid = false;
    });

    if (currentStep === 2) {
      const categoryCount = $(".category-item").length;
      if (categoryCount === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Category Required',
          text: 'Please add at least one category before proceeding.',
          confirmButtonText: 'OK'
        });
        return;
      }

      let categorySelected = false;
      $(".category-item select").each(function () {
        if ($(this).val() !== "" && $(this).val() !== null) {
          categorySelected = true;
        }
      });

      if (!categorySelected) {
        Swal.fire({
          icon: 'warning',
          title: 'Category Selection Required',
          text: 'Please select a category from the dropdown before proceeding.',
          confirmButtonText: 'OK'
        });
        return;
      }
    }

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

  $(".prevBtn").click(function () {
    $(".step[data-step='" + currentStep + "']").removeClass("active");
    currentStep--;
    $(".step[data-step='" + currentStep + "']").addClass("active");
    updateProgress();
    updateStepIndicator();
  });

  $("#addCategoryBtn").click(function () {
    const categoryCount = $(".category-item").length;
    const maxCategories = isPremiumUser ? 5 : 1;

    if (categoryCount === 0) {
      addNewCategory();
      return;
    }

    if (!isPremiumUser && categoryCount >= 1) {
      Swal.fire({
        icon: 'info',
        title: 'Premium Feature Required',
        html: `
          <div class="text-start">
            <p>You already have <strong>1 category</strong> selected (free plan limit).</p>
            <p>To add multiple categories, you need to upgrade to our Premium plan.</p>
            <div class="mt-3 p-3 bg-light rounded">
              <h6 class="text-primary"><i class="fas fa-crown me-2"></i>Premium Benefits:</h6>
              <ul class="small mb-0">
                <li>Add up to 5 categories</li>
                <li>Priority job notifications</li>
                <li>Advanced profile features</li>
                <li>Enhanced visibility to clients</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: '<i class="fas fa-crown me-2"></i>Upgrade to Premium',
        showCancelButton: true,
        cancelButtonText: 'Maybe Later',
        confirmButtonColor: '#ffc107',
        width: '500px'
      }).then((result) => {
        if (result.isConfirmed) {
          showPremiumUpgradeModal();
        }
      });
      return;
    }

    if (categoryCount >= maxCategories) {
      Swal.fire({
        icon: 'warning',
        title: 'Maximum Categories Reached',
        text: `You have reached the maximum of ${maxCategories} categories for your plan.`,
        confirmButtonText: 'Got it'
      });
      return;
    }

    addNewCategory();
  });

  function addNewCategory() {
    const categoryCount = $(".category-item").length;
    const newCategoryId = "category_" + (categoryCount + 1);

    const categoryHtml = `<div class="mb-3 category-item">
      <label class="form-label">Category ${String(categoryCount + 1).padStart(2, '0')}</label>
      <select class="form-select selectpicker categoryInput" id="${newCategoryId}" data-live-search="true" data-size="5" required>
        ${generateCategoryOptions()}
      </select>
      ${categoryCount > 0 ? '<button type="button" class="btn btn-sm btn-danger mt-2 removeCategoryBtn"><i class="fas fa-trash me-1"></i>Remove</button>' : ''}
    </div>`;

    $("#categoryContainer").append(categoryHtml);

    $(`#${newCategoryId}`).selectpicker();

    console.log("New category dropdown added with ID:", newCategoryId);
    updateCategoryButton();
    updatePlanStatus();
  }

  $(document).on("click", ".removeCategoryBtn", function () {
    const categoryItem = $(this).closest(".category-item");
    const selectElement = categoryItem.find('.selectpicker');
    const totalCategories = $(".category-item").length;

    if (totalCategories <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove',
        text: 'You must have at least one category selected.',
        confirmButtonText: 'Understood'
      });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: 'Remove Category?',
      text: 'Are you sure you want to remove this category?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectElement.length) {
          selectElement.selectpicker('destroy');
        }

        categoryItem.remove();

        updateCategoryLabels();

        console.log("Category removed. Remaining categories:", $(".category-item").length);
        updateCategoryButton();
        updatePlanStatus();

        Swal.fire({
          icon: 'success',
          title: 'Category Removed',
          text: 'The category has been successfully removed.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  });

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

    $("#locationContainer").append(locationHtml);

    $(`#${newLocationId}`).selectpicker();

    console.log("New location dropdown added with ID:", newLocationId);
  });

  $(document).on("click", ".removeLocationBtn", function () {
    const locationItem = $(this).closest(".location-item");
    const selectElement = locationItem.find('.selectpicker');

    if (selectElement.length) {
      selectElement.selectpicker('destroy');
    }

    locationItem.remove();

    if ($(".location-item").length === 0) {
      $("#addLocationBtn").click(); 
    }

    console.log("Location removed. Remaining locations:", $(".location-item").length);
  });

  function updateProgress() {
    const percent = (currentStep / totalSteps) * 100;
    $("#wizardProgress").css("width", percent + "%");
  }

  function updateStepIndicator() {
    $(".step-indicator .step-item").each(function () {
      const step = $(this).data("step");
      $(this).toggleClass("completed", step < currentStep);
    });
  }

  function checkPremiumStatus() {
    const userPlan = localStorage.getItem('userPlan') || 'free';
    isPremiumUser = userPlan === 'premium';

    console.log('User plan:', userPlan, 'isPremium:', isPremiumUser);
    updateCategoryButton();
    updatePlanStatus();
  }

  async function fetchActiveCategories() {
    console.log('Fetching active categories from API...');

    $('.categoryInput').html('<option value="">Loading categories...</option>').selectpicker('refresh');

    console.log('Token available:', token ? 'Yes' : 'No');

    const headers = {
      'Content-Type': 'application/json'
    };

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
      timeout: 10000,
      success: function (response) {
        console.log('Categories fetched successfully:', response);
        console.log('Response status:', response.status);
        console.log('Response message:', response.message);

        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          activeCategories = response.data;
          console.log('Categories extracted from response.data:', activeCategories);
        } else if (Array.isArray(response)) {
          activeCategories = response;
          console.log('Categories extracted as direct array:', activeCategories);
        } else {
          console.warn('Unexpected response format:', response);
          activeCategories = [];
        }

        populateCategoryDropdowns();

        $('.retry-categories-container').remove();

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

        showToast('Failed to load categories. Using default options.', 'warning');

        activeCategories = [
          { id: 1, name: 'No Active Categories', status: 'ACTIVE' }
        ];

        console.log('Using fallback categories:', activeCategories);
        populateCategoryDropdowns();

        if ($('.category-item:first .retry-categories-btn').length === 0) {
          const retryHtml = `
            <div class="mt-2 retry-categories-container">
              <button type="button" class="btn btn-sm btn-outline-primary retry-categories-btn" onclick="fetchActiveCategories()">
                <i class="fas fa-refresh me-1"></i>Retry Loading Categories
              </button>
            </div>
          `;
          $('.category-item:first').append(retryHtml);
        }
      }
    });
  }

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

  function populateCategoryDropdowns() {
    console.log('Populating category dropdowns with', activeCategories.length, 'categories');
    console.log('Category data:', activeCategories);

    let optionsHtml = '<option value="">Select a Category</option>';

    if (activeCategories.length === 0) {
      optionsHtml = '<option value="">No categories available</option>';
    } else {
      activeCategories.forEach(category => {
        const categoryId = category.id;
        const categoryName = category.name;
        const categoryDescription = category.description;

        if (categoryName) {
          optionsHtml += `<option value="${categoryId}" title="${categoryDescription || ''}">${categoryName}</option>`;
          console.log(`Added category: ID=${categoryId}, Name=${categoryName}`);
        }
      });
    }

    $('.categoryInput').each(function () {
      const currentValue = $(this).val();

      $(this).html(optionsHtml);

      if (currentValue && currentValue !== "Loading categories...") {
        $(this).val(currentValue);
      }

      $(this).selectpicker('refresh');
    });

    console.log('Category dropdowns populated successfully');

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

  async function fetchActiveLocations() {
    console.log('Fetching active locations from API...');

    $('.locationInput').html('<option value="">Loading locations...</option>').selectpicker('refresh');

    const token = cookieUtil.get('token');
    console.log('Token available for locations:', token ? 'Yes' : 'No');

    const headers = {
      'Content-Type': 'application/json'
    };

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
      timeout: 10000,
      success: function (response) {
        console.log('Locations fetched successfully:', response);
        console.log('Response status:', response.status);
        console.log('Response message:', response.message);

        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          activeLocations = response.data;
          console.log('Locations extracted from response.data:', activeLocations);
        } else if (Array.isArray(response)) {
          activeLocations = response;
          console.log('Locations extracted as direct array:', activeLocations);
        } else {
          console.warn('Unexpected location response format:', response);
          activeLocations = [];
        }

        populateLocationDropdowns();

        $('.retry-locations-container').remove();

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

        showToast('Failed to load locations. Using default options.', 'warning');

        activeLocations = [
          { location_id: 1, district: 'No Active District', active: true }
        ];

        console.log('Using fallback locations:', activeLocations);
        populateLocationDropdowns();

        if ($('.location-item:first .retry-locations-btn').length === 0) {
          const retryHtml = `
            <div class="mt-2 retry-locations-container">
              <button type="button" class="btn btn-sm btn-outline-primary retry-locations-btn" onclick="fetchActiveLocations()">
                <i class="fas fa-refresh me-1"></i>Retry Loading Locations
              </button>
            </div>
          `;
          $('.location-item:first').append(retryHtml);
        }
      }
    });
  }

  function populateLocationDropdowns() {
    console.log('Populating location dropdowns with', activeLocations.length, 'locations');
    console.log('Location data:', activeLocations);

    let optionsHtml = '<option value="">Select a District</option>';

    if (activeLocations.length === 0) {
      optionsHtml = '<option value="">No locations available</option>';
    } else {
      activeLocations.forEach(location => {

        const locationId = location.location_id;
        const locationName = location.district;

        if (locationName) {
          optionsHtml += `<option value="${locationId}">${locationName}</option>`;
          console.log(`Added location: ID=${locationId}, Name=${locationName}`);
        }
      });
    }

    $('.locationInput').each(function () {
      const currentValue = $(this).val(); 

      $(this).html(optionsHtml);

      if (currentValue && currentValue !== "Loading locations...") {
        $(this).val(currentValue);
      }

      $(this).selectpicker('refresh');
    });

    console.log('Location dropdowns populated successfully');

    if (activeLocations.length > 0) {
      console.log(`✅ ${activeLocations.length} active locations loaded successfully`);
    }
  }

  function generateLocationOptions() {
    let optionsHtml = '<option value="">Select a District</option>';

    activeLocations.forEach(location => {
      const locationId = location.location_id;
      const locationName = location.district;

      if (locationName) {
        optionsHtml += `<option value="${locationId}">${locationName}</option>`;
      }
    });

    return optionsHtml;
  }

  $("#togglePremiumDemo").click(function () {
    const newPlan = isPremiumUser ? 'free' : 'premium';
    localStorage.setItem('userPlan', newPlan);
    isPremiumUser = !isPremiumUser;
    updateCategoryButton();
    updatePlanStatus();

    Swal.fire({
      icon: 'info',
      title: 'Plan Changed',
      text: `Switched to ${newPlan.toUpperCase()} plan for demo purposes`,
      timer: 1500,
      showConfirmButton: false
    });
  });

  function updatePlanStatus() {
    const statusElement = $("#planStatusText");
    const categoryCount = $(".category-item").length;
    const maxCategories = isPremiumUser ? 5 : 1;

    if (isPremiumUser) {
      statusElement.html(`
        <i class="fas fa-crown text-warning me-1"></i>
        <strong>Premium Plan:</strong> You can add up to ${maxCategories} categories (${categoryCount}/${maxCategories} used)
      `);
      $("#planStatus").removeClass('alert-warning').addClass('alert-success');
    } else {
      statusElement.html(`
        <i class="fas fa-user me-1"></i>
        <strong>Free Plan:</strong> You can add ${maxCategories} category (${categoryCount}/${maxCategories} used). 
        <a href="#" onclick="showPremiumUpgradeModal()" class="alert-link">Upgrade to Premium</a> for more categories.
      `);
      $("#planStatus").removeClass('alert-success').addClass('alert-warning');
    }
  }
  function updateCategoryButton() {
    const categoryCount = $(".category-item").length;
    const maxCategories = isPremiumUser ? 5 : 1;

    if (!isPremiumUser) {
      if (categoryCount >= 1) {
        $("#addCategoryBtn")
          .html('<i class="fas fa-crown me-1"></i>Add More Categories (Premium)')
          .removeClass('btn-success btn-outline-dark')
          .addClass('btn-warning')
          .prop('disabled', false);
      } else {
        $("#addCategoryBtn")
          .html('<i class="fas fa-plus me-1"></i>Add Category')
          .removeClass('btn-warning')
          .addClass('btn-outline-dark')
          .prop('disabled', false);
      }
    } else {
      if (categoryCount >= maxCategories) {
        $("#addCategoryBtn")
          .html(`<i class="fas fa-check me-1"></i>Maximum Categories (${maxCategories})`)
          .removeClass('btn-warning btn-outline-dark')
          .addClass('btn-success')
          .prop('disabled', true);
      } else {
        $("#addCategoryBtn")
          .html('<i class="fas fa-plus me-1"></i>Add Category')
          .removeClass('btn-warning')
          .addClass('btn-success')
          .prop('disabled', false);
      }
    }

    const currentText = $("#addCategoryBtn").text();
    if (categoryCount > 0 && !$("#addCategoryBtn").prop('disabled')) {
      const countText = ` (${categoryCount}/${maxCategories})`;
      if (!currentText.includes('(')) {
        $("#addCategoryBtn").append(countText);
      }
    }
  }

  // Simulate premium upgrade
  function showPremiumUpgradeModal() {
    Swal.fire({
      icon: 'info',
      title: 'Upgrade to Premium',
      html: `
        <div class="text-start">
          <div class="card border-warning mb-3">
            <div class="card-header bg-warning text-dark">
              <h5 class="mb-0"><i class="fas fa-crown me-2"></i>Premium Plan Benefits</h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Add up to 5 categories</li>
                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Priority job notifications</li>
                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Advanced profile features</li>
                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Enhanced visibility to clients</li>
                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>24/7 Premium support</li>
              </ul>
              <div class="text-center mt-3">
                <h4 class="text-primary">$9.99/month</h4>
                <small class="text-muted">Cancel anytime</small>
              </div>
            </div>
          </div>
          <p class="text-center text-muted small">
            <strong>For demo purposes:</strong> Click "Upgrade Now" to simulate premium activation
          </p>
        </div>
      `,
      confirmButtonText: '<i class="fas fa-crown me-2"></i>Upgrade Now',
      showCancelButton: true,
      cancelButtonText: 'Maybe Later',
      confirmButtonColor: '#ffc107',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) {
      
        simulatePremiumUpgrade();
      }
    });
  }

  function simulatePremiumUpgrade() {
    localStorage.setItem('userPlan', 'premium');
    isPremiumUser = true;
    updateCategoryButton();
    updatePlanStatus();

    Swal.fire({
      icon: 'success',
      title: 'Welcome to Premium!',
      html: `
        <div class="text-center">
          <i class="fas fa-crown text-warning" style="font-size: 3rem;"></i>
          <p class="mt-3">Congratulations! You're now a Premium member.</p>
          <p>You can now add up to <strong>5 categories</strong> to your profile.</p>
        </div>
      `,
      timer: 3000,
      showConfirmButton: false
    });
  }

  function updateCategoryLabels() {
    $(".category-item").each(function (index) {
      const label = $(this).find('.form-label');
      label.text(`Category ${String(index + 1).padStart(2, '0')}`);
    });
  }

  window.fetchActiveCategories = fetchActiveCategories;
  window.fetchActiveLocations = fetchActiveLocations;
  window.showPremiumUpgradeModal = showPremiumUpgradeModal;
  window.simulatePremiumUpgrade = simulatePremiumUpgrade;

  $("#finishBtn").click(function (e) {
    e.preventDefault();

    const userId = $.cookie('userId');


    const profileData = {
      phoneNumbers: [
      $("#phone1").val(),
      $("#phone2").val()
      ],
      userId: userId,
      experienceYears: $("#experience").val(),
      bio: $("#about").val(),
      skills: $("#skills").val().split(",").map(skill => skill.trim()),
      categoryIds: [],
      locationIds: [],
      profilePictureUrl: $("#profilePicture").data("uploaded-url") || $("#profilePreview").attr("src"),
    };

    $(".category-item select").each(function () {
      const categoryValue = $(this).val();
      if (categoryValue !== "" && categoryValue !== null) {
        profileData.categoryIds.push(categoryValue);
      }
    });

    $(".location-item select").each(function () {
      const locationValue = $(this).val();
      if (locationValue !== "" && locationValue !== null) {
        profileData.locationIds.push(locationValue);
      }
    });

    console.log("Profile Data to submit:", profileData);
    console.log("Selected categories:", profileData.categoryIds);
    console.log("Selected locations:", profileData.locationIds);

    const categoryText = profileData.categoryIds.length === 1 ? 'category' : 'categories';
    const locationText = profileData.locationIds.length === 1 ? 'location' : 'locations';


    $.ajax({
      type: 'POST',
      url: 'http://localhost:8080/api/v1/worker/register',
      data: JSON.stringify(profileData),
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + $.cookie('token')
      },
      success: function (response) {
        console.log('Profile saved successfully:', response);
        Swal.fire({
          icon: 'success',
          title: 'Profile Saved!',
          text: 'Your profile has been completed successfully.'
        }).then(() => {
          $.cookie('profile_complete', 'true', { path: '/' });
          window.location.href = '../pages/worker-dashboard.html';
        });
      },
      error: function (xhr, status, error) {
        console.error('Profile save failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Failed to save profile. Please try again.'
        });
      }
    });

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
      alert('Profile Data Submitted !!');

      // window.location.href = '../pages/worker-dashboard.html';
    });


  });
});

let selectedFile = null;

$('#profilePicture').on('change', function (e) {
  selectedFile = e.target.files[0];
  if (selectedFile && selectedFile.type.startsWith('image/')) {
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      this.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      $('#profilePreview').attr('src', evt.target.result);
    };
    reader.readAsDataURL(selectedFile);
  } else {
    alert("Please select a valid image file");
    this.value = '';
  }
});


$('#uploadBtn').on('click', function () {
  const token = $.cookie('token');

  console.log('Token:', token ? 'Found' : 'Not found');

  if (!selectedFile) {
    alert("Please select an image first.");
    return;
  }

  if (!token) {
    alert("Authentication token not found. Please login again.");
    return;
  }

  var formData = new FormData();
  formData.append("profilePic", selectedFile);

  $.ajax({
    url: "http://localhost:8080/api/v1/image/upload",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    headers: {
      "Authorization": "Bearer " + token
    },
    beforeSend: function () {
      $("#uploadBtn").html('<span class="spinner-border spinner-border-sm"></span> Uploading...');
      $("#uploadBtn").prop('disabled', true);
    },
    success: function (response) {
      console.log('Upload success:', response);

      var imageUrl = response;
      if (typeof response === 'object') {
        imageUrl = response.data || response.url || response.imageUrl || response;
      }

      $("#profilePreview").attr("src", imageUrl);
      $("#uploadBtn").html('<i class="bi bi-check-circle"></i> Uploaded');
      $("#uploadBtn").removeClass("btn-dark").addClass("btn-success");
      $("#uploadBtn").prop('disabled', false);

      $("#profilePicture").data('uploaded-url', imageUrl);
      $.localStorage.setItem('profile-picture-url', imageUrl);

    },
    error: function (xhr, status, error) {
      console.error('Upload failed:', {
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText,
        error: error
      });

      var errorMessage = "Upload failed. Please try again.";

      if (xhr.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (xhr.status === 413) {
        errorMessage = "File too large. Please select a smaller image.";
      } else if (xhr.status === 415) {
        errorMessage = "Invalid file type. Please select an image file.";
      } else if (xhr.responseText) {
        try {
          var errorResponse = JSON.parse(xhr.responseText);
          errorMessage = errorResponse.message || errorResponse.error || errorMessage;
        } catch (e) {
        }
      }

      alert(errorMessage);
      $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload');
      $("#uploadBtn").removeClass("btn-success").addClass("btn-dark");
      $("#uploadBtn").prop('disabled', false);
    }
  });
});
