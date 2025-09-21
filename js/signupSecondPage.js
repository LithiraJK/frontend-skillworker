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

  const urlParams = new URLSearchParams(window.location.search);
  const selectedRole = urlParams.get('role') || localStorage.getItem('selectedUserType');
  console.log('Selected role from URL or localStorage:', selectedRole);

  if (selectedRole) {
    const roleText = selectedRole.toLowerCase() === 'worker' ? 'Worker' : 'Client';
    console.log(`User selected to join as: ${roleText}`);
  }

  $("#googleLoginBtn").click(async function () {
    if (!selectedRole) {
      Swal.fire({
        icon: "error",
        title: "Role Required",
        text: "Please go back and select your role first.",
        confirmButtonText: "Go Back"
      }).then(() => {
        window.location.href = "../pages/signup-role-selection.html";
      });
      return;
    }

    $(this).prop('disabled', true);
    $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Connecting to Google...');

    try {
      const roleUpper = selectedRole.toUpperCase();

      if (typeof $.cookie !== 'undefined') {
        $.cookie("pendingOAuthRole", roleUpper, {
          path: "/",
          expires: new Date(Date.now() + 10 * 60 * 1000) 
        });
      }

      localStorage.setItem("pendingOAuthRole", roleUpper);

      try {
        await $.ajax({
          type: "POST",
          url: "http://localhost:8080/oauth2/prepare",
          data: JSON.stringify({ role: roleUpper }),
          contentType: "application/json",
          timeout: 3000,
        });
        console.log("Role stored in session successfully");
      } catch (sessionError) {
        console.warn("Failed to store role in session, proceeding with cookie/localStorage", sessionError);
      }

      console.log("Stored role in cookie and localStorage:", roleUpper);

      window.location.href = "http://localhost:8080/oauth2/authorization/google";

    } catch (error) {
      console.error("Failed to prepare OAuth:", error);

      $(this).prop('disabled', false);
      $(this).html('<img width="20" height="20" class="me-2" src="https://img.icons8.com/color/48/google-logo.png" alt="google-logo" />Continue with Google');

      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Failed to connect to Google. Please try again.",
      });
    }
  });

  $(".form-control").on("focus", function () {
    $(this).parent().addClass("focused")
  })

  $(".form-control").on("blur", function () {
    if (!$(this).val()) {
      $(this).parent().removeClass("focused")
    }
  })
})
