import tokenHandler from './util/tokenRefreshHandler.js'; 

$(document).ready(function () {    
    const workerId = $.cookie('userId');
    const apiUrl = `http://localhost:8080/api/v1/worker/getworker/${workerId}`;
    const token = $.cookie("token");
    let userData = {};

    if (token) {
        tokenHandler.scheduleSilentRefresh(token);
    }

    $.ajax({
        url: `http://localhost:8080/api/v1/user/getuser/${workerId}`,
        method: "GET",
        dataType: "json",
        headers: { "Authorization": `Bearer ${token}` },
        async: false,
        success: function (response) {
            if (response.status === 200 && response.data) {
                userData = {
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email
                };
            } else {
                console.warn("No user data found!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching user data:", error);
        }
    });

    $.ajax({
        url: apiUrl,
        method: "GET",
        dataType: "json",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.status === 200 && response.data) {
                const worker = response.data;

                $(".profile-pic").attr("src", worker.profilePictureUrl || "/assets/images/workerDefualtPP.png");

                // Display Name (no direct name field in API, fallback from category or ID)
                $("#displayFirstName").text(userData.firstName);
                $("#displayLastName").text(userData.lastName);

                // Email (API doesn't return email, so just show placeholder for now)
                $("#displayEmail").text(userData.email);

                // Category
                if (worker.categories && worker.categories.length > 0) {
                    $("#displayCategory").html(`<strong>${worker.categories[0].name}</strong>`);
                }

                // Location
                if (worker.locations && worker.locations.length > 0) {
                    let locationText = worker.locations.map(loc => loc.district).join(", ");
                    $("#displayLocation").html(`<i class="bi bi-geo-alt"></i> ${locationText}`);
                }

                // Experience
                $("#displayExperience").text(worker.experienceYears || 0);

                // Bio
                $("#displayBio").text(worker.bio || "No bio available");

                // Skills
                const $skillsContainer = $("#skillsContainer").next(); // the <span> list
                $skillsContainer.empty(); // clear old
                if (worker.skills && worker.skills.length > 0) {
                    worker.skills.forEach(skill => {
                        $skillsContainer.append(`<span class="skill-badge">${skill}</span> `);
                    });
                } else {
                    $skillsContainer.append(`<span class="text-muted">No skills added</span>`);
                }

                $(".card.mb-4 img").attr("src", worker.profilePictureUrl || "/assets/images/workerDefualtPP.png");
                $(".card.mb-4 h6").text(worker.name || `Worker ${worker.workerId}`);
                $(".card.mb-4 small").text(worker.categories?.[0]?.name || "No Category");

            } else {
                console.warn("No worker data found!");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching worker data:", error);
        }
    });
});
