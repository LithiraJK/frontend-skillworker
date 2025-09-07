
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
  
  console.log('Login page initialized successfully')
  $(".password-toggle").click(function () {
    const passwordInput = $("#password")
    const icon = $(this)

    if (passwordInput.attr("type") === "password") {
      passwordInput.attr("type", "text")
      icon.removeClass("fa-eye").addClass("fa-eye-slash")
    } else {
      passwordInput.attr("type", "password")
      icon.removeClass("fa-eye-slash").addClass("fa-eye")
    }
  })

  function validateForm() {
    const email = $("#email").val().trim()
    const password = $("#password").val().trim()
    let isValid = true

    // Reset previous validation states
    $(".form-control").removeClass("is-invalid is-valid")

    if (email === "") {
      $("#email").addClass("is-invalid")
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#email").addClass("is-invalid")
      isValid = false
    } else {
      $("#email").addClass("is-valid")
    }

    if (password === "") {
      $("#password").addClass("is-invalid")
      isValid = false
    } else if (password.length < 6) {
      $("#password").addClass("is-invalid")
      isValid = false
    } else {
      $("#password").addClass("is-valid")
    }

    return isValid
  }

  $("#loginForm").submit(async (event) => {
    event.preventDefault()

    console.log("Login form submitted")

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all fields correctly.",
        customClass: {
          confirmButton: "btn btn-primary-custom",
        },
        buttonsStyling: false,
      })
      return
    }

    const email = $("#email").val().trim()
    const password = $("#password").val().trim()
    const loginBtn = $("#loginBtn")
    const btnText = loginBtn.find(".btn-text")

    console.log("Attempting login for:", email)

    loginBtn.addClass("loading").prop("disabled", true)
    btnText.text("Signing in...")

    const loginData = {
      email: email,
      password: password,
    }

    try {
      console.log("Sending login request...")
      const response = await $.ajax({
        type: "POST",
        url: "http://localhost:8080/api/v1/auth/login",
        data: JSON.stringify(loginData),
        contentType: "application/json",
        timeout: 10000,
      })

      console.log("Login response:", response)

      await Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: response.message || "Login successful",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "animated fadeInDown",
        },
      })

      // Store authentication data
      if (typeof $.cookie !== 'undefined') {
        $.cookie("token", response.data.token, { path: "/" })
        $.cookie("refresh_token", response.data.refreshToken, { path: "/" })
        $.cookie("user_role", response.data.role, { path: "/" })
        $.cookie("userId", response.data.userId, { path: "/" })
      } else {
        // Fallback to localStorage if cookies are not available
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("refresh_token", response.data.refreshToken)
        localStorage.setItem("user_role", response.data.role)
        localStorage.setItem("userId", response.data.userId)
      }

      setTimeout(() => {
        if (response.data.role === "WORKER") {
          window.location.href = "../pages/worker-dashboard.html"
        } else if (response.data.role === "CLIENT") {
          window.location.href = "../pages/client-dashboard.html"
        } else if (response.data.role === "ADMIN") {
          window.location.href = "../pages/admin-dashboard.html"
        } else {
          window.location.href = "../pages/dashboard.html"
        }
      }, 1500)
    } catch (error) {
      console.error("Login error:", error)

      let errorMessage = "Invalid email or password."

      if (error.status === 0) {
        errorMessage = "Unable to connect to server. Please check your internet connection."
      } else if (error.status === 500) {
        errorMessage = "Server error. Please try again later."
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        customClass: {
          confirmButton: "btn btn-primary-custom",
        },
        buttonsStyling: false,
      })
    } finally {
      loginBtn.removeClass("loading").prop("disabled", false)
      btnText.text("Sign In")
    }
  })

  $("#email, #password").on("input blur", function () {
    const input = $(this)
    const value = input.val().trim()

    input.removeClass("is-invalid is-valid")

    if (value !== "") {
      if (input.attr("id") === "email") {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          input.addClass("is-valid")
        } else {
          input.addClass("is-invalid")
        }
      } else if (input.attr("id") === "password") {
        if (value.length >= 6) {
          input.addClass("is-valid")
        } else {
          input.addClass("is-invalid")
        }
      }
    }
  })

  setTimeout(() => {
    $(".login-card").addClass("animate__animated animate__fadeInUp")
  }, 100)
})
