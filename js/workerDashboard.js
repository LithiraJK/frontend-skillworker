
$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }

  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 is not loaded!')
    return
  }
  
  console.log('Worker dashboard initialized successfully')

  
  showLoadingAnimation()

  profileComplete()

  initializeDashboard()
  
  // Initialize navbar profile picture on page load
  updateNavbarProfilePicture() // Call with default first, will be updated when profileComplete() finishes

  $("#logoutBtn").click(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#155e75",
      cancelButtonColor: "#059669",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "modern-swal-popup",
        confirmButton: "modern-swal-confirm",
        cancelButton: "modern-swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        $.removeCookie("token", { path: "/" })
        $.removeCookie("refresh_token", { path: "/" })
        $.removeCookie("user_role", { path: "/" })
        $.removeCookie("userId", { path: "/" })
        $.removeCookie("profile_complete", { path: "/" })

        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "modern-swal-popup",
          },
        }).then(() => {
          window.location.href = "/pages/login-page.html"
        })
      }
    })
  })

  $(".nav-link").click(function (e) {
    // Only prevent default for section-based navigation within the same page
    const href = $(this).attr('href')
    
    // If it's an external page navigation, allow normal behavior
    if (href && (href.includes('.html') || href.startsWith('http'))) {
      return // Allow normal navigation
    }
    
    // For internal section navigation, prevent default
    e.preventDefault()

    $(".nav-link").removeClass("active")
    $(this).addClass("active")

    $(".dashboard-content").fadeOut(200)

    const targetSection = $(this).data("section")
    setTimeout(() => {
      $("#" + targetSection).fadeIn(300)
    }, 200)

    window.location.hash = $(this).attr("href")
  })

  $(".job-item button").click(function () {
    const jobTitle = $(this).closest(".job-item").find("h6").text()
    const button = $(this)

    Swal.fire({
      title: "Apply for Job",
      text: `Do you want to apply for "${jobTitle}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#155e75",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, apply!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "modern-swal-popup",
        confirmButton: "modern-swal-confirm",
        cancelButton: "modern-swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        button.html('<i class="fas fa-spinner fa-spin me-2"></i>Applying...').prop("disabled", true)

        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "Application Submitted!",
            text: "Your application has been sent to the client.",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "modern-swal-popup",
            },
          })

          button
            .removeClass("btn-outline-primary")
            .addClass("btn-success")
            .html('<i class="fas fa-check me-2"></i>Applied')
            .prop("disabled", true)
        }, 1000)
      }
    })
  })



  $('.card-body button:contains("Complete Profile")').click(() => {
    Swal.fire({
      icon: "info",
      title: "Complete Your Profile",
      text: "Redirecting to profile completion...",
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: "modern-swal-popup",
      },
    })
    window.location.href = "/pages/worker-profile-completion.html"
  })

  setTimeout(() => {
    if ($("#messages-section").is(":visible")) {
      showModernNotification("You have 2 new messages!", "info")
    }
  }, 3000)

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

  $(".profile-card, .welcome-card, .card").hover(
    function () {
      $(this).addClass("shadow-lg")
    },
    function () {
      $(this).removeClass("shadow-lg")
    },
  )

  hideLoadingAnimation()
})

// Function to update navbar profile picture (moved to global scope)
function updateNavbarProfilePicture(imageUrl) {
  const defaultImage = "/assets/images/workerDefualtPP.png"
  const profileImageUrl = imageUrl || defaultImage
  
  // Update navbar profile picture
  $('.navbar .profile-btn img').attr('src', profileImageUrl)
  
  console.log('Navbar profile picture updated:', profileImageUrl)
}

function initializeDashboard() {
  const workerId = $.cookie("userId")
  const token = $.cookie("token")

  // Check if tokenHandler is available (loaded via script tag)
  if (typeof window.tokenHandler !== 'undefined' && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn('Token refresh handler not available:', error)
    }
  }

  let userData = {}

  $.ajax({
    url: `http://localhost:8080/api/v1/user/getuser/${workerId}`,
    method: "GET",
    dataType: "json",
    headers: { Authorization: `Bearer ${token}` },
    async: false,
    success: (response) => {
      if (response.status === 200 && response.data) {
        userData = {
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
        }

      } else {
        console.warn("No user data found!")
      }
    },
    error: (xhr, status, error) => {
      console.error("Error fetching user data:", error)
      showModernNotification("Error loading user data", "error")
    },
  })


   


  console.log("User Info:", userData)

  if (userData.firstName) {
    $("#firstName").text(userData.firstName).hide().fadeIn(500)
    $("#userName").text(userData.firstName).hide().fadeIn(500)
  }
  if (userData.lastName) {
    $("#lastName").text(userData.lastName).hide().fadeIn(500)
  }
  if (userData.email) {
    $("#email").text(userData.email).hide().fadeIn(500)
  }

  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Authentication Required",
      text: "Please login to access the dashboard.",
      customClass: {
        popup: "modern-swal-popup",
      },
    }).then(() => {
      window.location.href = "../pages/login-page.html"
    })
    return
  }

  $('.nav-link[data-section="dashboard-section"]').addClass("active")
  $("#dashboard-section").show()
}


