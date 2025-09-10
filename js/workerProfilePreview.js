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
  
  // Get workerId from URL parameters, fallback to user's own ID if not provided
  const urlParams = new URLSearchParams(window.location.search)
  const workerId = urlParams.get('workerId') || $.cookie("userId")
  const apiUrl = `http://localhost:8080/api/v1/worker/getworker/${workerId}`
  const token = $.cookie("token")
  let userData = {}

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
  if (typeof window.tokenHandler !== 'undefined' && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
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

  showLoadingState()

  if (token) {
    tokenHandler.scheduleSilentRefresh(token)
  }

  // Fetch user data
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
      showError("Failed to load user information")
    },
  })

  // Fetch worker data
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

        // Display Name
        $("#displayFirstName").text(userData.firstName || "N/A")
        $("#displayLastName").text(userData.lastName || "")

        // Email
        $("#displayEmail").text(userData.email || "No email provided")

        // Category
        if (worker.categories && worker.categories.length > 0) {
          $("#displayCategory").html(`<strong>${worker.categories[0].name}</strong>`)
        } else {
          $("#displayCategory").html(`<strong>No Category</strong>`)
        }

        // Location
        if (worker.locations && worker.locations.length > 0) {
          const locationText = worker.locations.map((loc) => loc.district).join(", ")
          $("#displayLocation").html(`<i class="bi bi-geo-alt text-warning"></i> ${locationText}`)
        } else {
          $("#displayLocation").html(`<i class="bi bi-geo-alt text-warning"></i> Location not specified`)
        }

        // Experience
        $("#displayExperience").text(worker.experienceYears || 0)

        // Bio
        $("#displayBio").text(worker.bio || "No bio available")

        const $skillsContainer = $("#skillsContainer").next()
        $skillsContainer.empty()
        if (worker.skills && worker.skills.length > 0) {
          worker.skills.forEach((skill) => {
            $skillsContainer.append(`<span class="skill-badge">${skill}</span> `)
          })
        } else {
          $skillsContainer.append(`<span class="text-muted">No skills added</span>`)
        }

        $(".contact-card img").attr("src", profilePicUrl)
        $(".contact-card h6").text(`${userData.firstName || "Worker"} ${userData.lastName || ""}`)
        $(".contact-card small").text(worker.categories?.[0]?.name || "No Category")
      } else {
        console.warn("No worker data found!")
        showError("Worker profile not found")
      }
    },
    error: (xhr, status, error) => {
      hideLoadingState()
      console.error("Error fetching worker data:", error)
      showError("Failed to load worker profile")
    },
  })

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
    $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Connecting...')

    // Simulate contact action
    setTimeout(() => {
      $(this).html('<i class="fa-regular fa-paper-plane me-2"></i>Contact Me')
      // Add your contact logic here
    }, 2000)
  })

  $('.glass-card button:contains("Submit Review")').on("click", function (e) {
    e.preventDefault()

    const name = $(this).closest(".glass-card").find('input[placeholder="Name"]').val()
    const email = $(this).closest(".glass-card").find('input[placeholder="Email"]').val()
    const review = $(this).closest(".glass-card").find("textarea").val()

    if (!name || !email || !review) {
      showError("Please fill in all fields to submit your review")
      return
    }

    $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Submitting...')

    // Simulate review submission
    setTimeout(() => {
      $(this).html("Submit Review")
      $(this).closest(".glass-card").find("input, textarea").val("")

      // Show success message
      const successHtml = `
                <div class="alert alert-success glass-card" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    Thank you for your review! It has been submitted successfully.
                </div>
            `
      $(".container").prepend(successHtml)
      setTimeout(() => {
        $(".alert-success").fadeOut()
      }, 5000)
    }, 2000)
  })

  $(".star i").on("click", function () {
    const rating = $(this).parent().index() + 1
    $(this).parent().parent().find(".star i").removeClass("fa-solid").addClass("fa-regular")
    $(this)
      .parent()
      .parent()
      .find(".star:lt(" + rating + ") i")
      .removeClass("fa-regular")
      .addClass("fa-solid")
  })
})
