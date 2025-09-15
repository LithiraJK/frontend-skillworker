// import tokenHandler from './util/tokenRefreshHandler.js'; 

// $(document).ready(function () {    
//     const workerId = $.cookie('userId');
//     const apiUrl = `http://localhost:8080/api/v1/worker/getworker/${workerId}`;
//     const token = $.cookie("token");
//     let userData = {};

//     if (token) {
//         tokenHandler.scheduleSilentRefresh(token);
//     }

//     $.ajax({
//         url: `http://localhost:8080/api/v1/user/getuser/${workerId}`,
//         method: "GET",
//         dataType: "json",
//         headers: { "Authorization": `Bearer ${token}` },
//         async: false,
//         success: function (response) {
//             if (response.status === 200 && response.data) {
//                 userData = {
//                     firstName: response.data.firstName,
//                     lastName: response.data.lastName,
//                     email: response.data.email
//                 };
//             } else {
//                 console.warn("No user data found!");
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching user data:", error);
//         }
//     });

//     $.ajax({
//         url: apiUrl,
//         method: "GET",
//         dataType: "json",
//         headers: { "Authorization": `Bearer ${token}` },
//         success: function (response) {
//             if (response.status === 200 && response.data) {
//                 const worker = response.data;

//                 $(".profile-pic").attr("src", worker.profilePictureUrl || "/assets/images/workerDefualtPP.png");

//                 // Display Name (no direct name field in API, fallback from category or ID)
//                 $("#displayFirstName").text(userData.firstName);
//                 $("#displayLastName").text(userData.lastName);

//                 // Email (API doesn't return email, so just show placeholder for now)
//                 $("#displayEmail").text(userData.email);

//                 // Category
//                 if (worker.categories && worker.categories.length > 0) {
//                     $("#displayCategory").html(`<strong>${worker.categories[0].name}</strong>`);
//                 }

//                 // Location
//                 if (worker.locations && worker.locations.length > 0) {
//                     let locationText = worker.locations.map(loc => loc.district).join(", ");
//                     $("#displayLocation").html(`<i class="bi bi-geo-alt"></i> ${locationText}`);
//                 }

//                 // Experience
//                 $("#displayExperience").text(worker.experienceYears || 0);

//                 // Bio
//                 $("#displayBio").text(worker.bio || "No bio available");

//                 // Skills
//                 const $skillsContainer = $("#skillsContainer").next(); // the <span> list
//                 $skillsContainer.empty(); // clear old
//                 if (worker.skills && worker.skills.length > 0) {
//                     worker.skills.forEach(skill => {
//                         $skillsContainer.append(`<span class="skill-badge">${skill}</span> `);
//                     });
//                 } else {
//                     $skillsContainer.append(`<span class="text-muted">No skills added</span>`);
//                 }

//                 $(".card.mb-4 img").attr("src", worker.profilePictureUrl || "/assets/images/workerDefualtPP.png");
//                 $(".card.mb-4 h6").text(worker.name || `Worker ${worker.workerId}`);
//                 $(".card.mb-4 small").text(worker.categories?.[0]?.name || "No Category");

//             } else {
//                 console.warn("No worker data found!");
//             }
//         },
//         error: function (xhr, status, error) {
//             console.error("Error fetching worker data:", error);
//         }
//     });
// });

