const $ = window.$
const Swal = window.Swal
const bootstrap = window.bootstrap

$(document).ready(() => {
  // Check if required libraries are loaded
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


  let workerSubscriptionPlan = "FREE" // Default plan
  let currentAdCount = 0
  let adLimits = {
    FREE: 1,
    PRO: 3,
    PREMIUM: -1 
  }

  setTimeout(() => {
    $("#adsTable").addClass("fade-in")
  }, 100)

  getAds()

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

    if (!status) {
      showError("Please select a status")
      $("#editStatus").addClass("is-invalid").focus()
      return false
    }

    return true
  }

  function createAd() {
    if (!token) {
      showError("Authentication token not found. Please login again.")
      return
    }

    // Check ad creation limit before proceeding
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
          getAds() // Refresh the table
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
        // Reset button state
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
          
          // Set category after categories are loaded
          if (ad.categoryId) {
            $("#editCategoryId").val(ad.categoryId)
            if ($("#editCategoryId").hasClass("selectpicker")) {
              $("#editCategoryId").selectpicker("refresh")
            }
          }

          $("#editAdForm .form-control, #editAdForm .form-select").removeClass("is-valid is-invalid")

          // Show the offcanvas
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
          currentAdCount = response.data.length // Update current ad count
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
                                    <div class="fw-semibold text-primary">${ad.title || "N/A"}</div>
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
        updateSubscriptionDisplay() // Update the subscription display after loading ads
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
      url: `http://localhost:8080/api/v1/worker/subscription/${workerId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        console.log("Subscription data:", response)
        if (response && response.data) {
          workerSubscriptionPlan = response.data.planType || "FREE"
        }
        updateSubscriptionDisplay()
      },
      error: (xhr, status, error) => {
        console.warn("Failed to fetch subscription data:", error)
        // Default to FREE plan if subscription data is not available
        workerSubscriptionPlan = "FREE"
        updateSubscriptionDisplay()
      },
    })
  }

  function checkAdCreationLimit() {
    const limit = adLimits[workerSubscriptionPlan]
    
    if (limit === -1) {
      return { canCreate: true, message: "" } // Unlimited for premium
    }
    
    if (currentAdCount >= limit) {
      let upgradeMessage = ""
      if (workerSubscriptionPlan === "FREE") {
        upgradeMessage = "Upgrade to Pro plan to create up to 3 ads, or Premium for unlimited ads!"
      } else if (workerSubscriptionPlan === "PRO") {
        upgradeMessage = "Upgrade to Premium plan for unlimited ad creation!"
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
    const limitText = limit === -1 ? "∞" : limit
    const percentage = limit === -1 ? 0 : (currentAdCount / limit) * 100
    
    // Update the plan card
    $("#currentPlan").text(workerSubscriptionPlan + " Plan")
    $("#adsUsed").text(currentAdCount)
    $("#adsLimit").text(limitText)
    $("#usageProgress").css("width", percentage + "%")
    
    // Update progress bar color based on usage
    const progressBar = $("#usageProgress")
    progressBar.removeClass("bg-success bg-warning bg-danger")
    if (percentage >= 90) {
      progressBar.addClass("bg-dark")
    } else if (percentage >= 70) {
      progressBar.addClass("bg-warning")
    } else {
      progressBar.addClass("bg-success")
    }
    
    // Show/hide upgrade button
    if (workerSubscriptionPlan !== "PREMIUM") {
      $("#upgradeBtn").removeClass("d-none").on("click", function() {
        showUpgradePrompt(`Upgrade from ${workerSubscriptionPlan} plan to get more features!`)
      })
    } else {
      $("#upgradeBtn").addClass("d-none")
    }
    
    // Update the subscription info in the header (keep the old one for backward compatibility)
    if ($("#subscriptionInfo").length === 0) {
      $(".ads-overview-container").append(`
        <div id="subscriptionInfo" class="mt-2">
          <small class="text-muted">
            <i class="fas fa-crown me-1"></i>
            <span id="planName">${workerSubscriptionPlan}</span> Plan | 
            <span id="adCount">${currentAdCount}</span>/<span id="adLimit">${limitText}</span> ads
          </small>
        </div>
      `)
    } else {
      $("#planName").text(workerSubscriptionPlan)
      $("#adCount").text(currentAdCount)
      $("#adLimit").text(limitText)
    }
    
    // Update the create button state
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

  function showUpgradePrompt(message) {
    let upgradeOptions = {}
    
    if (workerSubscriptionPlan === "FREE") {
      upgradeOptions = {
        title: "🚀 Upgrade Your Plan",
        html: `
          <div class="text-start">
            <p>${message}</p>
            <div class="row mt-4 p-3">
              <div class="col-6">
                <div class="card border-dark">
                  <div class="card-header bg-secondary text-white text-center">
                    <h6 class="mb-0 text-dark">PRO Plan</h6>
                  </div>
                  <div class="card-body text-center">
                    <h4 class="text-dark">$9.99<small class="text-muted">/month</small></h4>
                    <ul class="list-unstyled mt-3">
                      <li><i class="fas fa-check text-success"></i> Up to 3 ads</li>
                      <li><i class="fas fa-check text-success"></i> 24/7 support</li>
                      <li><i class="fas fa-check text-success"></i> Verified Batch</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="card border-warning">
                  <div class="card-header bg-warning text-dark text-center">
                    <h6 class="mb-0">PREMIUM Plan</h6>
                  </div>
                  <div class="card-body text-center">
                    <h4 class="text-warning">$19.99<small class="text-muted">/month</small></h4>
                    <ul class="list-unstyled mt-3">
                      <li><i class="fas fa-check text-success"></i> Unlimited ads</li>
                      <li><i class="fas fa-check text-success"></i> 24/7 support</li>
                      <li><i class="fas fa-check text-success"></i> Verified Batch</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: "#023047",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Choose Plan",
        cancelButtonText: "Maybe Later",
      }
    } else if (workerSubscriptionPlan === "PRO") {
      upgradeOptions = {
        title: "⭐ Upgrade to Premium",
        html: `
          <div class="text-center">
            <p>${message}</p>
            <div class="card border-warning mt-3">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0">PREMIUM Plan</h5>
              </div>
              <div class="card-body">
                <h3 class="text-warning">$19.99<small class="text-muted">/month</small></h3>
                <ul class="list-unstyled mt-3">
                  <li><i class="fas fa-check text-success"></i> Unlimited ad creation</li>
                  <li><i class="fas fa-check text-success"></i> Featured listings</li>
                  <li><i class="fas fa-check text-success"></i> 24/7 premium support</li>
                  <li><i class="fas fa-check text-success"></i> Advanced analytics dashboard</li>
                  <li><i class="fas fa-check text-success"></i> Priority in search results</li>
                </ul>
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: "#023047",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Upgrade to Premium",
        cancelButtonText: "Maybe Later",
      }
    }

    Swal.fire({
      ...upgradeOptions,
      showClass: {
        popup: "animate__animated animate__fadeInUp",
      },
      customClass: {
        popup: 'swal-wide'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to subscription/pricing page
        window.location.href = "../pages/subscription.html" // You'll need to create this page
      }
    })
  }

  function loadCategories() {
    $.ajax({
      url: "http://localhost:8080/api/v1/category/getactive",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        if (response && Array.isArray(response.data)) {
          $("#categoryId").empty().append('<option value="">Select a category</option>')
          $("#editCategoryId").empty().append('<option value="">Select a category</option>')
          response.data.forEach((category) => {
            const option = $("<option>", {
              value: category.id,
              text: category.name,
            })
            $("#categoryId").append(option.clone())
            $("#editCategoryId").append(option.clone())
          })
          if ($("#categoryId").hasClass("selectpicker")) {
            $("#categoryId").selectpicker("refresh")
          } else {
            $("#categoryId").selectpicker()
          }
          if ($("#editCategoryId").hasClass("selectpicker")) {
            $("#editCategoryId").selectpicker("refresh")
          } else {
            $("#editCategoryId").selectpicker()
          }
        }
      },
      error: (xhr, status, error) => {
        console.error("Failed to load categories:", error)
        $("#categoryId").empty().append('<option value="">Select a category</option>')
        $("#categoryId").append('<option value="">Failed to load categories</option>')
        $("#editCategoryId").empty().append('<option value="">Select a category</option>')
        $("#editCategoryId").append('<option value="">Failed to load categories</option>')
        if ($("#categoryId").hasClass("selectpicker")) {
          $("#categoryId").selectpicker("refresh")
        }
        if ($("#editCategoryId").hasClass("selectpicker")) {
          $("#editCategoryId").selectpicker("refresh")
        }
      },
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
  getWorkerSubscription() // Fetch subscription info on page load

  // Action functions for table buttons
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
