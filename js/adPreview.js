/* eslint-env jquery */
/* global $:readonly, jQuery:readonly */

// Declare jQuery variables
const $ = window.jQuery || window.$

$(document).ready(() => {
  // Check if required libraries are loaded
  if (typeof $ === "undefined") {
    console.error("jQuery is not loaded!")
    return
  }

  console.log("Ad preview page initialized successfully")

  const urlParams = new URLSearchParams(window.location.search)
  const adId = urlParams.get("adId")
  const token = $.cookie("token")

  // Check if tokenHandler is available (loaded via script tag)
  if (typeof window.tokenHandler !== "undefined" && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn("Token refresh handler not available:", error)
    }
  }

  if (!adId) {
    console.error("No ad ID provided in URL")
    showError("Invalid ad ID. Please return to the ads overview.", true)
    return
  }

  if (!token) {
    console.error("No token found")
    showError("Authentication required. Redirecting to login...", false)
    setTimeout(() => {
      window.location.href = "../pages/login-page.html"
    }, 2000)
    return
  }

  showLoading()

  let adData = {}
  let workerData = {}
  let userData = {}

  $.ajax({
    url: `http://localhost:8080/api/v1/ad/get/${adId}`,
    method: "GET",
    dataType: "json",
    headers: { Authorization: `Bearer ${token}` },
    success: (response) => {
      if (response.status === 200 && response.data) {
        adData = response.data
        console.log("Ad data loaded:", adData)

        if (adData.workerId) {
          fetchWorkerAndUserData(adData.workerId)
        } else {
          console.warn("No worker ID found in ad data")
          hideLoading()
          populateAdData()
        }
      } else {
        console.warn("No ad data found!")
        showError("Ad not found.", true)
      }
    },
    error: (xhr, status, error) => {
      console.error("Error fetching ad data:", error)
      let errorMessage = "Error loading ad data."
      let showBackButton = true

      if (xhr.status === 401) {
        errorMessage = "Authentication failed. Redirecting to login..."
        showBackButton = false
        setTimeout(() => {
          window.location.href = "../pages/login-page.html"
        }, 3000)
      } else if (xhr.status === 404) {
        errorMessage = "Ad not found."
      } else if (xhr.status >= 500) {
        errorMessage = "Server error. Please try again later."
      }

      showError(errorMessage, showBackButton)
    },
  })

  function showLoading() {
    $("#loadingSpinner").show()
    $(".container .row").hide()
  }

  function hideLoading() {
    $("#loadingSpinner").hide()
    $(".container .row").show()
  }

  function showError(message, showBackButton = true) {
    hideLoading()
    const backButton = showBackButton
      ? '<a href="../pages/ads-overview.html" class="btn btn-primary mt-3">← Back to Ads</a>'
      : ""
    $(".container").html(`
            <div class="alert alert-danger border-0 shadow-sm" style="border-radius: 12px;">
                <div class="d-flex align-items-center mb-3">
                    <i class="fas fa-exclamation-triangle text-danger me-3" style="font-size: 1.5rem;"></i>
                    <h4 class="mb-0">Oops! Something went wrong</h4>
                </div>
                <p class="mb-3">${message}</p>
                ${backButton}
            </div>
        `)
  }

  function fetchWorkerAndUserData(workerId) {
    let userDataLoaded = false
    let workerDataLoaded = false

    function checkAndPopulate() {
      if (userDataLoaded && workerDataLoaded) {
        hideLoading()
        populateAdData()
      }
    }

    $.ajax({
      url: `http://localhost:8080/api/v1/user/getuser/${workerId}`,
      method: "GET",
      dataType: "json",
      headers: { Authorization: `Bearer ${token}` },
      success: (response) => {
        if (response.status === 200 && response.data) {
          userData = {
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
          }
          console.log("User data loaded:", userData)
        }
        userDataLoaded = true
        checkAndPopulate()
      },
      error: (xhr, status, error) => {
        console.error("Error fetching user data:", error)
        userDataLoaded = true
        checkAndPopulate()
      },
    })

    $.ajax({
      url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
      method: "GET",
      dataType: "json",
      headers: { Authorization: `Bearer ${token}` },
      success: (response) => {
        if (response.status === 200 && response.data) {
          workerData = response.data
          console.log("Worker data loaded:", workerData)
        } else {
          console.warn("No worker data found!")
        }
        workerDataLoaded = true
        checkAndPopulate()
      },
      error: (xhr, status, error) => {
        console.error("Error fetching worker data:", error)
        workerDataLoaded = true
        checkAndPopulate()
      },
    })
  }

  function populateAdData() {
    if (adData.title) {
      $(".service-title").text(adData.title)
      document.title = `${adData.title} - SkillWorker`
    }

    const profilePicUrl = workerData.profilePictureUrl || "/assets/images/workerDefualtPP.png"
    $(".worker-avatar, .quick-contact-avatar, .profile-avatar").attr("src", profilePicUrl)

    const firstName = userData.firstName || ""
    const lastName = userData.lastName || ""
    const fullName = `${firstName} ${lastName}`.trim() || `Worker ${adData.workerId || "Unknown"}`
    $(".worker-name").text(fullName)

    if (adData.categoryName) {
      $(".worker-category").text(adData.categoryName)
    }

    if (adData.description) {
      $("#displayDescription").text(adData.description)
    } else {
      $("#displayDescription").text("No description available for this service.")
    }

    if (workerData.experienceYears) {
      $(".experience-number").text(workerData.experienceYears)
    } else {
      $(".experience-number").text("0")
    }

    if (workerData.locations && workerData.locations.length > 0) {
      const locationHtml = workerData.locations
        .map((loc) => `<span class="badge bg-light text-dark border me-2 mb-2">${loc.district}</span>`)
        .join("")
      $("#displayWorkingAreas").html(locationHtml)
    } else {
      $("#displayWorkingAreas").html('<span class="text-muted">Service areas not specified</span>')
    }

    const $skillsContainer = $(".skills-container")
    $skillsContainer.empty()

    if (workerData.skills && workerData.skills.length > 0) {
      workerData.skills.forEach((skill) => {
        $skillsContainer.append(`<span class="skill-tag">${skill}</span>`)
      })
    } else {
      $skillsContainer.append(`<span class="text-muted">No skills added</span>`)
    }

    if (adData.startingPrice) {
      $(".price-amount").text(`Rs.${adData.startingPrice}`)
    } else {
      $(".price-amount").text("Contact for pricing")
    }

    if (workerData.phoneNumbers && workerData.phoneNumbers.length > 0) {
      $("#displayMobile").text(workerData.phoneNumbers[0])
      if (workerData.phoneNumbers[1]) {
        $("#displayHomeWork").text(workerData.phoneNumbers[1])
      } else {
        $("#displayHomeWork").text(workerData.phoneNumbers[0])
      }

      $(".contact-btn").each(function (index) {
        $(this).attr("href", `tel:${workerData.phoneNumbers[index] || workerData.phoneNumbers[0]}`)
      })
    } else {
      $("#displayMobile, #displayHomeWork").text("Contact via platform")

      $(".contact-btn")
        .addClass("disabled")
        .attr("href", "#")
        .click((e) => {
          e.preventDefault()
          alert("Phone number not available. Please contact via the platform.")
        })
    }
  }

  $(".star-rating i").click(function () {
    const rating = $(this).data("rating")
    $(".star-rating i").removeClass("active")
    $(".star-rating i").each(function () {
      if ($(this).data("rating") <= rating) {
        $(this).addClass("active")
      }
    })
  })

  $(".review-form").submit((e) => {
    e.preventDefault()
    // Add review submission logic here
    alert("Review submitted successfully!")
  })

  // Handle View Profile button click
  $("#viewProfileBtn").click((e) => {
    e.preventDefault()
    if (adData.workerId) {
      window.location.href = `../pages/worker-profile-preview.html?workerId=${adData.workerId}`
    } else {
      alert("Worker profile not available")
    }
  })
})
