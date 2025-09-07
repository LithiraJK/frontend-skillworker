$(document).ready(() => {
  // Check if required libraries are loaded
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  console.log('Role selection page initialized successfully')
  
  let selectedType = null

  $(".user-type-toggle").on("click", function () {
    // Remove active class from all cards with animation
    $(".user-type-toggle").removeClass("active")

    // Add active class to clicked card
    $(this).addClass("active")

    // Store selected type
    selectedType = $(this).data("type")

    // Enable continue button with animation
    $("#continueBtn").prop("disabled", false)

    // Update button text based on selection with smooth transition
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
      // Fallback if btn-text element doesn't exist
      const btn = $("#continueBtn")
      if (selectedType === "worker") {
        btn.text("Join as a Worker")
      } else {
        btn.text("Join as a Client")
      }
    }

    // Add subtle success feedback
    $(this).css("transform", "translateY(-8px) scale(1.02)")
    setTimeout(() => {
      $(this).css("transform", "translateY(-8px) scale(1)")
    }, 200)
  })

  $("#continueBtn").on("click", function () {
    if (!selectedType) {
      console.warn('No user type selected')
      return
    }

    console.log('Continue button clicked, selected type:', selectedType)

    // Show loading state
    const btn = $(this)
    const spinner = btn.find(".loading-spinner")
    const btnText = btn.find(".btn-text")

    btn.prop("disabled", true)
    if (spinner.length) spinner.show()
    if (btnText.length) {
      btnText.text("Redirecting...")
    } else {
      // Fallback if btn-text element doesn't exist
      btn.text("Redirecting...")
    }

    // Simulate loading delay for better UX
    setTimeout(() => {
      console.log('Redirecting to signup page for role:', selectedType)
      if (selectedType === "worker") {
        window.location.href = "signup-second-page.html?role=WORKER"
      } else if (selectedType === "client") {
        window.location.href = "signup-second-page.html?role=CLIENT"
      }
    }, 1000)
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
