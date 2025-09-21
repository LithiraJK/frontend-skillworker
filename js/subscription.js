$(document).ready(() => {
    const token = $.cookie("token");

    // Initialize token refresh handler
    if (typeof window.tokenHandler !== 'undefined' && token) {
        try {
            window.tokenHandler.scheduleSilentRefresh(token)
        } catch (error) {
            console.warn('Token refresh handler not available:', error)
        }
    }

    $(".btn-plan").on("click", function () {
        const plan = $(this).data("plan");
        const token = $.cookie("token");
        const userId = $.cookie("userId");
        const $button = $(this);

        
        if (plan !== "basic") {
            $button.prop('disabled', true);
            $button.find('.loading-spinner').addClass('show');
            $button.html('<span class="loading-spinner show"></span>Processing...');
        }

        handlePlanSelection(plan, token, userId, $button);
    })

    function handlePlanSelection(plan, token, userId, $button) {

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

            showPaymentModal(plan, token, userId, $button)
        }
    }

   function showPaymentModal(plan, token, userId, $button) {
    
    function resetButton() {
        if ($button && plan !== "basic") {
            $button.prop('disabled', false);
            $button.find('.loading-spinner').removeClass('show');
            const originalText = plan === "pro" ? "Choose Pro Plan" : "Choose Premium";
            $button.html(`<span class="loading-spinner"></span>${originalText}`);
        }
    }

    $.ajax({
        url: `http://localhost:8080/api/v1/user/getuser/${userId}`,
        type: "GET",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + token },
        success: function(response) {
            const userData = response.data;
            console.log(userData);
            
            const data = { userId: userId, planType: plan };

            $.ajax({
                url: "http://localhost:8080/api/v1/subscription/create",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
                headers: { "Authorization": "Bearer " + token },
                success: function(response) {
                    if (response.status === 201) {
                        const sub = response.data;

                        const payment = {
                            sandbox: true,
                            merchant_id: sub.merchantId,
                            return_url: window.location.origin + "/pages/subscription.html?success=true",
                            cancel_url: window.location.origin + "/pages/subscription.html?cancelled=true",
                            notify_url: "http://localhost:8080/api/v1/subscription/notify",

                            order_id: sub.orderId,
                            items: `SkillWorker ${sub.planType} Subscription`,
                            amount: sub.amount,
                            currency: sub.currency,
                            hash: sub.hash,

                            first_name: userData.firstName || "User",
                            last_name: userData.lastName || "Name",
                            email: userData.email,
                            phone: "",
                            address: "",
                            city: "",
                            country: "Sri Lanka"
                        };

                        console.log(`BackEnd Hash : ${sub.hash}`);
                        
                        // PayHere payment event handlers
                        payhere.onCompleted = function onCompleted(orderId) {
                            console.log("Payment completed. OrderID:" + orderId);
                            resetButton();
                            Swal.fire({
                                title: "Payment Successful!",
                                text: `Your ${plan} subscription has been activated successfully. Order ID: ${orderId}`,
                                icon: "success",
                                confirmButtonText: "Continue",
                                confirmButtonColor: "#023047",
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.href = "/pages/ads-overview.html";
                                }
                            });
                        };

                        payhere.onDismissed = function onDismissed() {
                            console.log("Payment dismissed");
                            resetButton();
                            Swal.fire({
                                title: "Payment Cancelled",
                                text: "You have cancelled the payment process.",
                                icon: "info",
                                confirmButtonText: "OK",
                                confirmButtonColor: "#023047",
                            });
                        };

                        payhere.onError = function onError(error) {
                            console.log("Error:" + error);
                            resetButton();
                            Swal.fire({
                                title: "Payment Failed",
                                text: "There was an error processing your payment. Please try again.",
                                icon: "error",
                                confirmButtonText: "Try Again",
                                confirmButtonColor: "#023047",
                            });
                        };

                        payhere.startPayment(payment);
                    } else {
                        resetButton();
                        Swal.fire("Error", response.message, "error");
                    }
                },
                error: function(xhr, status, error) {
                    resetButton();
                    Swal.fire("Error", "Request failed: " + error, "error");
                }
            });
        },
        error: function(error) {
            resetButton();
            Swal.fire("Error", "Request failed: " + error, "error");
        }
    });
}


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

    $(".pricing-card").each(function () {
        this.style.opacity = "0"
        this.style.transform = "translateY(30px)"
        this.style.transition = "opacity 0.6s ease, transform 0.6s ease"
        observer.observe(this)
    })
})
