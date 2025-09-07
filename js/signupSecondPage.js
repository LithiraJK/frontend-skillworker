$(document).ready(() => {
  // Check if required libraries are loaded
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 is not loaded!')
    return
  }
  
  console.log('Signup page initialized successfully')
  // Password visibility toggle
  $("#passwordToggle").click(function () {
    const passwordField = $("#password")
    const icon = $(this).find("i")

    if (passwordField.attr("type") === "password") {
      passwordField.attr("type", "text")
      icon.removeClass("fa-eye").addClass("fa-eye-slash")
    } else {
      passwordField.attr("type", "password")
      icon.removeClass("fa-eye-slash").addClass("fa-eye")
    }
  })

  // Real-time validation
  function validateField(field, value, type) {
    const feedback = $(`#${field}Feedback`)
    const input = $(`#${field}`)

    let isValid = false
    let message = ""

    switch (type) {
      case "firstName":
      case "lastName":
        isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value)
        message = isValid ? "Looks good!" : "Please enter a valid name (at least 2 characters, letters only)"
        break
      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        message = isValid ? "Email format is correct!" : "Please enter a valid email address"
        break
      case "password":
        isValid = value.length >= 6
        message = isValid ? "Password strength is good!" : "Password must be at least 6 characters long"
        break
    }

    input.removeClass("is-valid is-invalid")
    feedback.removeClass("valid invalid")

    if (value.length > 0) {
      if (isValid) {
        input.addClass("is-valid")
        feedback.addClass("valid").text(message)
      } else {
        input.addClass("is-invalid")
        feedback.addClass("invalid").text(message)
      }
    }

    return isValid
  }

  // Add real-time validation listeners
  $("#firstName").on("input blur", function () {
    validateField("firstName", $(this).val(), "firstName")
  })

  $("#lastName").on("input blur", function () {
    validateField("lastName", $(this).val(), "lastName")
  })

  $("#email").on("input blur", function () {
    validateField("email", $(this).val(), "email")
  })

  $("#password").on("input blur", function () {
    validateField("password", $(this).val(), "password")
  })

  $("#signupForm").submit((e) => {
    e.preventDefault()

    console.log("Signup form submitted")

    // Validate all fields
    const firstName = $("#firstName").val().trim()
    const lastName = $("#lastName").val().trim()
    const email = $("#email").val().trim()
    const password = $("#password").val()

    console.log("Form data:", { firstName, lastName, email, password: "***" })

    const isFirstNameValid = validateField("firstName", firstName, "firstName")
    const isLastNameValid = validateField("lastName", lastName, "lastName")
    const isEmailValid = validateField("email", email, "email")
    const isPasswordValid = validateField("password", password, "password")

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPasswordValid) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all fields correctly before submitting.",
        confirmButtonColor: "#155e75",
      })
      return
    }

    // Show loading state
    const signupBtn = $("#signupBtn")
    const spinner = $("#spinner")
    const buttonText = $("#buttonText")

    signupBtn.addClass("loading").prop("disabled", true)
    if (spinner.length) spinner.show()
    if (buttonText.length) buttonText.text("Creating Account...")
    if ($("#loadingOverlay").length) $("#loadingOverlay").show()

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      role: new URLSearchParams(window.location.search).get("role") || "CLIENT",
    }

    console.log("Sending signup request with data:", { ...userData, password: "***" })

    $.ajax({
      url: "http://localhost:8080/api/v1/auth/register",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(userData),
      timeout: 10000,
      success: (response) => {
        console.log("Signup successful:", response.message)

        // Hide loading state
        if ($("#loadingOverlay").length) $("#loadingOverlay").hide()
        signupBtn.removeClass("loading").prop("disabled", false)
        if (spinner.length) spinner.hide()
        if (buttonText.length) buttonText.text("Create Account")

        Swal.fire({
          icon: "success",
          title: "Welcome to SkillWorker!",
          text: response.message || "Account created successfully!",
          confirmButtonColor: "#155e75",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          window.location.href = "login-page.html"
        })
      },
      error: (xhr, status, error) => {
        console.error("Sign-up failed:", xhr.responseJSON || error)

        // Hide loading state
        if ($("#loadingOverlay").length) $("#loadingOverlay").hide()
        signupBtn.removeClass("loading").prop("disabled", false)
        if (spinner.length) spinner.hide()
        if (buttonText.length) buttonText.text("Create Account")

        let errorMessage = "Registration failed. Please try again."
        
        if (xhr.status === 0) {
          errorMessage = "Unable to connect to server. Please check your internet connection."
        } else if (xhr.status === 500) {
          errorMessage = "Server error. Please try again later."
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message
        }

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: errorMessage,
          confirmButtonColor: "#155e75",
        })
      },
    })
  })

  $(".form-control").on("focus", function () {
    $(this).parent().addClass("focused")
  })

  $(".form-control").on("blur", function () {
    if (!$(this).val()) {
      $(this).parent().removeClass("focused")
    }
  })
})
