
$(document).ready(() => {
  $(".btn-plan").on("click", function () {
    const plan = $(this).data("plan")
    const token = $.cookie("token");
    const userId = $.cookie("userId");

    handlePlanSelection(plan, token, userId)

  })

  function handlePlanSelection(plan, token, userId) {
   
    if (plan === "basic") {
      Swal.fire({
        title: "Welcome to Basic Plan!",
        text: "You're all set with our free Basic plan. Start creating your first service ad now!",
        icon: "success",
        confirmButtonText: "Get Started",
        confirmButtonColor: "#023047",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/pages/ads-overview.html"
        }
      })
    } else {
      
      showPaymentModal(plan, token, userId)
    }
  }

  function showPaymentModal(plan, token, userId) {
    let userData = []

    $.ajax({
        url: `http://localhost:8080/api/v1/user/getuser/${userId}`,
        type: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + token  
        },
         success: function(response) {
             userData = response.data
         },
         error: function(error){
            Swal.fire("Error", "Request failed: " + error, "error");
         }

    })

    const data = {
        userId : userId,
        planType : plan
    }

    $.ajax({
        url: "http://localhost:8080/api/v1/subscription/create",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        headers: {
            "Authorization": "Bearer " + token  
        },
        success: function(response) {
            if (response.status === 201) {
                const sub = response.data;
                
                var payment = {
                    sandbox: true,
                    merchant_id: sub.merchantId,
                    return_url: "http://localhost:5500/api/v1/subscription/success",
                    cancel_url: "",
                    notify_url: "http://localhost:5500/api/v1/subscription/notify",

                    order_id: sub.orderId,
                    items: `SkillWorker ${sub.planType} Subscription`,
                    amount: sub.amount,
                    currency: sub.currency,
                    hash: sub.hash,

                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email,
                    phone: "",
                    address: "",
                    city: "",
                    country: "Sri Lanka"
                };

                console.log(payment);
                

                payhere.startPayment(payment);
            } else {
                Swal.fire("Error", response.message, "error");
            }
        },
        error: function(xhr, status, error) {
            Swal.fire("Error", "Request failed: " + error, "error");
        }
    });

  }


  // Smooth scrolling for anchor links
  $('a[href^="#"]').on("click", function (e) {
    e.preventDefault()
    const target = $($(this).attr("href"))
    if (target.length) {
      $("html, body").animate(
        {
          scrollTop: target.offset().top - 100,
        },
        800,
      )
    }
  })

  // Add animation on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe pricing cards
  $(".pricing-card").each(function () {
    this.style.opacity = "0"
    this.style.transform = "translateY(30px)"
    this.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(this)
  })
})
