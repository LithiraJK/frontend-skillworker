$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  console.log('Role selection page initialized successfully')
  
  let selectedType = null
  let isOAuthFlow = false
  let oauthUserData = null

  // Check if this is an OAuth flow
  const params = new URLSearchParams(window.location.search);
  if (params.get('oauth') === 'true') {
    isOAuthFlow = true
    oauthUserData = {
      email: params.get('email'),
      firstName: params.get('firstName'),
      lastName: params.get('lastName')
    }
    console.log('OAuth flow detected:', oauthUserData)

    // Update page content for OAuth users
    $('.subtitle').text('Complete Your Registration')
    $('.description').text(`Welcome ${oauthUserData.firstName}! Please choose how you'd like to use SkillWorker.`)
  }

  $(".user-type-toggle").on("click", function () {
    $(".user-type-toggle").removeClass("active")

    $(this).addClass("active")

    selectedType = $(this).data("type")

    $("#continueBtn").prop("disabled", false)

    const btnText = $("#continueBtn .btn-text")
    if (btnText.length) {
      btnText.fadeOut(200, () => {
        if (selectedType === "worker") {
          btnText.text("Join as a Worker").fadeIn(200)
        } else {
          btnText.text("Join as a Client").fadeIn(200)
        }
      })
    } else {
      const btn = $("#continueBtn")
      if (selectedType === "worker") {
        btn.text("Join as a Worker")
      } else {
        btn.text("Join as a Client")
      }
    }

    $(this).css("transform", "translateY(-8px) scale(1.02)")
    setTimeout(() => {
      $(this).css("transform", "translateY(-8px) scale(1)")
    }, 200)
  })

  $("#continueBtn").on("click", async function () {
    if (!selectedType) {
      console.warn('No user type selected')
      return
    }

    console.log('Continue button clicked, selected type:', selectedType)

    const btn = $(this)
    const spinner = btn.find(".loading-spinner")
    const btnText = btn.find(".btn-text")

    btn.prop("disabled", true)
    if (spinner.length) spinner.show()

    if (isOAuthFlow) {
      if (btnText.length) {
        btnText.text("Creating Account...")
      } else {
        btn.text("Creating Account...")
      }

      try {
        const response = await $.ajax({
          type: "POST",
          url: "http://localhost:8080/api/v1/auth/oauth-register",
          data: JSON.stringify({
            email: oauthUserData.email,
            firstName: oauthUserData.firstName,
            lastName: oauthUserData.lastName,
            role: selectedType.toUpperCase()
          }),
          contentType: "application/json",
          timeout: 10000,
        });

        console.log("OAuth Registration response:", response);

        if (typeof $.cookie !== 'undefined') {
          $.cookie("token", response.data.token, { path: "/" });
          $.cookie("refresh_token", response.data.refreshToken, { path: "/" });
          $.cookie("user_role", response.data.role, { path: "/" });
          $.cookie("userId", response.data.userId, { path: "/" });
        }

        if (typeof Swal !== 'undefined') {
          await Swal.fire({
            icon: "success",
            title: "Welcome to SkillWorker!",
            text: "Your account has been created successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        }

        switch (selectedType.toUpperCase()) {
          case "CLIENT":
            window.location.href = "../pages/client-dashboard.html";
            break;
          case "WORKER":
            window.location.href = "../pages/worker-dashboard.html";
            break;
          default:
            window.location.href = "../pages/client-dashboard.html";
        }

      } catch (error) {
        console.error("OAuth Registration error:", error);

        let errorMessage = "Failed to create account. Please try again.";
        if (error.responseJSON && error.responseJSON.message) {
          errorMessage = error.responseJSON.message;
        }

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: "error",
            title: "Registration Failed",
            text: errorMessage,
          });
        } else {
          alert(errorMessage);
        }

        btn.prop("disabled", false);
        if (spinner.length) spinner.hide();
        if (btnText.length) {
          btnText.text("Continue");
        } else {
          btn.text("Continue");
        }
      }
    } else {
      localStorage.setItem('selectedUserType', selectedType)

      if (btnText.length) {
        btnText.text("Redirecting...")
      } else {
        btn.text("Redirecting...")
      }

      setTimeout(() => {
        console.log('Redirecting to signup page for role:', selectedType)
        if (selectedType === "worker") {
          window.location.href = "signup-second-page.html?role=WORKER"
        } else if (selectedType === "client") {
          window.location.href = "signup-second-page.html?role=CLIENT"
        }
      }, 1000)
    }
  })

  $(".user-type-toggle").hover(
    function () {
      if (!$(this).hasClass("active")) {
        $(this).css("transform", "translateY(-4px)")
      }
    },
    function () {
      if (!$(this).hasClass("active")) {
        $(this).css("transform", "translateY(0)")
      }
    },
  )

  $(document).keydown((e) => {
    if (e.key === "Enter" && selectedType && !$("#continueBtn").prop("disabled")) {
      $("#continueBtn").click()
    }
  })
})