$(document).ready(() => {
  // Check if required libraries are loaded
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  console.log('Worker profile preview page initialized successfully')
  
  const urlParams = new URLSearchParams(window.location.search)
  const workerId = urlParams.get('workerId') 
  const apiUrl = `http://localhost:8080/api/v1/worker/profile/${workerId}`
  const token = $.cookie("token")

  // Check if we have the required parameters
  if (!workerId) {
    console.error('No worker ID provided')
    showError('Invalid worker ID. Please return to the previous page.')
    return
  }

  if (!token) {
    console.error('No token found')
    showError('Authentication required. Redirecting to login...')
    setTimeout(() => {
      window.location.href = '../pages/login-page.html'
    }, 2000)
    return
  }

  // Check if tokenHandler is available (loaded via script tag)
  if (typeof tokenHandler !== 'undefined' && token) {
    try {
      tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn('Token refresh handler not available:', error)
    }
  }

  function showLoadingState() {
    $(".profile-pic").addClass("placeholder-glow")
    $("#displayFirstName, #displayLastName, #displayEmail").addClass("placeholder-glow")
  }

  function hideLoadingState() {
    $(".placeholder-glow").removeClass("placeholder-glow")
  }

  function showError(message) {
    const errorHtml = `
            <div class="alert alert-danger glass-card" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `
    $(".container").prepend(errorHtml)
    setTimeout(() => {
      $(".alert").fadeOut()
    }, 5000)
  }

  function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fa-sharp fa-solid fa-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
      starsHtml += '<i class="fa-sharp fa-solid fa-star-half-stroke"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="fa-sharp fa-regular fa-star"></i>';
    }
    
    return starsHtml;
  }

  showLoadingState()

  // Fetch worker profile data using the new API endpoint
  $.ajax({
    url: apiUrl,
    method: "GET",
    dataType: "json",
    headers: { Authorization: `Bearer ${token}` },
    success: (response) => {
      hideLoadingState()

      if (response.status === 200 && response.data) {
        const worker = response.data

        // Profile Picture
        const profilePicUrl = worker.profilePictureUrl || "/assets/images/workerDefualtPP.png"
        $(".profile-pic").attr("src", profilePicUrl)

        // Display Name
        $("#displayFirstName").text(worker.firstName || "N/A")
        $("#displayLastName").text(worker.lastName || "")

        // Email
        $("#displayEmail").text(worker.email || "No email provided")

        // Rating and Reviews
        const rating = worker.averageRating || 0
        const totalReviews = worker.totalReviews || 0
        
        // Update the star rating display
        $(".star").html(generateStars(rating))
        $(".star").next(".fw-semibold").text(rating.toFixed(1))
        
        // Update reviews count in the reviews section
        $("h5:contains('Reviews')").text(`(${totalReviews}) Reviews`)

        // Category
        if (worker.categories && worker.categories.length > 0) {
          $("#displayCategory").html(`<strong>${worker.categories[0].name}</strong>`)
        } else {
          $("#displayCategory").html(`<strong>No Category</strong>`)
        }

        // Location
        if (worker.locations && worker.locations.length > 0) {
          const locationText = worker.locations
            .filter(loc => loc.active)
            .map((loc) => loc.district)
            .join(", ")
          $("#displayLocation").html(`<i class="bi bi-geo-alt text-warning"></i> ${locationText}`)
        } else {
          $("#displayLocation").html(`<i class="bi bi-geo-alt text-warning"></i> Location not specified`)
        }

        // Experience
        $("#displayExperience").text(worker.experienceYears || 0)

        // Bio
        $("#displayBio").text(worker.bio || "No bio available")

        // Skills
        const $skillsContainer = $("#skillsContainer").next()
        $skillsContainer.empty()
        if (worker.skills && worker.skills.length > 0) {
          worker.skills.forEach((skill) => {
            $skillsContainer.append(`<span class="skill-badge">${skill}</span> `)
          })
        } else {
          $skillsContainer.append(`<span class="text-muted">No skills added</span>`)
        }

        // Phone Numbers - Add to the bio section or create a new section
        if (worker.phoneNumbers && worker.phoneNumbers.length > 0) {
          const phoneNumbersHtml = worker.phoneNumbers.map(phone => 
            `<span class="badge bg-light text-dark me-2 mb-1">
              <i class="fas fa-phone me-1"></i>${phone}
            </span>`
          ).join('')
          
          // Add phone numbers after the bio section
          const phoneSection = `
            <div class="mb-4 glass-card p-4">
              <h5 class="mb-3">Contact Information</h5>
              <div class="phone-numbers">
                ${phoneNumbersHtml}
              </div>
            </div>
          `
          $("#displayBio").closest('.glass-card').after(phoneSection)
        }

        // Contact Card
        $(".contact-card img").attr("src", profilePicUrl)
        $(".contact-card h6").text(`${worker.firstName || "Worker"} ${worker.lastName || ""}`)
        $(".contact-card small").text(worker.categories?.[0]?.name || "No Category")

        // Store phone numbers for contact functionality
        if (worker.phoneNumbers && worker.phoneNumbers.length > 0) {
          // Store the first phone number for contact button
          $(".btn-primary-custom").data("phone", worker.phoneNumbers[0])
        }

        // Update service cards with actual worker data
        updateServiceCards(worker)

        // Populate services section
        populateServices(worker)

      } else {
        console.warn("No worker data found!")
        showError("Worker profile not found")
      }
    },
    error: (xhr, status, error) => {
      hideLoadingState()
      console.error("Error fetching worker data:", error)
      
      let errorMessage = "Failed to load worker profile"
      if (xhr.status === 404) {
        errorMessage = "Worker profile not found"
      } else if (xhr.status === 401) {
        errorMessage = "Authentication required. Please login again."
        setTimeout(() => {
          window.location.href = '../pages/login-page.html'
        }, 2000)
      } else if (xhr.responseJSON && xhr.responseJSON.message) {
        errorMessage = xhr.responseJSON.message
      }
      
      showError(errorMessage)
    },
  })

  function updateServiceCards(worker) {
    // This function is kept for backward compatibility but services are now handled by populateServices
    console.log('Service cards updated with worker data')
  }

  function populateServices(worker) {
    const $servicesContainer = $("#servicesContainer")
    $servicesContainer.empty()

    // Create service cards based on worker's categories and skills
    if (worker.categories && worker.categories.length > 0) {
      worker.categories.forEach((category, index) => {
        const serviceCard = createServiceCard(worker, category, index)
        $servicesContainer.append(serviceCard)
      })
    } else {
      // If no categories, create a default service card
      const defaultCategory = { name: "General Service" }
      const serviceCard = createServiceCard(worker, defaultCategory, 0)
      $servicesContainer.append(serviceCard)
    }
  }

  function createServiceCard(worker, category, index) {
    const profilePicUrl = worker.profilePictureUrl || "/assets/images/workerDefualtPP.png"
    const workerName = `${worker.firstName || 'Worker'} ${worker.lastName || ''}`
    const rating = worker.averageRating || 0
    const totalReviews = worker.totalReviews || 0
    const locationText = worker.locations && worker.locations.length > 0 
      ? worker.locations.filter(loc => loc.active).map(loc => loc.district).join(" & ")
      : "Location not specified"
    
    // Generate a service title based on category and skills
    let serviceTitle = `${category.name} Service`
    if (worker.skills && worker.skills.length > 0) {
      const relevantSkill = worker.skills[index] || worker.skills[0]
      serviceTitle = `${relevantSkill} - ${category.name}`
    }

    // Calculate estimated rate (you can adjust this logic)
    const baseRate = 1500 + (index * 500) + (worker.experienceYears * 100)
    const formattedRate = `Rs. ${baseRate.toLocaleString()}`

    const serviceCard = $(`
      <div class="col-md-6 mb-4">
        <div class="worker-card clickable-card" data-worker-id="${worker.workerId}" style="cursor: pointer;">
          <div class="d-flex align-items-start mb-3">
            <img src="${profilePicUrl}" alt="Worker Profile" class="worker-avatar me-3" 
                 onerror="this.src='/assets/images/workerDefualtPP.png'">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center mb-1">
                <h6 class="mb-0 me-2">${workerName}</h6>
                ${worker.profileComplete ? '<i class="fas fa-award text-success" title="Verified Profile"></i>' : ""}
              </div>
              <p class="text-primary mb-1 small">${category.name}</p>
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-star rating-stars me-1"></i>
                <span class="fw-medium me-1">${rating.toFixed(1)}</span>
                <span class="text-muted small">(${totalReviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <p class="h6 text-dark mb-2" title="${serviceTitle}">
            ${serviceTitle.length > 45 ? serviceTitle.substring(0, 45) + '...' : serviceTitle}
          </p>
          
          <div class="row g-2 mb-3 small">
            <div class="col-6">
              <span class="text-muted">Location:</span>
              <div class="fw-medium">${locationText}</div>
            </div>
            <div class="col-6">
              <span class="text-muted">Starting from:</span>
              <div class="fw-medium text-success">${formattedRate}</div>
            </div>
          </div>
          
          <div class="d-flex gap-2">
            <button class="btn skillworker-btn-primary flex-grow-1 btn-sm contact-btn" 
                    data-worker-id="${worker.workerId}" 
                    data-phone="${worker.phoneNumbers ? worker.phoneNumbers.join(', ') : 'No phone available'}"
                    onclick="event.stopPropagation()">
              <i class="fas fa-phone me-1"></i>Contact
            </button>
            <button class="btn btn-outline-secondary btn-sm favorite-btn" 
                    data-worker-id="${worker.workerId}"
                    onclick="event.stopPropagation()">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `)

    // Add click handlers for the new service cards
    serviceCard.find('.contact-btn').on('click', function(e) {
      e.stopPropagation()
      const phoneNumber = $(this).data('phone')
      if (phoneNumber && phoneNumber !== 'No phone available') {
        window.location.href = `tel:${phoneNumber.split(',')[0].trim()}`
      } else {
        showError("No contact information available")
      }
    })

    serviceCard.find('.favorite-btn').on('click', function(e) {
      e.stopPropagation()
      const $btn = $(this)
      $btn.find('i').toggleClass('fas far')
      
      if ($btn.find('i').hasClass('fas')) {
        $btn.addClass('text-danger')
        showSuccessMessage("Added to favorites!")
      } else {
        $btn.removeClass('text-danger')
        showSuccessMessage("Removed from favorites!")
      }
    })

    return serviceCard
  }

  function showSuccessMessage(message) {
    const successHtml = `
      <div class="alert alert-success glass-card position-fixed" role="alert" 
           style="top: 100px; right: 20px; z-index: 9999; min-width: 300px;">
        <i class="fas fa-check-circle me-2"></i>
        ${message}
      </div>
    `
    $("body").append(successHtml)
    setTimeout(() => {
      $(".alert-success").fadeOut(() => {
        $(".alert-success").remove()
      })
    }, 3000)
  }

  $('a[href^="#"]').on("click", function (event) {
    var target = $(this.getAttribute("href"))
    if (target.length) {
      event.preventDefault()
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: target.offset().top - 100,
          },
          1000,
        )
    }
  })

  $(".btn-primary-custom").on("click", function () {
    const phoneNumber = $(this).data("phone")
    
    if (phoneNumber) {
      // Show phone number options if multiple numbers available
      const confirmMessage = `Contact via phone: ${phoneNumber}?\n\nThis will open your phone app.`
      
      if (confirm(confirmMessage)) {
        // Open phone app with the number
        window.location.href = `tel:${phoneNumber}`
      }
    } else {
      // Fallback if no phone number available
      $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Connecting...')

      setTimeout(() => {
        $(this).html('<i class="fa-regular fa-paper-plane me-2"></i>Contact Me')
        showError("No contact information available for this worker")
      }, 1000)
    }
  })

  // Enhanced Star Rating System
  $(".star-rating i").click(function () {
    const rating = $(this).data("rating")
    $(".star-rating i").removeClass("active")
    $(".star-rating i").each(function () {
      if ($(this).data("rating") <= rating) {
        $(this).addClass("active")
      }
    })
  })

  // Submit Review Form Handler
  $('.review-form').on("submit", function (e) {
    e.preventDefault()

    const $form = $(this)
    const name = $form.find('input[placeholder="Your Name"]').val()
    const review = $form.find("textarea").val()
    
    // Get the selected rating from active stars
    const rating = $form.find(".star-rating i.active").length

    if (!name || !review || rating === 0) {
      showError("Please fill in all fields and select a rating to submit your review")
      return
    }

    const $submitBtn = $form.find('.submit-review-btn')
    $submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Submitting...')

    // Get reviewer ID from cookie and worker ID from URL params
    const reviewerId = $.cookie("userId")
    const urlParams = new URLSearchParams(window.location.search)
    const workerId = urlParams.get('workerId')
    const token = $.cookie("token")

    // Prepare review data
    const reviewData = {
      comment: review,
      rating: rating,
      reviewerId: parseInt(reviewerId),
      workerId: parseInt(workerId)
    }

    // Submit review to backend
    $.ajax({
      url: 'http://localhost:8080/api/v1/review/create',
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(reviewData),
      success: (response) => {
        $submitBtn.html('<i class="fas fa-paper-plane me-2"></i>Submit Review')
        $form.find("input, textarea").val("")
        
        // Reset star rating
        $form.find(".star-rating i").removeClass("active")

        // Show success message
        const successHtml = `
                <div class="alert alert-success glass-card" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    Thank you for your ${rating}-star review! It has been submitted successfully.
                </div>
            `
        $(".container").prepend(successHtml)
        setTimeout(() => {
          $(".alert-success").fadeOut()
        }, 5000)
      },
      error: (xhr, status, error) => {
        $submitBtn.html('<i class="fas fa-paper-plane me-2"></i>Submit Review')
        console.error("Error submitting review:", error)
        
        let errorMessage = "Failed to submit review. Please try again."
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message
        }
        
        showError(errorMessage)
      }
    })
  })
})
