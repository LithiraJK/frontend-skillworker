
function showToast(message, type = "info") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: "border-0 shadow-lg",
      timerProgressBar: "bg-primary",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer)
      toast.addEventListener("mouseleave", Swal.resumeTimer)
    },
  })

  const iconMap = {
    success: "success",
    error: "error",
    warning: "warning",
    info: "info",
  }

  Toast.fire({
    icon: iconMap[type] || "info",
    title: message,
  })
}

$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 is not loaded!')
    return
  }
  
  console.log('Profile completion page initialized successfully')
  
  let currentStep = 1
  const totalSteps = $(".step").length
  let activeCategories = []
  let activeLocations = []

  const token = $.cookie("token")
  if (token && typeof window.tokenHandler !== 'undefined') {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn('Token refresh handler not available:', error)
    }
  }

  fetchActiveCategories()

  fetchActiveLocations()

  $(".selectpicker").selectpicker()

  $(".nextBtn").click(() => {
    const stepDiv = $(".step[data-step='" + currentStep + "']")

    clearValidationErrors()

    const validationResult = validateCurrentStep(currentStep)

    if (!validationResult.isValid) {
      showValidationErrors(validationResult.errors)
      return
    }

    stepDiv.removeClass("active")
    currentStep++
    $(".step[data-step='" + currentStep + "']").addClass("active")
    updateProgress()
    updateStepIndicator()
  })

  $(".prevBtn").click(() => {
    $(".step[data-step='" + currentStep + "']").removeClass("active")
    currentStep--
    $(".step[data-step='" + currentStep + "']").addClass("active")
    updateProgress()
    updateStepIndicator()
  })

  $("#addCategoryBtn").click(() => {
    const categoryCount = $(".category-item").length
    
    const maxCategories = 10

    if (categoryCount >= maxCategories) {
      Swal.fire({
        icon: "warning",
        title: "Maximum Categories Reached",
        text: `You have reached the maximum of ${maxCategories} categories.`,
        confirmButtonText: "Got it",
      })
      return
    }

    addNewCategory()
  })

  function addNewCategory() {
    const categoryCount = $(".category-item").length
    const newCategoryId = "category_" + (categoryCount + 1)

    const categoryHtml = `<div class="mb-3 category-item">
      <label class="form-label">Category ${String(categoryCount + 1).padStart(2, "0")}</label>
      <select class="form-select selectpicker categoryInput" id="${newCategoryId}" data-live-search="true" data-size="5" required>
        ${generateCategoryOptions()}
      </select>
      ${categoryCount > 0 ? '<button type="button" class="btn btn-sm btn-danger mt-2 removeCategoryBtn"><i class="fas fa-trash me-1"></i>Remove</button>' : ""}
    </div>`

    $("#categoryContainer").append(categoryHtml)

    $(`#${newCategoryId}`).selectpicker()

    console.log("New category dropdown added with ID:", newCategoryId)
    updateCategoryButton()
  }

  $(document).on("click", ".removeCategoryBtn", function () {
    const categoryItem = $(this).closest(".category-item")
    const selectElement = categoryItem.find(".selectpicker")
    const totalCategories = $(".category-item").length

    if (totalCategories <= 1) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Remove",
        text: "You must have at least one category selected.",
        confirmButtonText: "Understood",
      })
      return
    }

    Swal.fire({
      icon: "question",
      title: "Remove Category?",
      text: "Are you sure you want to remove this category?",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectElement.length) {
          selectElement.selectpicker("destroy")
        }

        categoryItem.remove()

        updateCategoryLabels()

        console.log("Category removed. Remaining categories:", $(".category-item").length)
        updateCategoryButton()

        Swal.fire({
          icon: "success",
          title: "Category Removed",
          text: "The category has been successfully removed.",
          timer: 1500,
          showConfirmButton: false,
        })
      }
    })
  })

  $("#addLocationBtn").click(() => {
    const locationCount = $(".location-item").length
    const newLocationId = "workingArea_" + (locationCount + 1)

    const locationHtml = `<div class="mb-3 location-item">
      <label class="form-label">Working Area ${locationCount + 1}</label>
      <select class="form-select selectpicker locationInput" id="${newLocationId}" data-live-search="true" data-size="5">
        ${generateLocationOptions()}
      </select>
      <button type="button" class="btn btn-sm btn-danger mt-2 removeLocationBtn">Remove</button>
    </div>`

    $("#locationContainer").append(locationHtml)

    $(`#${newLocationId}`).selectpicker()

    console.log("New location dropdown added with ID:", newLocationId)
  })

  $(document).on("click", ".removeLocationBtn", function () {
    const locationItem = $(this).closest(".location-item")
    const selectElement = locationItem.find(".selectpicker")

    if (selectElement.length) {
      selectElement.selectpicker("destroy")
    }

    locationItem.remove()

    if ($(".location-item").length === 0) {
      $("#addLocationBtn").click()
    }

    console.log("Location removed. Remaining locations:", $(".location-item").length)
  })

  function updateProgress() {
    const percent = (currentStep / totalSteps) * 100
    $("#wizardProgress").css("width", percent + "%")
  }

  function updateStepIndicator() {
    $(".step-indicator .step-item").each(function () {
      const step = $(this).data("step")
      $(this).removeClass("completed active")

      if (step < currentStep) {
        $(this).addClass("completed")
      } else if (step === currentStep) {
        $(this).addClass("active")
      }
    })

    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100
    $("#progressLine").css("width", progressPercent + "%")
  }

  async function fetchActiveCategories() {
    console.log("Fetching active categories from API...")

    $(".categoryInput").html('<option value="">Loading categories...</option>').selectpicker("refresh")

    console.log("Token available:", token ? "Yes" : "No")

    const headers = {
      "Content-Type": "application/json",
    }

    if (token && token !== "undefined" && token !== "null") {
      headers["Authorization"] = "Bearer " + token
      console.log("Adding Authorization header")
    } else {
      console.log("No token found, making request without authentication")
    }

    $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/v1/category/getactive",
      headers: headers,
      timeout: 10000,
      success: (response) => {
        console.log("Categories fetched successfully:", response)
        console.log("Response status:", response.status)
        console.log("Response message:", response.message)

        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          activeCategories = response.data
          console.log("Categories extracted from response.data:", activeCategories)
        } else if (Array.isArray(response)) {
          activeCategories = response
          console.log("Categories extracted as direct array:", activeCategories)
        } else {
          console.warn("Unexpected response format:", response)
          activeCategories = []
        }

        populateCategoryDropdowns()

        $(".retry-categories-container").remove()

      },
      error: (xhr, status, error) => {
        console.error("Failed to fetch categories:", error)
        console.error("Status:", status)
        console.error("Response:", xhr.responseText)

        showToast("Failed to load categories. Using default options.", "warning")

        activeCategories = [{ id: 1, name: "No Active Categories", status: "ACTIVE" }]

        console.log("Using fallback categories:", activeCategories)
        populateCategoryDropdowns()

        if ($(".category-item:first .retry-categories-btn").length === 0) {
          const retryHtml = `
            <div class="mt-2 retry-categories-container">
              <button type="button" class="btn btn-sm btn-outline-primary retry-categories-btn" onclick="fetchActiveCategories()">
                <i class="fas fa-refresh me-1"></i>Retry Loading Categories
              </button>
            </div>
          `
          $(".category-item:first").append(retryHtml)
        }
      },
    })
  }

  function populateCategoryDropdowns() {
    console.log("Populating category dropdowns with", activeCategories.length, "categories")
    console.log("Category data:", activeCategories)

    let optionsHtml = '<option value="">Select a Category</option>'

    if (activeCategories.length === 0) {
      optionsHtml = '<option value="">No categories available</option>'
    } else {
      activeCategories.forEach((category) => {
        const categoryId = category.id
        const categoryName = category.name
        const categoryDescription = category.description

        if (categoryName) {
          optionsHtml += `<option value="${categoryId}" title="${categoryDescription || ""}">${categoryName}</option>`
          console.log(`Added category: ID=${categoryId}, Name=${categoryName}`)
        }
      })
    }

    $(".categoryInput").each(function () {
      const currentValue = $(this).val()

      $(this).html(optionsHtml)

      if (currentValue && currentValue !== "Loading categories...") {
        $(this).val(currentValue)
      }

      $(this).selectpicker("refresh")
    })

    console.log("Category dropdowns populated successfully")

    if ($(".category-item").length === 0) {
      console.log("No category dropdowns found, adding initial category")
      addNewCategory()
    }

    if (activeCategories.length > 0) {
      console.log(`✅ ${activeCategories.length} active categories loaded successfully`)
    }
  }

  function generateCategoryOptions() {
    let optionsHtml = '<option value="">Select a Category</option>'

    activeCategories.forEach((category) => {
      const categoryId = category.id
      const categoryName = category.name

      if (categoryName) {
        optionsHtml += `<option value="${categoryId}" title="${categoryName || ""}">${categoryName}</option>`
      }
    })

    return optionsHtml
  }

  async function fetchActiveLocations() {
    console.log("Fetching active locations from API...")

    $(".locationInput").html('<option value="">Loading locations...</option>').selectpicker("refresh")

    console.log("Token available for locations:", token ? "Yes" : "No")

    const headers = {
      "Content-Type": "application/json",
    }

    if (token && token !== "undefined" && token !== "null") {
      headers["Authorization"] = "Bearer " + token
      console.log("Adding Authorization header for locations")
    } else {
      console.log("No token found, making location request without authentication")
    }

    $.ajax({
      type: "GET",
      url: "http://localhost:8080/api/v1/location/getactive",
      headers: headers,
      timeout: 10000,
      success: (response) => {
        console.log("Locations fetched successfully:", response)
        console.log("Response status:", response.status)
        console.log("Response message:", response.message)

        if (response.status === 200 && response.data && Array.isArray(response.data)) {
          activeLocations = response.data
          console.log("Locations extracted from response.data:", activeLocations)
        } else if (Array.isArray(response)) {
          activeLocations = response
          console.log("Locations extracted as direct array:", activeLocations)
        } else {
          console.warn("Unexpected location response format:", response)
          activeLocations = []
        }

        populateLocationDropdowns()

        $(".retry-locations-container").remove()

      },
      error: (xhr, status, error) => {
        console.error("Failed to fetch locations:", error)
        console.error("Status:", status)
        console.error("Response:", xhr.responseText)

        showToast("Failed to load locations. Using default options.", "warning")

        activeLocations = [{ location_id: 1, district: "No Active District", active: true }]

        console.log("Using fallback locations:", activeLocations)
        populateLocationDropdowns()

        if ($(".location-item:first .retry-locations-btn").length === 0) {
          const retryHtml = `
            <div class="mt-2 retry-locations-container">
              <button type="button" class="btn btn-sm btn-outline-primary retry-locations-btn" onclick="fetchActiveLocations()">
                <i class="fas fa-refresh me-1"></i>Retry Loading Locations
              </button>
            </div>
          `
          $(".location-item:first").append(retryHtml)
        }
      },
    })
  }

  function populateLocationDropdowns() {
    console.log("Populating location dropdowns with", activeLocations.length, "locations")
    console.log("Location data:", activeLocations)

    let optionsHtml = '<option value="">Select a District</option>'

    if (activeLocations.length === 0) {
      optionsHtml = '<option value="">No locations available</option>'
    } else {
      activeLocations.forEach((location) => {
        const locationId = location.location_id
        const locationName = location.district

        if (locationName) {
          optionsHtml += `<option value="${locationId}">${locationName}</option>`
          console.log(`Added location: ID=${locationId}, Name=${locationName}`)
        }
      })
    }

    $(".locationInput").each(function () {
      const currentValue = $(this).val()

      $(this).html(optionsHtml)

      if (currentValue && currentValue !== "Loading locations...") {
        $(this).val(currentValue)
      }

      $(this).selectpicker("refresh")
    })

    console.log("Location dropdowns populated successfully")

    // Ensure at least one location dropdown exists  
    if ($(".location-item").length === 0) {
      console.log("No location dropdowns found, adding initial location")
      const locationCount = $(".location-item").length
      const newLocationId = "workingArea_" + (locationCount + 1)

      const locationHtml = `<div class="mb-3 location-item">
        <label class="form-label">Working Area ${locationCount + 1}</label>
        <select class="form-select selectpicker locationInput" id="${newLocationId}" data-live-search="true" data-size="5">
          ${generateLocationOptions()}
        </select>
      </div>`

      $("#locationContainer").append(locationHtml)
      $(`#${newLocationId}`).selectpicker()
      console.log("Initial location dropdown added with ID:", newLocationId)
    }

    if (activeLocations.length > 0) {
      console.log(`✅ ${activeLocations.length} active locations loaded successfully`)
    }
  }

  function generateLocationOptions() {
    let optionsHtml = '<option value="">Select a District</option>'

    activeLocations.forEach((location) => {
      const locationId = location.location_id
      const locationName = location.district

      if (locationName) {
        optionsHtml += `<option value="${locationId}">${locationName}</option>`
      }
    })

    return optionsHtml
  }

  function updateCategoryButton() {
    const categoryCount = $(".category-item").length
    const maxCategories = 10

    if (categoryCount >= maxCategories) {
      $("#addCategoryBtn")
        .prop("disabled", true)
        .removeClass("btn-outline-dark")
        .addClass("btn-secondary")
        .html('<i class="fa-solid fa-ban me-1"></i>Maximum Reached')
    } else {
      $("#addCategoryBtn")
        .prop("disabled", false)
        .removeClass("btn-secondary")
        .addClass("btn-outline-dark")
        .html('<i class="fa-solid fa-plus me-1"></i>Add Category')
    }

    const currentText = $("#addCategoryBtn").text()
    if (categoryCount > 0 && !$("#addCategoryBtn").prop("disabled")) {
      if (!currentText.includes("Add Another")) {
        $("#addCategoryBtn").html('<i class="fa-solid fa-plus me-1"></i>Add Another Category')
      }
    }
  }

  function updateCategoryLabels() {
    $(".category-item").each(function (index) {
      const label = $(this).find(".form-label")
      label.text(`Category ${String(index + 1).padStart(2, "0")}`)
    })
  }

  // Form Validation Functions
  function validateCurrentStep(step) {
    const errors = []

    switch (step) {
      case 1:
        return validateStep1()
      case 2:
        return validateStep2()
      case 3:
        return validateStep3()
      case 4:
        return validateStep4()
      default:
        return { isValid: true, errors: [] }
    }
  }

  function validateStep1() {
    const errors = []

    const phone1 = $("#phone1").val().trim()
    if (!phone1) {
      errors.push({
        field: "phone1",
        message: "Mobile number is required",
      })
    } else if (!isValidPhoneNumber(phone1)) {
      errors.push({
        field: "phone1",
        message: "Please enter a valid mobile number (10 digits)",
      })
    }

    const phone2 = $("#phone2").val().trim()
    if (phone2 && !isValidPhoneNumber(phone2)) {
      errors.push({
        field: "phone2",
        message: "Please enter a valid phone number (10 digits)",
      })
    }

    const experience = $("#experience").val().trim()
    if (!experience) {
      errors.push({
        field: "experience",
        message: "Experience is required",
      })
    } else if (!isValidExperience(experience)) {
      errors.push({
        field: "experience",
        message: "Please enter experience in years (e.g., '2' , '10' )",
      })
    }

    const about = $("#about").val().trim()
    if (about && about.length > 1000) {
      errors.push({
        field: "about",
        message: "About section cannot exceed 1000 characters",
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  function validateStep2() {
    const errors = []

    const categoryCount = $(".category-item").length
    if (categoryCount === 0) {
      errors.push({
        field: "categories",
        message: "Please add at least one category",
      })
      return { isValid: false, errors: errors }
    }

    let categorySelected = false
    $(".category-item select").each(function () {
      if ($(this).val() !== "" && $(this).val() !== null) {
        categorySelected = true
      }
    })

    if (!categorySelected) {
      errors.push({
        field: "categories",
        message: "Please select at least one category from the dropdown",
      })
    }

    const skills = $("#skills").val().trim()
    if (skills && !isValidSkillsFormat(skills)) {
      errors.push({
        field: "skills",
        message: "Please enter skills separated by commas (e.g., 'Plumbing, Electrical Work')",
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  function validateStep3() {
    const errors = []

    const locationCount = $(".location-item").length
    if (locationCount === 0) {
      errors.push({
        field: "locations",
        message: "Please add at least one service location",
      })
      return { isValid: false, errors: errors }
    }

    let locationSelected = false
    $(".location-item select").each(function () {
      if ($(this).val() !== "" && $(this).val() !== null) {
        locationSelected = true
      }
    })

    if (!locationSelected) {
      errors.push({
        field: "locations",
        message: "Please select at least one service location",
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  function validateStep4() {
    const errors = []

    const profilePicture = $("#profilePicture")[0]
    if (profilePicture && profilePicture.files.length > 0) {
      const file = profilePicture.files[0]

      if (!file.type.startsWith("image/")) {
        errors.push({
          field: "profilePicture",
          message: "Please select a valid image file",
        })
      } else if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        errors.push({
          field: "profilePicture",
          message: "Image file size must be less than 2MB",
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }

  function isValidPhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, "")
    return /^0?[7][0-9]{8}$/.test(cleanPhone) || /^[0-9]{10}$/.test(cleanPhone)
  }

  function isValidExperience(experience) {
    return /^\d+$/.test(experience.trim())
  }

  function isValidSkillsFormat(skills) {
    const skillArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
    return skillArray.length > 0 && skillArray.every((skill) => skill.length >= 2)
  }

  function clearValidationErrors() {
    $(".form-control, .form-select").removeClass("is-invalid")
    $(".invalid-feedback").remove()
    $(".alert-danger").remove()
  }

  function showValidationErrors(errors) {
    clearValidationErrors()

    errors.forEach((error) => {
      const field = $("#" + error.field)

      if (field.length > 0) {
        field.addClass("is-invalid")
        field.closest(".form-group, .mb-3").addClass("has-error")

        const errorHtml = `<div class="invalid-feedback d-flex align-items-center">
          <i class="fas fa-exclamation-circle me-2"></i>${error.message}
        </div>`
        field.after(errorHtml)
      } else if (error.field === "categories" || error.field === "locations") {
        const container = error.field === "categories" ? "#categoryContainer" : "#locationContainer"
        const alertHtml = `<div class="alert alert-danger alert-dismissible fade show mt-2" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>${error.message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`
        $(container).before(alertHtml)
      }
    })

    if (errors.length > 1) {
      Swal.fire({
        icon: "error",
        title: "Please Complete Required Fields",
        html: `<div class="text-start"><ul class="list-unstyled">${errors.map((error) => `<li class="mb-2"><i class="fas fa-times-circle text-danger me-2"></i>${error.message}</li>`).join("")}</ul></div>`,
        confirmButtonText: "Got it",
        confirmButtonColor: "#155e75",
        customClass: {
          popup: "border-0 shadow-lg",
          title: "text-primary",
          confirmButton: "btn-lg",
        },
      })
    }
  }

  $("#phone1, #phone2").on("blur", function () {
    const phone = $(this).val().trim()
    const fieldId = $(this).attr("id")

    if (phone && !isValidPhoneNumber(phone)) {
      $(this).addClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
      $(this).after(`<div class="invalid-feedback">Please enter a valid phone number (10 digits)</div>`)
    } else {
      $(this).removeClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  $("#experience").on("blur", function () {
    const experience = $(this).val().trim()

    if (experience && !isValidExperience(experience)) {
      $(this).addClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
      $(this).after(
        `<div class="invalid-feedback">Please enter experience in years (e.g., '2 years', '5', '1.5 years')</div>`,
      )
    } else {
      $(this).removeClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  $("#skills").on("blur", function () {
    const skills = $(this).val().trim()

    if (skills && !isValidSkillsFormat(skills)) {
      $(this).addClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
      $(this).after(`<div class="invalid-feedback">Please enter skills separated by commas</div>`)
    } else {
      $(this).removeClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  $("#phone1, #phone2").on("input", function () {
    const phone = $(this).val().trim()

    if (phone.length > 0) {
      $(this).removeClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  $(document).on("change", ".categoryInput", function () {
    const selectedValue = $(this).val()

    if (selectedValue && selectedValue !== "") {
      $(this).removeClass("is-invalid").addClass("is-valid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  $(document).on("change", ".locationInput", function () {
    const selectedValue = $(this).val()

    if (selectedValue && selectedValue !== "") {
      $(this).removeClass("is-invalid").addClass("is-valid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  $("#about").on("input", function () {
    const currentLength = $(this).val().length
    const maxLength = 1000
    const remaining = maxLength - currentLength

    $(this).siblings(".char-counter").remove()

    const counterClass = remaining < 100 ? "text-warning" : remaining < 50 ? "text-danger" : "text-muted"
    $(this).after(`<small class="char-counter ${counterClass}">${remaining} characters remaining</small>`)

    if (currentLength > maxLength) {
      $(this).addClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
      $(this).after(`<div class="invalid-feedback">Text cannot exceed ${maxLength} characters</div>`)
    } else {
      $(this).removeClass("is-invalid")
      $(this).siblings(".invalid-feedback").remove()
    }
  })

  window.fetchActiveCategories = fetchActiveCategories
  window.fetchActiveLocations = fetchActiveLocations

  $("#finishBtn").click((e) => {
    e.preventDefault()

    clearValidationErrors()

    const allValidationResults = []
    for (let step = 1; step <= 4; step++) {
      const result = validateCurrentStep(step)
      if (!result.isValid) {
        allValidationResults.push(...result.errors)
      }
    }

    if (allValidationResults.length > 0) {
      showValidationErrors(allValidationResults)
      Swal.fire({
        icon: "error",
        title: "Please Complete All Required Fields",
        html: `Found ${allValidationResults.length} validation error(s). Please review and correct them before submitting.`,
        confirmButtonText: "OK",
      })
      return
    }

    const userId = $.cookie("userId")

    const profileData = {
      phoneNumbers: [$("#phone1").val().trim(), $("#phone2").val().trim()].filter((phone) => phone),
      userId: userId,
      experienceYears: $("#experience").val().trim(),
      bio: $("#about").val().trim(),
      skills: $("#skills").val().trim()
        ? $("#skills")
            .val()
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill)
        : [],
      categoryIds: [],
      locationIds: [],
      profilePictureUrl: $("#profilePicture").data("uploaded-url") || $("#profilePreview").attr("src"),
    }

    $(".category-item select").each(function () {
      const categoryValue = $(this).val()
      if (categoryValue !== "" && categoryValue !== null) {
        profileData.categoryIds.push(categoryValue)
      }
    })

    $(".location-item select").each(function () {
      const locationValue = $(this).val()
      if (locationValue !== "" && locationValue !== null) {
        profileData.locationIds.push(locationValue)
      }
    })

    if (profileData.categoryIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Categories",
        text: "Please select at least one category before submitting.",
        confirmButtonText: "OK",
      })
      return
    }

    if (profileData.locationIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Service Areas",
        text: "Please select at least one service location before submitting.",
        confirmButtonText: "OK",
      })
      return
    }

    console.log("Profile Data to submit:", profileData)
    console.log("Selected categories:", profileData.categoryIds)
    console.log("Selected locations:", profileData.locationIds)

    const categoryText = profileData.categoryIds.length === 1 ? "category" : "categories"
    const locationText = profileData.locationIds.length === 1 ? "location" : "locations"

    $("#finishBtn").html('<span class="spinner-border spinner-border-sm"></span> Submitting...').prop("disabled", true)

    $.ajax({
      type: "POST",
      url: "http://localhost:8080/api/v1/worker/register",
      data: JSON.stringify(profileData),
      contentType: "application/json",
      headers: {
        Authorization: "Bearer " + $.cookie("token"),
      },
      success: (response) => {
        console.log("Profile saved successfully:", response)
        Swal.fire({
          icon: "success",
          title: "Profile Saved!",
          text: "Your profile has been completed successfully.",
        }).then(() => {
          window.location.href = "../pages/worker-dashboard.html"
        })
      },
      error: (xhr, status, error) => {
        console.error("Profile save failed:", error)

        let errorMessage = "Failed to save profile. Please try again."
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message
        } else if (xhr.status === 400) {
          errorMessage = "Invalid data provided. Please check your inputs."
        } else if (xhr.status === 401) {
          errorMessage = "Authentication failed. Please login again."
        } else if (xhr.status === 500) {
          errorMessage = "Server error occurred. Please try again later."
        }

        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: errorMessage,
        })

        $("#finishBtn").html("Finish").prop("disabled", false)
      },
    })

    Swal.fire({
      icon: "success",
      title: "Profile Completed!",
      html: `
        <div class="text-start">
          <p><strong>Summary:</strong></p>
          <ul>
            <li><strong>Mobile:</strong> ${profileData.phoneNumbers[0] || "Not provided"}</li>
            <li><strong>Experience:</strong> ${profileData.experienceYears}</li>
            <li><strong>Categories:</strong> ${profileData.categoryIds.length} ${categoryText} selected</li>
            <li><strong>Service Areas:</strong> ${profileData.locationIds.length} ${locationText} selected</li>
            <li><strong>Additional Skills:</strong> ${profileData.skills.length > 0 ? profileData.skills.join(", ") : "None specified"}</li>
          </ul>
          <p class="small text-muted">Check console for detailed data.</p>
        </div>
      `,
      confirmButtonText: "Continue to Dashboard",
      allowOutsideClick: false,
    }).then(() => {
      // window.location.href = '../pages/worker-dashboard.html';
    })
  })
})

let selectedFile = null

$("#profilePicture").on("change", function (e) {
  selectedFile = e.target.files[0]

  $(this).removeClass("is-invalid")
  $(this).siblings(".invalid-feedback").remove()

  if (selectedFile) {
    if (!selectedFile.type.startsWith("image/")) {
      $(this).addClass("is-invalid")
      $(this).after('<div class="invalid-feedback">Please select a valid image file (JPG, PNG, GIF, etc.)</div>')
      this.value = ""
      selectedFile = null
      return
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      $(this).addClass("is-invalid")
      $(this).after('<div class="invalid-feedback">File size must be less than 2MB</div>')
      this.value = ""
      selectedFile = null
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      $("#profilePreview").attr("src", evt.target.result)
    }
    reader.readAsDataURL(selectedFile)

    $(this).addClass("is-valid")
    $(this).after('<div class="valid-feedback">Image selected successfully! Click "Upload" to save.</div>')
  }
})
$("#uploadBtn").on("click", () => {
  const token = $.cookie("token")

  console.log("Token:", token ? "Found" : "Not found")

  $("#profilePicture").removeClass("is-invalid is-valid")
  $("#profilePicture").siblings(".invalid-feedback, .valid-feedback").remove()

  if (!selectedFile) {
    $("#profilePicture").addClass("is-invalid")
    $("#profilePicture").after('<div class="invalid-feedback">Please select an image first.</div>')
    return
  }

  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Authentication Error",
      text: "Authentication token not found. Please login again.",
      confirmButtonText: "OK",
    })
    return
  }

  var formData = new FormData()
  formData.append("profilePic", selectedFile)

  $.ajax({
    url: "http://localhost:8080/api/v1/image/upload",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    headers: {
      Authorization: "Bearer " + token,
    },
    beforeSend: () => {
      $("#uploadBtn").html('<span class="spinner-border spinner-border-sm"></span> Uploading...')
      $("#uploadBtn").prop("disabled", true)
    },
    success: (response) => {
      console.log("Upload success:", response)

      var imageUrl = response
      if (typeof response === "object") {
        imageUrl = response.data || response.url || response.imageUrl || response
      }

      $("#profilePreview").attr("src", imageUrl)
      $("#uploadBtn").html('<i class="bi bi-check-circle"></i> Uploaded')
      $("#uploadBtn").removeClass("btn-dark").addClass("btn-success")
      $("#uploadBtn").prop("disabled", false)

      $("#profilePicture").data("uploaded-url", imageUrl)
      $("#profilePicture").addClass("is-valid").removeClass("is-invalid")
      $("#profilePicture").siblings(".invalid-feedback").remove()
      $("#profilePicture").after('<div class="valid-feedback">Profile picture uploaded successfully!</div>')

      $.localStorage.setItem("profile-picture-url", imageUrl)

      showToast("Profile picture uploaded successfully!", "success")
    },
    error: (xhr, status, error) => {
      console.error("Upload failed:", {
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText,
        error: error,
      })

      var errorMessage = "Upload failed. Please try again."

      if (xhr.status === 401) {
        errorMessage = "Authentication failed. Please login again."
      } else if (xhr.status === 413) {
        errorMessage = "File too large. Please select a smaller image."
      } else if (xhr.status === 415) {
        errorMessage = "Invalid file type. Please select an image file."
      } else if (xhr.responseText) {
        try {
          var errorResponse = JSON.parse(xhr.responseText)
          errorMessage = errorResponse.message || errorResponse.error || errorMessage
        } catch (e) {}
      }

      $("#profilePicture").addClass("is-invalid").removeClass("is-valid")
      $("#profilePicture").siblings(".valid-feedback").remove()
      $("#profilePicture").after(`<div class="invalid-feedback">${errorMessage}</div>`)

      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: errorMessage,
        confirmButtonText: "OK",
      })

      $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload')
      $("#uploadBtn").removeClass("btn-success").addClass("btn-dark")
      $("#uploadBtn").prop("disabled", false)
    },
  })
})
