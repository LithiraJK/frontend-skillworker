$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }

  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 is not loaded!')
    return
  }

  // Google OAuth Login Button Handler
  $("#googleLoginBtn").click(function () {
    // Show loading state
    $(this).prop('disabled', true);
    $(this).html('<i class="fas fa-spinner fa-spin me-2"></i>Connecting to Google...');

    // Redirect to Google OAuth
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  });

  const params = new URLSearchParams(window.location.search);
  
  // Handle OAuth success with tokens
  if (params.has("token") && params.has("refreshToken")) {
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("userId");
    const role = params.get("role");
    const clearOAuthRole = params.get("clearOAuthRole");

    console.log("Received OAuth data:", { userId, role });

    // Save tokens and user data to cookies
    $.cookie("token", token, { path: "/" });
    $.cookie("refresh_token", refreshToken, { path: "/" });
    $.cookie("user_role", role, { path: "/" });
    $.cookie("userId", userId, { path: "/" });

    // Clear the OAuth role cookie if requested
    if (clearOAuthRole === "true") {
      $.removeCookie("pendingOAuthRole", { path: "/" });
      localStorage.removeItem("pendingOAuthRole");
    }

    // Show success message and redirect
    Swal.fire({
      icon: "success",
      title: "Welcome!",
      text: "Google login successful",
      timer: 1500,
      showConfirmButton: false,
      customClass: {
        popup: "animated fadeInDown",
      },
    }).then(() => {
      // Clean URL by removing query parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // Redirect based on user role
      switch (role.toUpperCase()) {
        case "CLIENT":
          window.location.href = "../pages/client-dashboard.html";
          break;
        case "WORKER":
          window.location.href = "../pages/worker-dashboard.html";
          break;
        case "ADMIN":
          window.location.href = "../pages/admin-dashboard.html";
          break;
        default:
          window.location.href = "../pages/client-dashboard.html";
      }
    });
    return; // Exit early to prevent normal form handling
  }

  // Handle OAuth errors
  if (params.has("error")) {
    const error = params.get("error");
    let errorMessage = "Authentication failed. Please try again.";

    switch (error) {
      case "authentication_failed":
        errorMessage = "Google authentication failed. Please try again.";
        break;
      case "email_not_provided":
        errorMessage = "Email not provided by Google. Please ensure your Google account has a valid email.";
        break;
      case "authentication_error":
        errorMessage = "An error occurred during authentication. Please try again.";
        break;
      case "oauth_failure":
        errorMessage = "OAuth authentication failed. Please try again.";
        break;
    }

    Swal.fire({
      icon: "error",
      title: "Authentication Error",
      text: errorMessage,
      confirmButtonText: "OK",
      customClass: {
        popup: "animated shake",
      },
    });

    // Clean URL by removing error parameter
    window.history.replaceState({}, document.title, window.location.pathname);
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
          window.location.href = "/pages/worker-dashboard.html"
        } else if (response.data.role === "CLIENT") {
          window.location.href = "/pages/client-dashboard.html"
        } else if (response.data.role === "ADMIN") {
          window.location.href = "/pages/admin-dashboard.html"
        } else {
          window.location.href = "/pages/dashboard.html"
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
