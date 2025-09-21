
$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }

  if (typeof Swal === 'undefined') {
    console.error('SweetAlert2 is not loaded!')
    return
  }

  $("#googleLoginBtn").click(function () {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  });

  const params = new URLSearchParams(window.location.search);
  
  // Debug: Log all URL parameters
  console.log("URL parameters:", window.location.search);
  console.log("Has token:", params.has("token"));
  console.log("Has refreshToken:", params.has("refreshToken"));
  
  // Handle URL parameters (if backend sends via redirect)
  if (params.has("token") && params.has("refreshToken")) {
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("userId");
    const role = params.get("role");

    console.log("Received OAuth data:", { token, refreshToken, userId, role });

    $.cookie("token", token, { path: "/" })
    $.cookie("refresh_token", refreshToken, { path: "/" })
    $.cookie("user_role", role, { path: "/" })
    $.cookie("userId", userId, { path: "/" })

    console.log("Google login successful! Tokens saved.");

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
      console.log("Redirecting user with role:", role);
      
      // Fixed the role checking logic
      if (role === "CLIENT") {
        console.log("Redirecting to client dashboard");
        window.location.href = "/pages/client-dashboard.html";
      } else if (role === "WORKER") {
        console.log("Redirecting to worker dashboard");
        window.location.href = "/pages/worker-dashboard.html";
      } else if (role === "ADMIN") {
        console.log("Redirecting to admin dashboard");
        window.location.href = "/pages/admin-dashboard.html";
      } else {
        console.log("Unknown role, redirecting to client dashboard");
        window.location.href = "/pages/client-dashboard.html";
      }
    });
  } else if (params.has("token") || params.has("refreshToken") || params.has("role") || params.has("userId")) {
    // Handle case where some but not all parameters are present
    console.log("Incomplete OAuth parameters received:");
    console.log("token:", params.get("token"));
    console.log("refreshToken:", params.get("refreshToken"));
    console.log("role:", params.get("role"));
    console.log("userId:", params.get("userId"));
    
    Swal.fire({
      icon: "error",
      title: "Login Error",
      text: "Incomplete authentication data received. Please try again.",
      customClass: {
        confirmButton: "btn btn-primary-custom",
      },
      buttonsStyling: false,
    });
  }

 
  if (params.has("oauth_success") && params.get("oauth_success") === "true") {
    $.ajax({
      url: "http://localhost:8080/api/v1/auth/oauth/success",
      type: "GET",
      dataType: "json",
      success: function(response) {
        if (response.token && response.refreshToken) {
          $.cookie("token", response.token, { path: "/" })
          $.cookie("refresh_token", response.refreshToken, { path: "/" })
          $.cookie("user_role", response.role, { path: "/" })
          $.cookie("userId", response.userId, { path: "/" })

          console.log("Google login successful! Tokens saved from API.");

          // Show success message
          Swal.fire({
            icon: "success",
            title: "Welcome!",
            text: "Google login successful",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "animated fadeInDown",
            },
          }).then(() => {
            // Redirect based on role
            if (response.role === "CLIENT") {
              window.location.href = "/pages/client-dashboard.html";
            } else if (response.role === "WORKER") {
              window.location.href = "/pages/worker-dashboard.html";
            } else if (response.role === "ADMIN") {
              window.location.href = "/pages/admin-dashboard.html";
            }
          });
        }
      },
      error: function(xhr, status, error) {
        console.error("Failed to get OAuth success data:", error);
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Failed to complete Google authentication",
          customClass: {
            confirmButton: "btn btn-primary-custom",
          },
          buttonsStyling: false,
        });
      }
    });
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
