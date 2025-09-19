$(document).ready(() => {
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded!')
    return
  }
  
  console.log('Role selection page initialized successfully')
  
  let selectedType = null

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

  $("#continueBtn").on("click", function () {
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
