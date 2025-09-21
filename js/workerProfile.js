$(document).ready(() => {
  // Check if required libraries are loaded
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  if (typeof Cookies === 'undefined') {
    console.error('js-cookie library is not loaded!')
    return
  }
  
  console.log('Worker profile page initialized successfully')
  
  let skills = []
  let selectedFile = null
  const workerId = Cookies.get("userId")
  const token = Cookies.get("token")
  let userData = {}

  // Initialize token refresh handler
  if (typeof window.tokenHandler !== 'undefined' && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn('Token refresh handler not available:', error)
    }
  }

  // Function to update navbar profile picture
  function updateNavbarProfilePicture(imageUrl) {
    const defaultImage = "/assets/images/workerDefualtPP.png"
    const profileImageUrl = imageUrl || defaultImage
    
    // Update navbar profile picture
    $('.navbar .profile-btn img').attr('src', profileImageUrl)
    
    console.log('Navbar profile picture updated:', profileImageUrl)
  }

  if (workerId) {
    $("#previewProfileBtn").attr("href", `/pages/worker-profile-preview.html?workerId=${workerId}`)
  } else {
    console.warn("Worker ID not found in cookies")
    $("#previewProfileBtn").attr("href", "#").addClass("disabled")
  }

  if (typeof window.tokenHandler !== 'undefined' && token) {
    try {
      window.tokenHandler.scheduleSilentRefresh(token)
    } catch (error) {
      console.warn('Token refresh handler not available:', error)
    }
  }

  function showSuccessMessage(message) {
    const toast = $(`
            <div class="alert alert-success alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 350px; border-radius: 12px; 
                        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2); border: none;" role="alert">
                <div class="d-flex align-items-center">
                    <i class="bi bi-check-circle-fill me-3" style="font-size: 1.2rem; color: #10b981;"></i>
                    <div>
                        <strong>Success!</strong><br>
                        <small>${message}</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `)

    $("body").append(toast)

    setTimeout(() => {
      toast.addClass("animate__animated animate__fadeOutRight")
      setTimeout(() => toast.remove(), 500)
    }, 4000)
  }

  function showErrorMessage(message) {
    const toast = $(`
            <div class="alert alert-danger alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 350px; border-radius: 12px; 
                        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.2); border: none;" role="alert">
                <div class="d-flex align-items-center">
                    <i class="bi bi-exclamation-triangle-fill me-3" style="font-size: 1.2rem; color: #ef4444;"></i>
                    <div>
                        <strong>Error!</strong><br>
                        <small>${message}</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `)

    $("body").append(toast)

    setTimeout(() => {
      toast.addClass("animate__animated animate__fadeOutRight")
      setTimeout(() => toast.remove(), 500)
    }, 6000)
  }

  // Enhanced loading states
  function showLoadingState(element, text = "Loading...") {
    const $el = $(element)
    $el.data("original-html", $el.html())
    $el
      .html(`
            <span class="loading-spinner me-2"></span>
            ${text}
        `)
      .prop("disabled", true)
  }

  function hideLoadingState(element) {
    const $el = $(element)
    const originalHtml = $el.data("original-html")
    if (originalHtml) {
      $el.html(originalHtml).prop("disabled", false)
    }
  }

  function updateUserName(firstName, lastName, successCb) {
    $.ajax({
      url: `http://localhost:8080/api/v1/user/update/${workerId}`,
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      contentType: "application/json",
      data: JSON.stringify({ firstName, lastName }),
      success: () => {
        if (successCb) successCb()
        userData.firstName = firstName
        userData.lastName = lastName
        $("#displayName").text(firstName + " " + lastName)
        $("#displayFirstName").text(firstName)
        $("#displayLastName").text(lastName)
      },
      error: (xhr) => {
        console.error("Name update failed:", xhr.responseText)
        showErrorMessage("Failed to update name: " + (xhr.responseJSON?.message || xhr.responseText || "Unknown error"))
      },
    })
  }

  function fetchUserData() {
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
          }

          $("#displayFirstName").text(userData.firstName).addClass("fade-in")
          $("#displayLastName").text(userData.lastName)
          $("#displayEmail").text(userData.email).addClass("fade-in")
        } else {
          console.warn("No user data found!")
          showErrorMessage("Unable to load user profile data")
        }
      },
      error: (xhr, status, error) => {
        console.error("Error fetching user data:", error)
        showErrorMessage("Failed to load profile data. Please refresh the page.")
      },
    })
  }

  function escapeHtml(text) {
    return $("<div />").text(text).html()
  }

  // Enhanced skill rendering with animations
  function renderSkills() {
    const cont = $("#skillsContainer").empty()
    const existing = $("#existingSkills").empty()

    if (skills.length === 0) {
      cont.html(`
                <div class="empty-state">
                    <i class="bi bi-gear"></i>
                    <p>No skills added yet. Add your skills to showcase your expertise.</p>
                </div>
            `)
      existing.html('<div class="text-muted">No skills added yet.</div>')
      return
    }

    skills.forEach((s, idx) => {
      const badge = $(`
                <span class="skill-badge fade-in" data-index="${idx}" style="animation-delay: ${idx * 0.1}s">
                    <span class="skill-text">${escapeHtml(s)}</span>
                    <button type="button" class="remove-skill" title="Remove skill">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </span>`)
      cont.append(badge.clone(true))
      existing.append(badge)
    })
  }

  function closeOffcanvas(id) {
    const el = $("#" + id)[0]
    const instance = bootstrap.Offcanvas.getInstance(el)
    if (instance) instance.hide()
  }

  // Enhanced worker data loading
  function loadWorker() {
    fetchUserData()

    $.ajax({
      url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
      type: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: (res) => {
        const w = res.data

        // Update categories with animation
        const categoryNames = w.categories.map((cat) => cat.name)
        $("#displayCategory")
          .text(categoryNames.join(", ") || "Not specified")
          .addClass("fade-in")

        // Update other fields with animations
        $("#displayExperience, #displayExperience2")
          .text(w.experienceYears || 0)
          .addClass("fade-in")
        $("#displayAbout")
          .text(w.bio || "Tell clients about yourself and your experience...")
          .addClass("fade-in")

        // Update profile picture with loading state
        const profilePicUrl = w.profilePictureUrl || "/assets/images/workerDefualtPP.png"
        $("#profilePic, #profilePreview").attr("src", profilePicUrl)
        
        // Update navbar profile picture
        updateNavbarProfilePicture(profilePicUrl)

        // Update contact info
        $("#displayMobile")
          .text(w.phoneNumbers?.[0] || "Not provided")
          .addClass("fade-in")
        $("#displayHome")
          .text(w.phoneNumbers?.[1] || "Not provided")
          .addClass("fade-in")

        // Update location
        const allLocations = (w.locations || []).map((loc) => loc.district)
        $("#displayLocation")
          .text(allLocations.join(", ") || "Not specified")
          .addClass("fade-in")

        // Update skills
        skills = w.skills || []
        renderSkills()
      },
      error: (xhr) => {
        console.error("Failed to load worker", xhr.responseText)
        showErrorMessage("Failed to load worker profile. Please refresh the page.")
      },
    })
  }

  function updateWorker(data, successCb) {
    $.ajax({
      url: `http://localhost:8080/api/v1/worker/update/${workerId}`,
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      contentType: "application/json",
      data: JSON.stringify(data),
      success: () => {
        if (successCb) successCb()
        loadWorker()
        showSuccessMessage("Profile updated successfully!")
      },
      error: (xhr) => {
        console.error("Worker update failed:", xhr.responseText)
        showErrorMessage(
          "Failed to update profile: " + (xhr.responseJSON?.message || xhr.responseText || "Unknown error"),
        )
      },
    })
  }

  // Initialize profile loading
  loadWorker()
  
  // Initialize navbar profile picture on page load
  $(document).ready(() => {
    // Check if we have a stored profile picture URL or fetch it
    if (workerId && token) {
      // This will be updated when loadWorker() completes
      updateNavbarProfilePicture() // Call with default first
    }
  })

  // Enhanced skill removal with confirmation
  $(document).on("click", ".remove-skill", function (e) {
    e.stopPropagation()
    const $badge = $(this).closest(".skill-badge")
    const idx = $badge.data("index")
    const skillName = $badge.find(".skill-text").text()

    if (confirm(`Remove "${skillName}" from your skills?`)) {
      $badge.addClass("animate__animated animate__fadeOut")
      setTimeout(() => {
        if (idx !== undefined) {
          skills.splice(idx, 1)
          updateWorker({ skills: skills }, renderSkills)
        }
      }, 300)
    }
  })

  // Enhanced form submissions with loading states
  $("#formAbout").on("submit", function (e) {
    e.preventDefault()
    const $submitBtn = $(this).find('button[type="submit"]')
    showLoadingState($submitBtn, "Saving...")

    const text = $("#inputAbout").val().trim()
    updateWorker({ bio: text }, () => {
      $("#displayAbout").text(text)
      closeOffcanvas("offcanvasAbout")
      hideLoadingState($submitBtn)
    })
  })

  $("#formProfile").on("submit", function (e) {
    e.preventDefault()
    const $submitBtn = $(this).find('button[type="submit"]')
    showLoadingState($submitBtn, "Updating Profile...")

    const firstName = $("#inputFirstName").val().trim()
    const lastName = $("#inputLastName").val().trim()
    const location = $("#inputLocation").val().trim()
    const experience = Number.parseInt($("#inputExperience").val().trim()) || 0
    const uploadedUrl = $("#profilePicture").data("uploaded-url")

    // Enhanced validation
    if (!firstName || !lastName) {
      showErrorMessage("First Name and Last Name are required.")
      $("#inputFirstName").focus()
      hideLoadingState($submitBtn)
      return
    }

    if (firstName.length < 2 || lastName.length < 2) {
      showErrorMessage("First Name and Last Name must be at least 2 characters long.")
      hideLoadingState($submitBtn)
      return
    }

    if (experience < 0 || experience > 50) {
      showErrorMessage("Experience must be between 0 and 50 years.")
      $("#inputExperience").focus()
      hideLoadingState($submitBtn)
      return
    }

    updateUserName(firstName, lastName, () => {
      const workerData = {
        workerId: workerId,
        experienceYears: experience,
      }

      if (uploadedUrl) {
        workerData.profilePictureUrl = uploadedUrl
      }

      if (location) {
        workerData.locations = [{ district: location }]
      }

      updateWorker(workerData, () => {
        $("#displayName").text(firstName + " " + lastName)
        $("#displayLocation").text(location)
        $("#displayExperience, #displayExperience2").text(experience)
        if (uploadedUrl) {
          $("#profilePic").attr("src", uploadedUrl)
          // Update navbar profile picture when profile is updated
          updateNavbarProfilePicture(uploadedUrl)
        }

        Cookies.set("first_name", firstName, { path: "/" })
        Cookies.set("last_name", lastName, { path: "/" })

        closeOffcanvas("offcanvasProfile")
        hideLoadingState($submitBtn)
      })
    })
  })

  $("#formSkills").on("submit", function (e) {
    e.preventDefault()
    const $submitBtn = $(this).find('button[type="submit"]')
    showLoadingState($submitBtn, "Adding Skills...")

    const raw = $("#inputSkills").val().trim()
    if (raw) {
      const parts = raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
      const newSkills = parts.filter((p) => !skills.includes(p))

      if (newSkills.length === 0) {
        showErrorMessage("All entered skills already exist in your profile.")
        hideLoadingState($submitBtn)
        return
      }

      skills.push(...newSkills)
    }
    $("#inputSkills").val("")

    updateWorker({ skills: skills }, () => {
      renderSkills()
      closeOffcanvas("offcanvasSkills")
      hideLoadingState($submitBtn)
    })
  })

  $("#formContact").on("submit", function (e) {
    e.preventDefault()
    const $submitBtn = $(this).find('button[type="submit"]')
    showLoadingState($submitBtn, "Updating Contact...")

    const mobile = $("#inputMobile").val().trim()
    const home = $("#inputHome").val().trim()

    updateWorker({ phoneNumbers: [mobile, home] }, () => {
      $("#displayMobile").text(mobile || "Not provided")
      $("#displayHome").text(home || "Not provided")
      closeOffcanvas("offcanvasContact")
      hideLoadingState($submitBtn)
    })
  })

  // Enhanced offcanvas event handlers
  $("#offcanvasAbout").on("shown.bs.offcanvas", () => {
    $("#inputAbout").val($("#displayAbout").text().trim()).focus()
  })

  $("#offcanvasContact").on("shown.bs.offcanvas", () => {
    $("#inputMobile").val($("#displayMobile").text().replace("Not provided", "").trim())
    $("#inputHome").val($("#displayHome").text().replace("Not provided", "").trim())
    $("#inputMobile").focus()
  })

  $("#offcanvasProfile").on("shown.bs.offcanvas", () => {
    $("#inputFirstName").val(userData.firstName || "")
    $("#inputLastName").val(userData.lastName || "")
    $("#inputLocation").val($("#displayLocation").text().replace("Not specified", "").trim())
    $("#inputExperience").val($("#displayExperience").text().trim())

    $("#uploadBtn")
      .html('<i class="bi bi-cloud-upload"></i> Upload')
      .removeClass("btn-success")
      .addClass("btn-dark")
      .prop("disabled", false)
    selectedFile = null
    $("#profilePicture").val("")
    $("#profilePicture").removeData("uploaded-url")
    $("#profilePreview").attr("src", $("#profilePic").attr("src"))
    $("#inputFirstName").focus()
  })

  // Enhanced file upload with drag & drop
  $(".upload-area").on("click", () => {
    $("#profilePicture").click()
  })

  $(".upload-area").on("dragover", function (e) {
    e.preventDefault()
    $(this).addClass("dragover")
  })

  $(".upload-area").on("dragleave", function (e) {
    e.preventDefault()
    $(this).removeClass("dragover")
  })

  $(".upload-area").on("drop", function (e) {
    e.preventDefault()
    $(this).removeClass("dragover")

    const files = e.originalEvent.dataTransfer.files
    if (files.length > 0) {
      $("#profilePicture")[0].files = files
      $("#profilePicture").trigger("change")
    }
  })

  $("#profilePicture").on("change", function (e) {
    selectedFile = e.target.files[0]

    if (!selectedFile) {
      $("#profilePreview").attr("src", $("#profilePic").attr("src"))
      return
    }

    // Enhanced validation
    if (!selectedFile.type.startsWith("image/")) {
      showErrorMessage("Please select a valid image file (JPG, PNG, GIF, etc.)")
      $(this).val("")
      selectedFile = null
      $("#profilePreview").attr("src", $("#profilePic").attr("src"))
      return
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      showErrorMessage(
        "File size must be less than 2MB. Current size: " + (selectedFile.size / (1024 * 1024)).toFixed(2) + "MB",
      )
      $(this).val("")
      selectedFile = null
      $("#profilePreview").attr("src", $("#profilePic").attr("src"))
      return
    }

    // Preview with animation
    const reader = new FileReader()
    reader.onload = (evt) => {
      $("#profilePreview").fadeOut(200, function () {
        $(this).attr("src", evt.target.result).fadeIn(200)
      })
    }
    reader.onerror = () => {
      showErrorMessage("Failed to read the selected file.")
      $("#profilePreview").attr("src", $("#profilePic").attr("src"))
    }
    reader.readAsDataURL(selectedFile)
  })

  // Enhanced upload with progress indication
  $("#uploadBtn").on("click", () => {
    if (!selectedFile) {
      showErrorMessage("Please select an image first.")
      return
    }

    if (!token) {
      showErrorMessage("Authentication token not found. Please login again.")
      return
    }

    const formData = new FormData()
    formData.append("profilePic", selectedFile)

    $.ajax({
      url: "http://localhost:8080/api/v1/image/upload",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      headers: { Authorization: `Bearer ${token}` },
      beforeSend: () => {
        showLoadingState("#uploadBtn", "Uploading...")
      },
      success: (response) => {
        try {
          const imageUrl = response.data || response.url || response.imageUrl || response

          if (!imageUrl) {
            throw new Error("No image URL returned from server")
          }

          $("#profilePreview").attr("src", imageUrl)
          $("#profilePic").attr("src", imageUrl)
          
          // Update navbar profile picture
          updateNavbarProfilePicture(imageUrl)
          
          $("#uploadBtn")
            .html('<i class="bi bi-check-circle"></i> Uploaded')
            .removeClass("btn-dark")
            .addClass("btn-success")
            .prop("disabled", false)
          $("#profilePicture").data("uploaded-url", imageUrl)
          selectedFile = null
          $("#profilePicture").val("")

          showSuccessMessage("Profile picture uploaded successfully!")
        } catch (error) {
          console.error("Upload success but error processing response:", error)
          showErrorMessage("Upload completed but failed to process response: " + error.message)
          hideLoadingState("#uploadBtn")
        }
      },
      error: (xhr) => {
        console.error("Upload failed:", xhr.responseText)
        let errorMessage = "Upload failed: "

        if (xhr.status === 413) {
          errorMessage += "File too large"
        } else if (xhr.status === 415) {
          errorMessage += "Unsupported file type"
        } else if (xhr.status === 401) {
          errorMessage += "Authentication failed. Please login again."
        } else {
          errorMessage += xhr.responseJSON?.message || xhr.responseText || "Unknown error"
        }

        showErrorMessage(errorMessage)
        hideLoadingState("#uploadBtn")
      },
    })
  })

  // Add smooth scrolling and enhanced interactions
  $('a[href^="#"]').on("click", function (e) {
    e.preventDefault()
    const target = $($(this).attr("href"))
    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 100,
        },
        500,
      )
    }
  })

  // Add keyboard shortcuts
  $(document).on("keydown", (e) => {
    if (e.key === "Escape") {
      $(".offcanvas.show").each(function () {
        const instance = bootstrap.Offcanvas.getInstance(this)
        if (instance) instance.hide()
      })
    }
  })

  // Preview Profile Button Click Handler
  $("#previewProfileBtn").on("click", function (e) {
    e.preventDefault()
    
    if (!workerId) {
      showErrorMessage("Worker ID not found. Please refresh the page and try again.")
      return
    }
    
    // Add loading state to the button
    const $btn = $(this)
    const originalHtml = $btn.html()
    $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>Loading Preview...')
      .prop('disabled', true)
    
    // Navigate to preview page with worker ID parameter
    const previewUrl = `/pages/worker-profile-preview.html?workerId=${workerId}`
    
    // Small delay for visual feedback
    setTimeout(() => {
      window.location.href = previewUrl
    }, 500)
  })
})
