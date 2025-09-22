const $ = window.$
const Swal = window.Swal
const bootstrap = window.bootstrap

$(document).ready(() => {
  if (typeof $ === "undefined") {
    console.error("jQuery is not loaded!")
    return
  }

  console.log("Modern ads overview page initialized successfully")

  const token = $.cookie("token")
  const workerId = $.cookie("userId")

  if (typeof window.tokenHandler !== "undefined" && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn("Token refresh handler not available:", error)
    }
  }

  console.log("Page loaded. Token:", token ? "Present" : "Missing", "WorkerId:", workerId)

  if ($("#adsTable").length === 0) {
    console.error('Table with id "adsTable" not found!')
  } else {
    console.log("Table found successfully")
  }


  let workerSubscriptionPlan = "FREE"
  let currentAdCount = 0
  let adLimits = {
    FREE: 1,
    PRO: 3,
    PREMIUM: 10 
  }

  setTimeout(() => {
    $("#adsTable").addClass("fade-in")
  }, 100)

  $('head').append(`
    <style>
      .verified-badge {
        color: #072552ff !important;
        filter: drop-shadow(0 0 2px rgba(13, 110, 253, 0.3));
        animation: verifiedPulse 2s infinite;
      }
      
      @keyframes verifiedPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .verified-worker-title {
        position: relative;
      }
      
      .verified-worker-title::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #03224fff, #6610f2, #0d6efd);
        border-radius: 1px;
        opacity: 0.3;
      }
      
      .subscription-info-verified {
        background: linear-gradient(135deg, rgba(13, 110, 253, 0.1), rgba(102, 16, 242, 0.1));
        border-radius: 8px;
        padding: 8px 12px;
        border: 1px solid rgba(13, 110, 253, 0.2);
      }
    </style>
  `)

  getAds()
  getWorkerSubscription()

  $("#adTitle").on("input", function () {
    const currentLength = $(this).val().trim().length
    const minLength = 10
    const maxLength = 100

    if (currentLength < minLength || currentLength > maxLength) {
      $(this).removeClass("is-valid").addClass("is-invalid")
      $(this)
        .next(".form-text")
        .text(`Title must be between ${minLength}-${maxLength} characters (current: ${currentLength})`)
    } else {
      $(this).removeClass("is-invalid").addClass("is-valid")
      $(this).next(".form-text").text("Perfect! Your title looks great.")
    }
  })

  $("#adDescription").on("input", function () {
    const currentLength = $(this).val().length
    const minLength = 50
    const maxLength = 1000

    if (currentLength < minLength || currentLength > maxLength) {
      $(this).removeClass("is-valid").addClass("is-invalid")
      $(this)
        .next(".form-text")
        .text(`Description must be between ${minLength}-${maxLength} characters (current: ${currentLength})`)
    } else {
      $(this).removeClass("is-invalid").addClass("is-valid")
      $(this).next(".form-text").text("Excellent description! This will help attract clients.")
    }
  })

  $("#startingPrice").on("input", function () {
    const value = Number.parseFloat($(this).val())

    if (isNaN(value) || value <= 0) {
      $(this).removeClass("is-valid").addClass("is-invalid")
      $(this).parent().next(".form-text").text("Please enter a valid price greater than 0")
    } else {
      $(this).removeClass("is-invalid").addClass("is-valid")
      $(this).parent().next(".form-text").text(`Starting price: Rs. ${value.toLocaleString()}`)
    }
  })

  $("#categoryId, #serviceAreas").on("change", function () {
    if ($(this).val()) {
      $(this).removeClass("is-invalid").addClass("is-valid")
    } else {
      $(this).removeClass("is-valid").addClass("is-invalid")
    }
  })

  $("#editAdTitle").on("input", function () {
    const currentLength = $(this).val().trim().length
    const minLength = 10
    const maxLength = 30

    if (currentLength < minLength || currentLength > maxLength) {
      $(this).removeClass("is-valid").addClass("is-invalid")
    } else {
      $(this).removeClass("is-invalid").addClass("is-valid")
    }
  })

  $("#editAdDescription").on("input", function () {
    const currentLength = $(this).val().length
    const minLength = 50
    const maxLength = 1000

    if (currentLength < minLength || currentLength > maxLength) {
      $(this).removeClass("is-valid").addClass("is-invalid")
    } else {
      $(this).removeClass("is-invalid").addClass("is-valid")
    }
  })

  $("#editStartingPrice").on("input", function () {
    const value = Number.parseFloat($(this).val())

    if (isNaN(value) || value <= 0) {
      $(this).removeClass("is-valid").addClass("is-invalid")
    } else {
      $(this).removeClass("is-invalid").addClass("is-valid")
    }
  })

  $("#editCategoryId, #editStatus").on("change", function () {
    if ($(this).val()) {
      $(this).removeClass("is-invalid").addClass("is-valid")
    } else {
      $(this).removeClass("is-valid").addClass("is-invalid")
    }
  })

  $("#saveAdBtn").on("click", () => {
    if (validateAdForm()) {
      createAd()
    }
  })

  $("#updateAdBtn").on("click", () => {
    if (validateEditAdForm()) {
      updateAd()
    }
  })

  function validateAdForm() {
    const title = $("#adTitle").val().trim()
    const description = $("#adDescription").val().trim()
    const startingPrice = $("#startingPrice").val()
    const categoryId = $("#categoryId").val()

    $(".form-control, .form-select").removeClass("is-invalid")

    if (!title || title.length < 10) {
      showError("Ad title must be at least 10 characters long")
      $("#adTitle").addClass("is-invalid").focus()
      return false
    }

    if (!description || description.length < 50) {
      showError("Description must be at least 50 characters long")
      $("#adDescription").addClass("is-invalid").focus()
      return false
    }

    if (!startingPrice || Number.parseFloat(startingPrice) <= 0) {
      showError("Please enter a valid starting price")
      $("#startingPrice").addClass("is-invalid").focus()
      return false
    }

    if (!categoryId) {
      showError("Please select a service category")
      $("#categoryId").addClass("is-invalid").focus()
      return false
    }

    return true
  }

  function validateEditAdForm() {
    const title = $("#editAdTitle").val().trim()
    const description = $("#editAdDescription").val().trim()
    const startingPrice = $("#editStartingPrice").val()
    const categoryId = $("#editCategoryId").val()
    const status = $("#editStatus").val()

    $("#editAdForm .form-control, #editAdForm .form-select").removeClass("is-invalid")

    if (!title || title.length < 10) {
      showError("Ad title must be at least 10 characters long")
      $("#editAdTitle").addClass("is-invalid").focus()
      return false
    }

    if (!description || description.length < 50) {
      showError("Description must be at least 50 characters long")
      $("#editAdDescription").addClass("is-invalid").focus()
      return false
    }

    if (!startingPrice || Number.parseFloat(startingPrice) <= 0) {
      showError("Please enter a valid starting price")
      $("#editStartingPrice").addClass("is-invalid").focus()
      return false
    }

    if (!categoryId) {
      showError("Please select a service category")
      $("#editCategoryId").addClass("is-invalid").focus()
      return false
    }

    return true
  }

  function createAd() {
    if (!token) {
      showError("Authentication token not found. Please login again.")
      return
    }

    const limitCheck = checkAdCreationLimit()
    if (!limitCheck.canCreate) {
      showUpgradePrompt(limitCheck.message)
      return
    }

    const formData = {
      title: $("#adTitle").val().trim(),
      description: $("#adDescription").val().trim(),
      startingPrice: Number.parseFloat($("#startingPrice").val()),
      status: "PENDING",
      categoryId: $("#categoryId").val(),
      workerId: workerId,
    }

    console.log(formData)

    $("#saveAdBtn").html('<span class="spinner-border spinner-border-sm me-2"></span>Creating your ad...')
    $("#saveAdBtn").prop("disabled", true)

    $.ajax({
      url: "http://localhost:8080/api/v1/ad/create",
      type: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify(formData),
      success: (response) => {
        console.log("Ad created successfully:", response)

        Swal.fire({
          title: "🎉 Success!",
          text: "Your ad has been created successfully and is pending approval.",
          icon: "success",
          confirmButtonColor: "#023047",
          confirmButtonText: "Great!",
          showClass: {
            popup: "animate__animated animate__fadeInUp",
          },
        }).then(() => {
          $("#createAdOffcanvas").find(":focus").blur()
          const offcanvasElement = document.getElementById("createAdOffcanvas")
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement)
          if (bsOffcanvas) {
            bsOffcanvas.hide()
          }
          $("body").addClass("fade-out")
          setTimeout(() => location.reload(), 300)
        })
      },
      error: (xhr, status, error) => {
        console.error("Failed to create ad:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          error: error,
        })

        let errorMessage = "Failed to create ad. Please try again."

        if (xhr.status === 401) {
          errorMessage = "Authentication failed. Please login again."
        } else if (xhr.status === 400) {
          errorMessage = "Invalid data provided. Please check your inputs."
        } else if (xhr.responseText) {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.message || errorResponse.error || errorMessage
          } catch (e) {}
        }

        showError(errorMessage)
      },
      complete: () => {
        $("#saveAdBtn").html('<i class="fas fa-save me-1"></i>Create Service')
        $("#saveAdBtn").prop("disabled", false)
      },
    })
  }

  function updateAd() {
    if (!token) {
      showError("Authentication token not found. Please login again.")
      return
    }

    const adId = $("#editAdId").val()
    const formData = {
      title: $("#editAdTitle").val().trim(),
      description: $("#editAdDescription").val().trim(),
      startingPrice: Number.parseFloat($("#editStartingPrice").val()),
      status: $("#editStatus").val(),
      categoryId: Number.parseInt($("#editCategoryId").val()),
      workerId: Number.parseInt(workerId),
    }

    console.log("Update data:", formData)

    $("#updateAdBtn").html('<span class="spinner-border spinner-border-sm me-2"></span>Updating your ad...')
    $("#updateAdBtn").prop("disabled", true)

    $.ajax({
      url: `http://localhost:8080/api/v1/ad/update/${adId}`,
      type: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify(formData),
      success: (response) => {
        console.log("Ad updated successfully:", response)

        Swal.fire({
          title: "🎉 Success!",
          text: "Your ad has been updated successfully.",
          icon: "success",
          confirmButtonColor: "#023047",
          confirmButtonText: "Great!",
          showClass: {
            popup: "animate__animated animate__fadeInUp",
          },
        }).then(() => {
          $("#editAdOffcanvas").find(":focus").blur()
          const offcanvasElement = document.getElementById("editAdOffcanvas")
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement)
          if (bsOffcanvas) {
            bsOffcanvas.hide()
          }
          getAds()
        })
      },
      error: (xhr, status, error) => {
        console.error("Failed to update ad:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          error: error,
        })

        let errorMessage = "Failed to update ad. Please try again."

        if (xhr.status === 401) {
          errorMessage = "Authentication failed. Please login again."
        } else if (xhr.status === 400) {
          errorMessage = "Invalid data provided. Please check your inputs."
        } else if (xhr.responseText) {
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.message || errorResponse.error || errorMessage
          } catch (e) {
            alert("Failed to parse error response.")
          }
        }

        showError(errorMessage)
      },
      complete: () => {
        $("#updateAdBtn").html('<i class="fas fa-save me-1"></i>Update Service')
        $("#updateAdBtn").prop("disabled", false)
      },
    })
  }

  function populateEditForm(adId) {
    if (!token) {
      showError("Authentication token not found. Please login again.")
      return
    }

    console.log("Fetching ad data for ID:", adId)

    $.ajax({
      url: `http://localhost:8080/api/v1/ad/get/${adId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        console.log("Ad data retrieved:", response)

        if (response && response.data) {
          const ad = response.data

          $("#editAdId").val(ad.id)
          $("#editAdTitle").val(ad.title)
          $("#editAdDescription").val(ad.description)
          $("#editStartingPrice").val(ad.startingPrice)
          $("#editStatus").val(ad.status)
          
          if (ad.categoryId) {
            $("#editCategoryId").val(ad.categoryId)
            if ($("#editCategoryId").hasClass("selectpicker")) {
              $("#editCategoryId").selectpicker("refresh")
            }
          }

          $("#editAdForm .form-control, #editAdForm .form-select").removeClass("is-valid is-invalid")

          const offcanvasElement = document.getElementById("editAdOffcanvas")
          const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement)
          bsOffcanvas.show()
        } else {
          showError("Failed to load ad data.")
        }
      },
      error: (xhr, status, error) => {
        console.error("Failed to fetch ad data:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          error: error,
        })

        let errorMessage = "Failed to load ad data."

        if (xhr.status === 401) {
          errorMessage = "Authentication failed. Please login again."
        } else if (xhr.status === 404) {
          errorMessage = "Ad not found."
        }

        showError(errorMessage)
      },
    })
  }

  function getAds() {
    if (!token) {
      showError("Authentication token not found. Please login again.")
      return
    }

    $("#adsTable tbody").empty()

    $("#adsTable tbody").html(`
            <tr>
                <td colspan="5" class="text-center py-5">
                    <div class="spinner-border text-primary me-2" role="status"></div>
                    <span class="text-muted">Loading your ads...</span>
                </td>
            </tr>
        `)

    $.ajax({
      url: `http://localhost:8080/api/v1/ad/getbyworker/${workerId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        console.log("API Response:", response)
        $("#adsTable tbody").empty()

        if (response && Array.isArray(response.data) && response.data.length > 0) {
          currentAdCount = response.data.length
          response.data.forEach((ad, index) => {
            let statusBadge = ""
            switch (ad.status) {
              case "ACTIVE":
                statusBadge = '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Active</span>'
                break
              case "PENDING":
                statusBadge = '<span class="badge bg-info"><i class="fas fa-clock me-1"></i>Pending</span>'
                break
              case "INACTIVE":
                statusBadge = '<span class="badge bg-secondary"><i class="fas fa-pause-circle me-1"></i>Inactive</span>'
                break
              default:
                statusBadge = `<span class="badge bg-dark">${ad.status}</span>`
            }

            const row = `
                            <tr class="fade-in" style="animation-delay: ${index * 0.1}s">
                                <td>
                                    <div class="fw-semibold text-primary">
                                      ${ad.title || "N/A"}${getVerifiedBadge()}
                                    </div>
                                    <small class="text-muted">Rs. ${ad.startingPrice ? Number.parseFloat(ad.startingPrice).toLocaleString() : "N/A"}</small>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border">${ad.categoryName || "N/A"}</span>
                                </td>
                                <td>
                                    <i class="fas fa-calendar-alt text-muted me-1"></i>
                                    ${ad.createdDate ? new Date(ad.createdDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td>${statusBadge}</td>
                                <td>
                                    <div class="dropdown">
                                        <button class="btn btn-secondary btn-sm dropdown-toggle" type="button"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fas fa-cog me-1"></i>Actions
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="#" onclick="previewAd(${ad.id})">
                                                <i class="fas fa-eye me-2"></i>Preview
                                            </a></li>
                                            <li><a class="dropdown-item" href="#editAdOffcanvas" onclick="editAd(${ad.id})">
                                                <i class="fas fa-edit me-2"></i>Edit
                                            </a></li>
                                            <li><hr class="dropdown-divider"></li>
                                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteAd(${ad.id})">
                                                <i class="fas fa-trash me-2"></i>Delete
                                            </a></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        `
            $("#adsTable tbody").append(row)
          })
        } else {
          currentAdCount = 0 // No ads found
          $("#adsTable tbody").html(`
                        <tr>
                            <td colspan="5" class="text-center py-5">
                                <div class="mb-3">
                                    <i class="fas fa-bullhorn fa-3x text-muted mb-3"></i>
                                    <h5 class="text-muted">No ads found</h5>
                                    <p class="text-muted">Start growing your business by creating your first ad!</p>
                                </div>
                                <button class="btn btn-primary" onclick="$('#createAdBtn').click()">
                                    <i class="fas fa-plus me-2"></i>Create Your First Ad
                                </button>
                            </td>
                        </tr>
                    `)
        }
        updateSubscriptionDisplay()
      },
      error: (xhr, status, error) => {
        console.error("Failed to retrieve ads:", {
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          error: error,
        })

        $("#adsTable tbody").empty()
        let errorMessage = "Failed to load ads."

        if (xhr.status === 401) {
          errorMessage = "Authentication failed. Please login again."
          $("#adsTable tbody").html(
            '<tr><td colspan="5" class="text-center text-danger">Authentication failed. <a href="/pages/login-page.html">Please login again</a></td></tr>',
          )
        } else {
          $("#adsTable tbody").html(
            `<tr><td colspan="5" class="text-center text-danger">${errorMessage} <button class="btn btn-sm btn-outline-primary ms-2" onclick="getAds()">Retry</button></td></tr>`,
          )
        }

        showError(errorMessage)
      },
    })
  }

  function getWorkerSubscription() {
    if (!token) {
      console.warn("Token not available for subscription check")
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
          // Map the API response to our internal plan format
          workerSubscriptionPlan = response.plan.toUpperCase()
          console.log("Updated subscription plan:", workerSubscriptionPlan)
        } else {
          console.warn("Invalid subscription response format:", response)
          workerSubscriptionPlan = "FREE"
        }
        updateSubscriptionDisplay()
      },
      error: (xhr, status, error) => {
        console.warn("Failed to fetch subscription data:", error)
        workerSubscriptionPlan = "FREE"
        updateSubscriptionDisplay()
      },
    })
  }

  function checkAdCreationLimit() {
    const limit = adLimits[workerSubscriptionPlan]
    
    if (currentAdCount >= limit) {
      let upgradeMessage = ""
      if (workerSubscriptionPlan === "FREE") {
        upgradeMessage = "Upgrade to Pro plan to create up to 3 ads, or Premium for up to 10 ads!"
      } else if (workerSubscriptionPlan === "PRO") {
        upgradeMessage = "Upgrade to Premium plan to create up to 10 ads!"
      }
      
      return {
        canCreate: false,
        message: `You've reached your ad limit (${currentAdCount}/${limit}). ${upgradeMessage}`,
        showUpgrade: true
      }
    }
    
    return { 
      canCreate: true, 
      message: `You can create ${limit - currentAdCount} more ad${limit - currentAdCount > 1 ? 's' : ''}.` 
    }
  }

  function updateSubscriptionDisplay() {
    const limit = adLimits[workerSubscriptionPlan]
    const limitText = limit
    const percentage = (currentAdCount / limit) * 100
    
    $("#currentPlan").text(workerSubscriptionPlan + " Plan")
    $("#adsUsed").text(currentAdCount)
    $("#adsLimit").text(limitText)
    $("#usageProgress").css("width", percentage + "%")
    
  
    const progressBar = $("#usageProgress")
    progressBar.removeClass("bg-success bg-warning bg-danger")
    if (percentage >= 90) {
      progressBar.addClass("bg-danger")
    } else if (percentage >= 70) {
      progressBar.addClass("bg-warning")
    } else {
      progressBar.addClass("bg-success")
    }
    
    if (workerSubscriptionPlan !== "PREMIUM") {
      $("#upgradeBtn").removeClass("d-none").on("click", function() {
        showUpgradePrompt(`Upgrade from ${workerSubscriptionPlan} plan to get more features!`)
      })
    } else {
      $("#upgradeBtn").addClass("d-none")
    }
    
    if ($("#subscriptionInfo").length === 0) {
      const isVerified = workerSubscriptionPlan === "PRO" || workerSubscriptionPlan === "PREMIUM"
      const containerClass = isVerified ? 'subscription-info-verified' : ''
      
      $(".ads-overview-container").append(`
        <div id="subscriptionInfo" class="mt-2 ${containerClass}">
          <small class="text-muted">
            <i class="fas fa-crown me-1"></i>
            ${getVerifiedBadge('sm').replace('ms-1', 'me-1')}<span id="planName">${workerSubscriptionPlan}</span> Plan | 
            <span id="adCount">${currentAdCount}</span>/<span id="adLimit">${limitText}</span> ads
            ${isVerified ? '<span class="badge bg-primary ms-2 px-2 py-1" style="font-size: 0.7rem;">✓ VERIFIED</span>' : ''}
          </small>
        </div>
      `)
    } else {
      const isVerified = workerSubscriptionPlan === "PRO" || workerSubscriptionPlan === "PREMIUM"
      const containerClass = isVerified ? 'subscription-info-verified' : ''
      
      $("#subscriptionInfo").removeClass('subscription-info-verified').addClass(containerClass)
      $("#planName").text(workerSubscriptionPlan)
      $("#adCount").text(currentAdCount)
      $("#adLimit").text(limitText)
      
      // Update the verified badge
      const subscriptionText = $("#subscriptionInfo small")
      subscriptionText.html(`
        <i class="fas fa-crown me-1"></i>
        ${getVerifiedBadge('sm').replace('ms-1', 'me-1')}<span id="planName">${workerSubscriptionPlan}</span> Plan | 
        <span id="adCount">${currentAdCount}</span>/<span id="adLimit">${limitText}</span> ads
        ${isVerified ? '<span class="badge bg-primary ms-2 px-2 py-1" style="font-size: 0.7rem;">✓ VERIFIED</span>' : ''}
      `)
    }
    
    const limitCheck = checkAdCreationLimit()
    const createBtn = $("#createAdBtn")
    
    if (!limitCheck.canCreate) {
      createBtn.addClass("disabled").attr("title", "Ad limit reached")
      createBtn.off("click").on("click", function(e) {
        e.preventDefault()
        showUpgradePrompt(limitCheck.message)
      })
    } else {
      createBtn.removeClass("disabled").removeAttr("title")
      createBtn.off("click")
    }
  }

  let upgradeModalTimeout = null

  function showUpgradePrompt(message) {
    // Debounce rapid calls
    if (upgradeModalTimeout) {
      clearTimeout(upgradeModalTimeout)
    }
    
    upgradeModalTimeout = setTimeout(() => {
      showUpgradePromptInternal(message)
      upgradeModalTimeout = null
    }, 100)
  }

  function showUpgradePromptInternal(message) {
    if ($("#upgradeModal").length > 0) {
      console.log("Upgrade modal already exists, preventing duplicate")
      return
    }

    let modalContent = ""
    let modalTitle = ""
    let confirmButtonText = ""
    
    if (workerSubscriptionPlan === "FREE") {
      modalTitle = "🚀 Upgrade Your Plan"
      confirmButtonText = "Choose Plan"
      modalContent = `
        <div class="text-start">
          <p class="mb-3 text-muted fs-6">${message}</p>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div class="card h-100 border-0 shadow-sm upgrade-card" style="transition: transform 0.2s ease;">
                <div class="card-header bg-gradient text-white text-center border-0 py-2" style="background: linear-gradient(135deg, #023047 0%, #126E8C 100%);">
                  <h6 class="mb-0 fw-bold fs-6">PRO Plan</h6>
                </div>
                <div class="card-body text-center p-3">
                  <h4 class="text-primary mb-1">$9.99</h4>
                  <small class="text-muted mb-3 d-block">/month</small>
                  <ul class="list-unstyled mt-2">
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>Up to 3 ads</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>24/7 support</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>Verified Badge</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>Priority listings</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="card h-100 border-0 shadow upgrade-card position-relative" style="transition: transform 0.2s ease; border: 2px solid #ffc107 !important;">
                <div class="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 rounded-bottom-start">
                  <small class="fw-bold" style="font-size: 0.7rem;">POPULAR</small>
                </div>
                <div class="card-header text-white text-center border-0 py-2" style="background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);">
                  <h6 class="mb-0 fw-bold text-dark fs-6">PREMIUM Plan</h6>
                </div>
                <div class="card-body text-center p-3">
                  <h4 class="text-warning mb-1">$19.99</h4>
                  <small class="text-muted mb-3 d-block">/month</small>
                  <ul class="list-unstyled mt-2">
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>Up to 10 ads</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>24/7 premium support</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>Verified Badge</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-check-circle text-success me-2 fs-6"></i>
                      <small>Featured listings</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    } else if (workerSubscriptionPlan === "PRO") {
      modalTitle = "⭐ Upgrade to Premium"
      confirmButtonText = "Upgrade to Premium"
      modalContent = `
        <div class="text-center">
          <p class="mb-3 text-muted fs-6">${message}</p>
          <div class="card border-0 shadow-lg upgrade-card position-relative" style="border: 2px solid #ffc107 !important;">
            <div class="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 rounded-bottom-start">
              <small class="fw-bold" style="font-size: 0.7rem;">RECOMMENDED</small>
            </div>
            <div class="card-header text-white text-center border-0 py-3" style="background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);">
              <h5 class="mb-0 fw-bold text-dark">PREMIUM Plan</h5>
            </div>
            <div class="card-body p-4">
              <h3 class="text-warning mb-2">$19.99</h3>
              <small class="text-muted mb-4 d-block">/month</small>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <ul class="list-unstyled">
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-layer-group text-success me-2 fs-6"></i>
                      <small>Up to 10 ad slots</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-star text-success me-2 fs-6"></i>
                      <small>Featured listings</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-headset text-success me-2 fs-6"></i>
                      <small>24/7 premium support</small>
                    </li>
                  </ul>
                </div>
                <div class="col-12 col-sm-6">
                  <ul class="list-unstyled">
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-chart-line text-success me-2 fs-6"></i>
                      <small>Advanced analytics</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-arrow-up text-success me-2 fs-6"></i>
                      <small>Priority in search</small>
                    </li>
                    <li class="mb-2 d-flex align-items-center">
                      <i class="fas fa-shield-alt text-success me-2 fs-6"></i>
                      <small>Verified Badge</small>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }

    // Ensure any existing modal is completely cleaned up
    const existingModal = document.getElementById('upgradeModal')
    if (existingModal) {
      const bsModal = bootstrap.Modal.getInstance(existingModal)
      if (bsModal) {
        bsModal.dispose()
      }
      existingModal.remove()
    }

    // Remove any lingering modal backdrops
    $('.modal-backdrop').remove()
    $('body').removeClass('modal-open')

    // Create the modal HTML with responsive, professional styling
    const modalHTML = `
      <div class="modal fade" id="upgradeModal" tabindex="-1" aria-labelledby="upgradeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px; overflow: hidden; max-height: 90vh;">
            <div class="modal-header border-0 py-3 px-4" style="background: linear-gradient(135deg, #023047 0%, #126E8C 100%);">
              <h5 class="modal-title text-white fw-bold d-flex align-items-center" id="upgradeModalLabel">
                <i class="fas fa-crown me-2 text-warning fs-6"></i>
                <span class="d-none d-sm-inline">${modalTitle}</span>
                <span class="d-sm-none">${modalTitle.replace('🚀 ', '').replace('⭐ ', '')}</span>
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-3 p-md-4" style="background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);">
              ${modalContent}
            </div>
            <div class="modal-footer border-0 py-3 px-3 px-md-4 d-flex flex-column flex-sm-row gap-2" style="background: #f8f9fa;">
              <button type="button" class="btn btn-outline-secondary order-2 order-sm-1" data-bs-dismiss="modal" style="border-radius: 8px; padding: 8px 16px;">
                <i class="fas fa-clock me-1 d-none d-sm-inline"></i>Maybe Later
              </button>
              <button type="button" class="btn order-1 order-sm-2 flex-fill flex-sm-grow-0" id="upgradeConfirmBtn" style="background: linear-gradient(135deg, #023047 0%, #126E8C 100%); border: none; color: white; border-radius: 8px; padding: 8px 16px; box-shadow: 0 2px 8px rgba(2, 48, 71, 0.3);">
                <i class="fas fa-rocket me-1"></i>${confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .upgrade-card {
          transition: all 0.2s ease;
        }
        
        .upgrade-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important;
        }
        
        .modal-content {
          backdrop-filter: blur(5px);
        }
        
        #upgradeConfirmBtn {
          transition: all 0.2s ease;
        }
        
        #upgradeConfirmBtn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(2, 48, 71, 0.4) !important;
        }
        
        .btn-outline-secondary:hover {
          transform: translateY(-1px);
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .modal.show .modal-dialog {
          animation: slideInUp 0.25s ease-out;
        }
        
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 0.5rem;
          }
          
          .modal-content {
            border-radius: 8px;
          }
          
          .upgrade-card:hover {
            transform: none;
          }
          
          .card-body {
            padding: 1rem !important;
          }
          
          h4, h3 {
            font-size: 1.2rem !important;
          }
          
          h5 {
            font-size: 1rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .row.g-3 > .col-12:not(:last-child) {
            margin-bottom: 0.5rem;
          }
        }
      </style>
    `

    $("body").append(modalHTML)

    setTimeout(() => {
      $("#upgradeConfirmBtn").off("click").on("click", function() {
        const $btn = $(this)
        const originalHtml = $btn.html()
        
        $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>Redirecting...').prop('disabled', true)
        
        setTimeout(() => {
          window.location.href = "../pages/subscription.html"
        }, 800)
      })

      const upgradeModal = new bootstrap.Modal(document.getElementById('upgradeModal'), {
        backdrop: 'static',
        keyboard: true
      })
      
      upgradeModal.show()

      $("#upgradeModal").off('hidden.bs.modal').on('hidden.bs.modal', function () {
        const modalElement = this
        const bsModal = bootstrap.Modal.getInstance(modalElement)
        
        if (bsModal) {
          bsModal.dispose()
        }
        
        $(modalElement).remove()
        
        $('.modal-backdrop').remove()
        $('body').removeClass('modal-open')
        
        console.log("Upgrade modal cleaned up successfully")
      })
    }, 10)
  }

  function loadCategories() {
    $.ajax({
      url: `http://localhost:8080/api/v1/category/worker/${workerId}/active`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        if (response && Array.isArray(response.data)) {
          const categoryDropdowns = ["#categoryId", "#editCategoryId"]
          
          categoryDropdowns.forEach(selector => {
            const $dropdown = $(selector)
            
            if ($dropdown.hasClass("selectpicker")) {
              $dropdown.selectpicker("destroy")
            }
            
            $dropdown.empty().append('<option value="">Select a category</option>')
            
            response.data.forEach((category) => {
              $dropdown.append($("<option>", {
                value: category.id,
                text: category.name,
              }))
            })
            
            $dropdown.selectpicker({
              liveSearch: true,
              style: 'btn-outline-secondary',
              size: 5
            })
          })
          
          console.log(`Loaded ${response.data.length} categories successfully`)
        } else {
          console.warn("No categories found or invalid response format")
          handleCategoryLoadError("No categories available")
        }
      },
      error: (xhr, status, error) => {
        console.error("Failed to load categories:", error)
        handleCategoryLoadError("Failed to load categories")
      },
    })
  }

  function handleCategoryLoadError(errorMessage) {
    const categoryDropdowns = ["#categoryId", "#editCategoryId"]
    
    categoryDropdowns.forEach(selector => {
      const $dropdown = $(selector)
      
      if ($dropdown.hasClass("selectpicker")) {
        $dropdown.selectpicker("destroy")
      }
      
      $dropdown.empty()
        .append('<option value="">Select a category</option>')
        .append(`<option value="" disabled>${errorMessage}</option>`)
      
      $dropdown.selectpicker({
        liveSearch: true,
        style: 'btn-outline-secondary',
        size: 5
      })
    })
  }

  function showError(message) {
    Swal.fire({
      title: "⚠️ Oops!",
      text: message,
      icon: "error",
      confirmButtonColor: "#023047",
      confirmButtonText: "Got it",
      showClass: {
        popup: "animate__animated animate__shakeX",
      },
    })
  }

  function getVerifiedBadge(size = 'sm', showText = false) {
    const isVerified = workerSubscriptionPlan === "PRO" || workerSubscriptionPlan === "PREMIUM"
    if (!isVerified) return ''
    
    const sizeClass = size === 'lg' ? 'fs-5' : size === 'md' ? 'fs-6' : ''
    const textContent = showText ? ' Verified' : ''
    
    return `<i class="fas fa-award verified-badge ms-1 ${sizeClass}" title="Verified ${workerSubscriptionPlan} Member">${textContent}</i>`
  }

  function resetForm() {
    $("#createAdForm")[0].reset()
    $(".form-control, .form-select").removeClass("is-valid is-invalid")
    $("#saveAdBtn").html('<i class="fas fa-save me-1"></i>Create Service')
    $("#saveAdBtn").prop("disabled", false)
  }

  function resetEditForm() {
    $("#editAdForm")[0].reset()
    $("#editAdForm .form-control, #editAdForm .form-select").removeClass("is-valid is-invalid")
    $("#updateAdBtn").html('<i class="fas fa-save me-1"></i>Update Service')
    $("#updateAdBtn").prop("disabled", false)
  }

  $("#createAdOffcanvas").on("hidden.bs.offcanvas", () => {
    resetForm()
  })

  $("#editAdOffcanvas").on("hidden.bs.offcanvas", () => {
    resetEditForm()
  })

  $("#createAdOffcanvas").on("shown.bs.offcanvas", function () {
    $(this).removeAttr("aria-hidden")
    $("#adTitle").focus()
  })

  $("#editAdOffcanvas").on("shown.bs.offcanvas", function () {
    $(this).removeAttr("aria-hidden")
    $("#editAdTitle").focus()
  })

  $("#createAdOffcanvas").on("show.bs.offcanvas", function () {
    $(this).removeAttr("aria-hidden")
  })

  $("#editAdOffcanvas").on("show.bs.offcanvas", function () {
    $(this).removeAttr("aria-hidden")
  })

  $("#createAdOffcanvas").on("hide.bs.offcanvas", function () {
    $(this).find(":focus").blur()
  })

  $("#editAdOffcanvas").on("hide.bs.offcanvas", function () {
    $(this).find(":focus").blur()
  })

  loadCategories()
  getWorkerSubscription() 

  window.getVerifiedBadge = getVerifiedBadge
  window.isVerifiedWorker = () => workerSubscriptionPlan === "PRO" || workerSubscriptionPlan === "PREMIUM" 

 
  window.previewAd = (adId) => {
    console.log("Preview ad:", adId)
    window.location.href = `../pages/ad-preview.html?adId=${adId}`
  }

  window.editAd = (adId) => {
    console.log("Edit ad:", adId)
    populateEditForm(adId)
  }

  window.deleteAd = (adId) => {
    console.log("Delete ad:", adId)
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: `http://localhost:8080/api/v1/ad/delete/${adId}`,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          success: (response) => {
            Swal.fire("Deleted!", "Your ad has been deleted.", "success")
            getAds() // Refresh the table
          },
          error: (xhr, status, error) => {
            Swal.fire("Error!", "Failed to delete the ad.", "error")
          },
        })
      }
    })
  }
})