function profileComplete(){
  const workerId = $.cookie("userId")
  const token = $.cookie("token")

  if (!workerId || !token) {
    console.error("Missing workerId or token for profile completion check")
    return
  }

  $.ajax({
    url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
    method: "GET",
    dataType: "json",
    headers: { Authorization: `Bearer ${token}` },
    success: (response) => {
      if (response.status === 200 && response.data) {
        const workerData = {
          profilePictureUrl: response.data.profilePictureUrl || "/assets/images/workerDefualtPP.png",
          isProfileComplete: response.data.profileComplete,
          averageRating: response.data.averageRating,
          totalReviews: response.data.totalReviews,
        }        

        const isProfileComplete = workerData.isProfileComplete
        console.log("Is profile complete:", isProfileComplete)


        $('#profileImage').attr('src', workerData.profilePictureUrl)        
        
        // Update navbar profile picture
        updateNavbarProfilePicture(workerData.profilePictureUrl)        

        // Update average rating display
        if (workerData.averageRating !== null && workerData.averageRating !== undefined) {
          const formattedRating = parseFloat(workerData.averageRating).toFixed(1)
          $('#averageRating').text(formattedRating)
          $('.average-rating').text(formattedRating)
          console.log(`Average Rating: ${formattedRating}`)
        } else {
          $('#averageRating').text('No ratings yet')
          $('.average-rating').text('No ratings yet')
          console.log('No average rating available')
        }

        // Update total reviews count
        if (workerData.totalReviews !== null && workerData.totalReviews !== undefined) {
          $('#totalReviews').text(workerData.totalReviews)
          $('.total-reviews').text(workerData.totalReviews)
        }

        if (isProfileComplete) {
          updateProfileCompletionUI()
        }

      } else {
        console.warn("No worker data found!")
      }
    },
    error: (xhr, status, error) => {
      console.error("Error fetching worker data:", error)
    },
  })
}

function updateProfileCompletionUI() {
  $('.card-body:contains("Complete Profile")').each(function () {
    console.log("Found card body with Complete Profile text")

    $(this)
      .find('a:contains("Complete Profile")')
      .prop("disabled", true)
      .html('<i class="fas fa-check me-2"></i>Profile Completed')
      .off("click")
      .css("pointer-events", "none")

    $(this)
      .closest(".card")
      .find(".card-header h5")
      .html('<i class="fas fa-user-check me-2"></i>Professional Profile')

    const progressBar = $(this).find(".progress-bar")
    progressBar
      .animate({ width: "100%" }, 1000)
      .attr("aria-valuenow", "100")
      .text("100%")
      .removeClass("progress-bar-striped progress-bar-animated")

    $(this).find(".fas.fa-times.text-danger").removeClass("fa-times text-danger").addClass("fa-check text-success")
  })
}


function showModernNotification(message, type = "info") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "modern-toast-popup",
      timerProgressBar: "modern-timer-bar",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer)
      toast.addEventListener("mouseleave", Swal.resumeTimer)
    },
  })

  Toast.fire({
    icon: type,
    title: message,
  })
}

function showNotification(message, type = "info") {
  showModernNotification(message, type)
}

setInterval(() => {
  const earnings = Math.floor(Math.random() * 100) + 2450
  const earningsElement = $('.card-body h3:contains("$")')

  if (earningsElement.length) {
    earningsElement.fadeOut(200, function () {
      $(this)
        .text("$" + earnings.toLocaleString())
        .fadeIn(200)
    })
  }
}, 30000)

function showLoadingAnimation() {
  $("body").append(`
        <div id="loading-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="text-align: center; color: #0c4a6e;">
                <div class="spinner-border color: #0c4a6e mb-3" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden"></span>
                </div>
                <h5>Loading Dashboard...</h5>
            </div>
        </div>
    `)
}

function hideLoadingAnimation() {
  setTimeout(() => {
    $("#loading-overlay").fadeOut(500, function () {
      $(this).remove()
    })
  }, 1000)
}

const modernSwalStyles = `
    <style>
        .modern-swal-popup {
            border-radius: 16px !important;
            font-family: 'Open Sans', sans-serif !important;
        }
        
        .modern-swal-confirm {
            background: linear-gradient(135deg, #155e75 0%, #0891b2 100%) !important;
            border: none !important;
            border-radius: 10px !important;
            font-weight: 500 !important;
        }
        
        .modern-swal-cancel {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%) !important;
            border: none !important;
            border-radius: 10px !important;
            font-weight: 500 !important;
        }
        
        .modern-toast-popup {
            border-radius: 12px !important;
            font-family: 'Open Sans', sans-serif !important;
        }
        
        .modern-timer-bar {
            background: linear-gradient(90deg, #059669 0%, #10b981 100%) !important;
        }
    </style>
`

$("head").append(modernSwalStyles)

$(document).keydown((e) => {
  // Alt + D for Dashboard
  if (e.altKey && e.keyCode === 68) {
    e.preventDefault()
    $('.nav-link[data-section="dashboard-section"]').click()
  }

  // Alt + P for Profile
  if (e.altKey && e.keyCode === 80) {
    e.preventDefault()
    window.location.href = "/pages/worker-profile.html"
  }

  // Alt + L for Logout
  if (e.altKey && e.keyCode === 76) {
    e.preventDefault()
    $("#logoutBtn").click()
  }
})

$(window).scroll(function () {
  if ($(this).scrollTop() > 100) {
    if (!$("#scroll-to-top").length) {
      $("body").append(`
                <button id="scroll-to-top" style="
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #155e75 0%, #0891b2 100%);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(21, 94, 117, 0.3);
                    transition: all 0.3s ease;
                " title="Back to top">
                    <i class="fas fa-arrow-up"></i>
                </button>
            `)

      $("#scroll-to-top").click(() => {
        $("html, body").animate({ scrollTop: 0 }, 600)
      })

      $("#scroll-to-top").hover(
        function () {
          $(this).css("transform", "scale(1.1)")
        },
        function () {
          $(this).css("transform", "scale(1)")
        },
      )
    }
  } else {
    $("#scroll-to-top").remove()
  }
})
