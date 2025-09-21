$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }

  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 is not loaded!')
    return
  }
  
  console.log('Worker profile preview page initialized successfully')
  
  const urlParams = new URLSearchParams(window.location.search)
  const workerId = urlParams.get('workerId') 
  const apiUrl = `http://localhost:8080/api/v1/worker/profile/${workerId}`
  const token = $.cookie("token")
  let subscriptionPlan = "FREE" 

  // Initialize token refresh handler
  if (typeof window.tokenHandler !== 'undefined' && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn('Token refresh handler not available:', error)
    }
  } 

  function getVerifiedBadge(size = 'md') {
    const isVerified = subscriptionPlan === "PRO" || subscriptionPlan === "PREMIUM"
    if (!isVerified) return ''
    
    const sizeClass = size === 'lg' ? 'fs-4' : size === 'md' ? 'fs-5' : 'fs-6'
    
    return `<i class=" ${sizeClass} verified-badge" title="Verified ${subscriptionPlan} Worker" style="filter: drop-shadow(0 0 3px rgba(10, 31, 64, 0.4)); animation: verifiedPulse 2s infinite;"></i>`
  }

  function getWorkerSubscription() {
    if (!token || !workerId) {
      console.warn("Token or workerId not available for subscription check")
      return
    }

    $.ajax({
      url: `http://localhost:8080/api/v1/subscription/status/${workerId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        console.log("Subscription data:", response)
        if (response && response.plan) {
          subscriptionPlan = response.plan.toUpperCase()
          console.log("Updated subscription plan:", subscriptionPlan)
          updateVerifiedBadge()
        } else {
          console.warn("Invalid subscription response format:", response)
          subscriptionPlan = "FREE"
        }
      },
      error: (xhr, status, error) => {
        console.warn("Failed to fetch subscription data:", error)
        subscriptionPlan = "FREE"
      },
    })
  }

  function updateVerifiedBadge() {
    const nameContainer = $("h3").first() 
    nameContainer.find('.verified-badge, .verified-worker-badge').remove() 
    
    const isVerified = subscriptionPlan === "PRO" || subscriptionPlan === "PREMIUM"
    if (isVerified) {
      const verifiedBadge = getVerifiedBadge('md')
      nameContainer.append(verifiedBadge)
      
      const professionalBadge = `<span class="verified-worker-badge">
        <i class="fas fa-award"></i>
        VERIFIED ${subscriptionPlan}
      </span>`
      nameContainer.append(professionalBadge)
    }
  }

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
    Swal.fire({
      title: '⚠️ Error',
      text: message,
      icon: 'error',
      confirmButtonColor: '#023047',
      confirmButtonText: 'Understood',
      customClass: {
        popup: 'skillworker-swal-popup',
        confirmButton: 'skillworker-swal-confirm',
        title: 'skillworker-swal-title',
        content: 'skillworker-swal-content'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }

  function generateStars(rating) {
    // Ensure rating is a number and within valid range
    const validRating = Math.max(0, Math.min(5, parseFloat(rating) || 0))
    const fullStars = Math.floor(validRating)
    const hasHalfStar = (validRating % 1) >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    let starsHtml = ''
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fa-sharp fa-solid fa-star text-warning"></i>'
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      starsHtml += '<i class="fa-sharp fa-solid fa-star-half-stroke text-warning"></i>'
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="fa-sharp fa-regular fa-star text-muted"></i>'
    }
    
    return starsHtml
  }

  showLoadingState()

  $.ajax({
    url: apiUrl,
    method: "GET",
    dataType: "json",
    headers: { Authorization: `Bearer ${token}` },
    success: (response) => {
      hideLoadingState()

      if (response.status === 200 && response.data) {
        const worker = response.data

        const profilePicUrl = worker.profilePictureUrl || "/assets/images/workerDefualtPP.png"
        $(".profile-pic").attr("src", profilePicUrl)

        $("#displayFirstName").text(worker.firstName || "N/A")
        $("#displayLastName").text(worker.lastName || "")

        // Get subscription and update verified badge after names are set
        getWorkerSubscription()

        $("#displayEmail").text(worker.email || "No email provided")

        // Enhanced rating display with proper validation
        const rating = parseFloat(worker.averageRating) || 0
        const totalReviews = parseInt(worker.totalReviews) || 0
        
        // Update star display
        $(".star").html(generateStars(rating))
        
        // Update rating text with better formatting
        const formattedRating = rating > 0 ? rating.toFixed(1) : "0.0"
        $(".star").next(".fw-semibold").text(formattedRating)
        
        // Update review count with proper text formatting
        const reviewText = totalReviews === 1 ? "Review" : "Reviews"
        $("h5:contains('Reviews')").text(`(${totalReviews}) ${reviewText}`)
        
        // Also update any other rating elements that might exist
        $(".average-rating").text(formattedRating)
        $(".total-reviews").text(totalReviews)
        
        console.log(`Rating updated: ${formattedRating}/5.0 with ${totalReviews} reviews`)

        if (worker.categories && worker.categories.length > 0) {
          $("#displayCategory").html(`<strong>${worker.categories[0].name}</strong>`)
        } else {
          $("#displayCategory").html(`<strong>No Category</strong>`)
        }

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
    Swal.fire({
      title: '✅ Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#023047',
      confirmButtonText: 'Great!',
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'skillworker-swal-popup',
        confirmButton: 'skillworker-swal-confirm',
        title: 'skillworker-swal-title',
        content: 'skillworker-swal-content'
      },
      showClass: {
        popup: 'animate__animated animate__fadeInUp'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown'
      }
    })
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

  // Contact button handler - more specific to avoid conflicts with review form
  $(".btn-primary-custom").not(".submit-review-btn").on("click", function (e) {
    e.preventDefault()
    e.stopPropagation()
    
    const phoneNumber = $(this).data("phone")
    
    if (phoneNumber && phoneNumber !== 'No phone available') {
      // Show SweetAlert confirmation for phone contact
      Swal.fire({
        title: '📞 Contact Worker',
        html: `
          <div class="text-center">
            <p class="mb-3">Contact via phone:</p>
            <h5 class="text-primary mb-3">${phoneNumber}</h5>
            <p class="text-muted small">This will open your phone app to make the call.</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#023047',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-phone me-2"></i>Call Now',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'skillworker-swal-popup',
          confirmButton: 'skillworker-swal-confirm',
          cancelButton: 'skillworker-swal-cancel',
          title: 'skillworker-swal-title',
          content: 'skillworker-swal-content'
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Open phone app with the number
          window.location.href = `tel:${phoneNumber}`
        }
      })
    } else {
      // Fallback if no phone number available using SweetAlert
      const $btn = $(this)
      const originalHtml = $btn.html()
      
      $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>Connecting...')

      setTimeout(() => {
        $btn.html(originalHtml)
        showError("No contact information available for this worker")
      }, 1000)
    }
  })

  // Enhanced Star Rating System with hover effects
  $(document).on("mouseover", ".star-rating i", function() {
    const rating = $(this).data("rating")
    $(".star-rating i").each(function() {
      if ($(this).data("rating") <= rating) {
        $(this).removeClass("far").addClass("fas text-warning")
      } else {
        $(this).removeClass("fas text-warning").addClass("far text-muted")
      }
    })
  })

  $(document).on("mouseout", ".star-rating", function() {
    // Reset to selected rating when mouse leaves
    const selectedRating = $(".star-rating i.active").length
    $(".star-rating i").each(function() {
      if ($(this).data("rating") <= selectedRating) {
        $(this).removeClass("far text-muted").addClass("fas text-warning active")
      } else {
        $(this).removeClass("fas text-warning active").addClass("far text-muted")
      }
    })
  })

  $(document).on("click", ".star-rating i", function() {
    const rating = $(this).data("rating")
    
    // Remove all active classes first
    $(".star-rating i").removeClass("active fas text-warning").addClass("far text-muted")
    
    // Add active class to selected stars
    $(".star-rating i").each(function() {
      if ($(this).data("rating") <= rating) {
        $(this).removeClass("far text-muted").addClass("fas text-warning active")
      }
    })
    
    console.log(`Rating selected: ${rating} stars`)
  })

  // Submit Review Form Handler with enhanced validation and conflict prevention
  $(document).on('submit', '.review-form', function (e) {
    e.preventDefault()
    e.stopPropagation()

    const $form = $(this)
    const name = $form.find('input[placeholder="Your Name"]').val().trim()
    const review = $form.find("textarea").val().trim()
    
    // Get the selected rating from active stars
    const rating = $form.find(".star-rating i.active").length

    // Enhanced validation
    if (!name) {
      showError("Please enter your name")
      $form.find('input[placeholder="Your Name"]').focus()
      return false
    }

    if (name.length < 2) {
      showError("Name must be at least 2 characters long")
      $form.find('input[placeholder="Your Name"]').focus()
      return false
    }

    if (!review) {
      showError("Please write a review")
      $form.find("textarea").focus()
      return false
    }

    if (review.length < 10) {
      showError("Review must be at least 10 characters long")
      $form.find("textarea").focus()
      return false
    }

    if (rating === 0) {
      showError("Please select a rating by clicking on the stars")
      return false
    }

    const $submitBtn = $form.find('.submit-review-btn')
    const originalText = $submitBtn.html()
    $submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Submitting...').prop('disabled', true)

    const reviewerId = $.cookie("userId")
    const urlParams = new URLSearchParams(window.location.search)
    const workerId = urlParams.get('workerId')
    const token = $.cookie("token")

    // Validate required data
    if (!reviewerId) {
      showError("You must be logged in to submit a review")
      $submitBtn.html(originalText).prop('disabled', false)
      return false
    }

    if (!workerId) {
      showError("Invalid worker ID")
      $submitBtn.html(originalText).prop('disabled', false)
      return false
    }

    // Prepare review data
    const reviewData = {
      comment: review,
      rating: rating,
      reviewerId: parseInt(reviewerId),
      workerId: parseInt(workerId)
    }

    console.log('Submitting review:', reviewData)

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
        console.log('Review submitted successfully:', response)
        
        $submitBtn.html('<i class="fas fa-check me-2"></i>Review Submitted!').removeClass('btn-primary-custom').addClass('btn-success')
        
        // Reset form
        $form.find("input, textarea").val("")
        
        // Reset star rating with better visual feedback
        $form.find(".star-rating i").removeClass("active fas text-warning").addClass("far text-muted")

        // Show enhanced success message with SweetAlert
        Swal.fire({
          title: '🌟 Thank You!',
          html: `
            <div class="text-center">
              <h5 class="mb-3">Your ${rating}-star review has been submitted successfully!</h5>
              <p class="text-muted mb-0">Your feedback helps other clients make better decisions.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#023047',
          confirmButtonText: 'You\'re Welcome!',
          timer: 5000,
          timerProgressBar: true,
          customClass: {
            popup: 'skillworker-swal-popup',
            confirmButton: 'skillworker-swal-confirm',
            title: 'skillworker-swal-title',
            content: 'skillworker-swal-content'
          },
          showClass: {
            popup: 'animate__animated animate__zoomIn'
          },
          hideClass: {
            popup: 'animate__animated animate__zoomOut'
          }
        })

        // Reset button after delay
        setTimeout(() => {
          $submitBtn.html('<i class="fas fa-paper-plane me-2"></i>Submit Review')
                   .removeClass('btn-success')
                   .addClass('btn-primary-custom')
                   .prop('disabled', false)
        }, 3000)

        // Optionally refresh the ratings display (if you want to show updated data immediately)
        // You could add a function here to re-fetch worker data to show updated ratings
      },
      error: (xhr, status, error) => {
        console.error("Error submitting review:", error, xhr.responseText)
        
        $submitBtn.html('<i class="fas fa-exclamation-triangle me-2"></i>Failed to Submit')
                 .removeClass('btn-primary-custom')
                 .addClass('btn-danger')
        
        let errorMessage = "Failed to submit review. Please try again."
        
        if (xhr.status === 400) {
          errorMessage = "Invalid review data. Please check your input and try again."
        } else if (xhr.status === 401) {
          errorMessage = "You must be logged in to submit a review."
        } else if (xhr.status === 403) {
          errorMessage = "You don't have permission to review this worker."
        } else if (xhr.status === 409) {
          errorMessage = "You have already reviewed this worker."
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message
        }
        
        showError(errorMessage)

        // Reset button after delay
        setTimeout(() => {
          $submitBtn.html('<i class="fas fa-paper-plane me-2"></i>Submit Review')
                   .removeClass('btn-danger')
                   .addClass('btn-primary-custom')
                   .prop('disabled', false)
        }, 3000)
      }
    })
  })

  // Prevent submit review button from triggering contact functionality
  $(document).on('click', '.submit-review-btn', function(e) {
    e.stopPropagation()
    // Let the form submit handler take care of this
    $(this).closest('form').trigger('submit')
    return false
  })

  // Add custom SweetAlert styling to match app theme
  const swalStyles = `
    <style>
      .skillworker-swal-popup {
        border-radius: 15px !important;
        font-family: 'Montserrat', 'Open Sans', sans-serif !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
      }
      
      .skillworker-swal-title {
        color: #023047 !important;
        font-weight: 600 !important;
        font-size: 1.5rem !important;
      }
      
      .skillworker-swal-content {
        color: #374151 !important;
        font-size: 1rem !important;
        line-height: 1.5 !important;
      }
      
      .skillworker-swal-confirm {
        background: linear-gradient(135deg, #023047 0%, #126E8C 100%) !important;
        border: none !important;
        border-radius: 10px !important;
        font-weight: 500 !important;
        padding: 10px 25px !important;
        transition: all 0.3s ease !important;
      }
      
      .skillworker-swal-confirm:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(2, 48, 71, 0.3) !important;
      }
      
      .skillworker-swal-cancel {
        background: linear-gradient(135deg, #6c757d 0%, #495057 100%) !important;
        border: none !important;
        border-radius: 10px !important;
        font-weight: 500 !important;
        padding: 10px 25px !important;
        transition: all 0.3s ease !important;
      }
      
      .skillworker-swal-cancel:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3) !important;
      }
      
      .swal2-timer-progress-bar {
        background: linear-gradient(90deg, #023047 0%, #126E8C 100%) !important;
      }
      
      .swal2-icon.swal2-success {
        border-color: #10b981 !important;
        color: #10b981 !important;
      }
      
      .swal2-icon.swal2-error {
        border-color: #ef4444 !important;
        color: #ef4444 !important;
      }
    </style>
  `
  
  $('head').append(swalStyles)
})
