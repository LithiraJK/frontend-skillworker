import tokenHandler from './util/tokenRefreshHandler.js'; 

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const adId = urlParams.get('adId');
    const token = $.cookie("token");

    if (token) {
            tokenHandler.scheduleSilentRefresh(token);
    }
    
    if (!adId) {
        console.error("No ad ID provided in URL");
        showError("Invalid ad ID. Please return to the ads overview.", true);
        return;
    }

    if (!token) {
        console.error("No token found");
        showError("Authentication required. Redirecting to login...", false);
        setTimeout(() => {
            window.location.href = '../pages/login-page.html';
        }, 2000);
        return;
    }

    showLoading();
    
    let adData = {};
    let workerData = {};
    let userData = {};

    $.ajax({
        url: `http://localhost:8080/api/v1/ad/get/${adId}`,
        method: "GET",
        dataType: "json",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.status === 200 && response.data) {
                adData = response.data;
                console.log("Ad data loaded:", adData);
                
                if (adData.workerId) {
                    fetchWorkerAndUserData(adData.workerId);
                } else {
                    console.warn("No worker ID found in ad data");
                    hideLoading();
                    populateAdData();
                }
            } else {
                console.warn("No ad data found!");
                showError("Ad not found.", true);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching ad data:", error);
            let errorMessage = "Error loading ad data.";
            let showBackButton = true;
            
            if (xhr.status === 401) {
                errorMessage = "Authentication failed. Redirecting to login...";
                showBackButton = false;
                setTimeout(() => {
                    window.location.href = '../pages/login-page.html';
                }, 3000);
            } else if (xhr.status === 404) {
                errorMessage = "Ad not found.";
            } else if (xhr.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            }
            
            showError(errorMessage, showBackButton);
        }
    });

    function showLoading() {
        $(".container").prepend('<div id="loadingSpinner" class="d-flex justify-content-center align-items-center" style="min-height: 200px;"><div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading...</span></div></div>');
        $(".container .row").hide();
    }

    function hideLoading() {
        $("#loadingSpinner").remove();
        $(".container .row").show();
    }

    function showError(message, showBackButton = true) {
        hideLoading();
        let backButton = showBackButton ? '<a href="../pages/ads-overview.html" class="btn btn-primary mt-2">Back to Ads</a>' : '';
        $(".container").html(`<div class="alert alert-danger"><h4>Error</h4><p>${message}</p>${backButton}</div>`);
    }

    function fetchWorkerAndUserData(workerId) {
        let userDataLoaded = false;
        let workerDataLoaded = false;
        
        function checkAndPopulate() {
            if (userDataLoaded && workerDataLoaded) {
                hideLoading();
                populateAdData();
            }
        }
        
        $.ajax({
            url: `http://localhost:8080/api/v1/user/getuser/${workerId}`,
            method: "GET",
            dataType: "json",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (response) {
                if (response.status === 200 && response.data) {
                    userData = {
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        email: response.data.email,
                        phoneNumber: response.data.phoneNumber
                    };
                    console.log("User data loaded:", userData);
                }
                userDataLoaded = true;
                checkAndPopulate();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching user data:", error);
                userDataLoaded = true;
                checkAndPopulate();
            }
        });

        $.ajax({
            url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
            method: "GET",
            dataType: "json",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (response) {
                if (response.status === 200 && response.data) {
                    workerData = response.data;
                    console.log("Worker data loaded:", workerData);
                } else {
                    console.warn("No worker data found!");
                }
                workerDataLoaded = true;
                checkAndPopulate();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching worker data:", error);
                workerDataLoaded = true;
                checkAndPopulate();
            }
        });
    }

    function populateAdData() {
        if (adData.title) {
            $("h3").first().text(adData.title);
            document.title = `${adData.title} - Ad Preview`;
        }

        const profilePicUrl = workerData.profilePictureUrl || "/assets/images/workerDefualtPP.png";
        $(".profile-pic").attr("src", profilePicUrl);
        $(".card.mb-4 img").attr("src", profilePicUrl);

        const firstName = userData.firstName || "";
        const lastName = userData.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim() || `Worker ${adData.workerId || 'Unknown'}`;
        $("#displayFirstName").text(fullName);
        $(".card.mb-4 h6").text(firstName || "Worker");

        if (adData.categoryName) {
            $("#displayCategory").html(`<strong>${adData.categoryName}</strong>`);
            $(".card.mb-4 small").text(adData.categoryName);
        }

        if (adData.description) {
            $("#displayDescription").text(adData.description);
        } else {
            $("#displayDescription").text("No description available for this service.");
        }

        if (workerData.experienceYears) {
            $("#displayExperience").text(workerData.experienceYears);
        } else {
            $("#displayExperience").text("Not specified");
        }

        if (workerData.locations && workerData.locations.length > 0) {
            let locationText = workerData.locations.map(loc => loc.district).join(", ");
            $("#displayWorkingAreas").text(locationText);
        } else {
            $("#displayWorkingAreas").text("Service areas not specified");
        }

        const $skillsContainer = $("#skillsContainer").next(); // the <span> list
        $skillsContainer.empty(); // clear old

        if (workerData.skills && workerData.skills.length > 0) {
            workerData.skills.forEach(skill => {
                $skillsContainer.append(`<span class="skill-badge">${skill}</span> `);
            });
        } else {
            $skillsContainer.append(`<span class="text-muted">No skills added</span>`);
        }

        if (adData.startingPrice) {
            $("#displayDayPrice").text(`Rs.${adData.startingPrice}`);
        } else {
            $("#displayDayPrice").text("Price on request");
        }

        if (workerData.phoneNumbers) {
            $("#displayMobile").text(workerData.phoneNumbers[0]);
            $("#displayHomeWork").text(workerData.phoneNumbers[1]);

            $("a[href^='tel:']").attr("href", `tel:${workerData.phoneNumbers[0]}`);
            $("a[href^='tel:']").eq(1).attr("href", `tel:${workerData.phoneNumbers[1]}`);
        } else {
            $("#displayMobile").text("Contact via platform");
            $("#displayHomeWork").text("Contact via platform");
            
            $("a[href^='tel:']").addClass('disabled').attr('href', '#').click(function(e) {
                e.preventDefault();
                alert('Phone number not available. Please contact via the platform.');
            });
        }

        $("#userMenu img").attr("src", profilePicUrl);
        
    
    }
});