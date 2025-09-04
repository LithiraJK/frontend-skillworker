import tokenHandler from './util/tokenRefreshHandler.js'; 


$(document).ready(function () {
    let skills = []; 
    let selectedFile = null;
    const workerId = $.cookie("userId");
    const token = $.cookie("token");
    let userData = {};

    if (token) {
         tokenHandler.scheduleSilentRefresh(token);
    }

    function updateUserName(firstName, lastName, successCb) {
        $.ajax({
            url: `http://localhost:8080/api/v1/user/update/${workerId}`,
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify({ firstName, lastName }),
            success: function () {
                if (successCb) successCb();
                userData.firstName = firstName;
                userData.lastName = lastName;
                $("#displayName").text(firstName + ' ' + lastName);
            },
            error: function (xhr) {
                console.error("Name update failed:", xhr.responseText);
                showErrorMessage("Failed to update name: " + (xhr.responseJSON?.message || xhr.responseText || "Unknown error"));
            }
        });
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

    function escapeHtml(text) {
        return $('<div />').text(text).html();
    }

    function showSuccessMessage(message) {
        const toast = $(`
            <div class="alert alert-success alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
                <i class="bi bi-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        
        $('body').append(toast);
        
        setTimeout(() => {
            toast.alert('close');
        }, 3000);
    }

    function showErrorMessage(message) {
        const toast = $(`
            <div class="alert alert-danger alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        
        $('body').append(toast);
        
        setTimeout(() => {
            toast.alert('close');
        }, 5000);
    }

    function renderSkills() {
        const cont = $('#skillsContainer').empty();
        const existing = $('#existingSkills').empty();
        skills.forEach((s, idx) => {
            const badge = $(`
                <span class="skill-badge" data-index="${idx}">
                    <span class="skill-text">${escapeHtml(s)}</span>
                    <button type="button" class="remove-skill" title="Remove skill">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </span>`);
            cont.append(badge.clone(true));
            existing.append(badge);
        });
        if (skills.length === 0) {
            cont.append('<div class="text-muted">No skills added yet.</div>');
        }
    }

    function closeOffcanvas(id) {
        const el = $('#' + id)[0];
        const instance = bootstrap.Offcanvas.getInstance(el);
        if (instance) instance.hide();
    }

    function loadWorker() {
        $("#displayFirstName").text(userData.firstName);
        $("#displayLastName").text(userData.lastName);
        $("#displayEmail").text(userData.email);
        $.ajax({
            url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
            type: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (res) {
                const w = res.data;
            
                const categoryNames = w.categories.map(cat => cat.name);
                $("#displayCategory").text(categoryNames.join(", "));

                $("#displayExperience").text(w.experienceYears || 0);
                $("#displayAbout").text(w.bio || "");
                $("#profilePic").attr("src", w.profilePictureUrl || "/assets/images/workerDefualtPP.png");
                $("#displayMobile").text(w.phoneNumbers?.[0] || "");
                $("#displayHome").text(w.phoneNumbers?.[1] || "");

                const allLocations = (w.locations || []).map(loc => loc.district);
                $("#displayLocation").text(allLocations.join(", "));

                skills = w.skills || [];
                renderSkills();
            },
            error: (xhr) => console.error("Failed to load worker", xhr.responseText)
        });
    }

    function updateWorker(data, successCb) {
        $.ajax({
            url: `http://localhost:8080/api/v1/worker/update/${workerId}`,
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                if (successCb) successCb();
                loadWorker(); 
            },
            error: function (xhr) {
                console.error("Worker update failed:", xhr.responseText);
                showErrorMessage("Failed to update profile: " + (xhr.responseJSON?.message || xhr.responseText || "Unknown error"));
            }
        });
    }

    loadWorker();

    $(document).on('click', '.remove-skill', function (e) {
        e.stopPropagation();
        const idx = $(this).closest('.skill-badge').data('index');
        if (idx !== undefined) {
            skills.splice(idx, 1);
            updateWorker({ skills: skills }, renderSkills);
        }
    });

    $('#formAbout').on('submit', function (e) {
        e.preventDefault();
        const text = $('#inputAbout').val().trim();
        updateWorker({ bio: text }, () => {
            $("#displayAbout").text(text);
            closeOffcanvas('offcanvasAbout');
        });
    });

    $('#formProfile').on('submit', function (e) {
        e.preventDefault();

        const firstName = $('#inputFirstName').val().trim();
        const lastName = $('#inputLastName').val().trim();
        const location = $('#inputLocation').val().trim();
        const experience = parseInt($('#inputExperience').val().trim()) || 0;
        const uploadedUrl = $('#profilePicture').data('uploaded-url');

        if (!firstName || !lastName) {
            showErrorMessage("First Name and Last Name are required.");
            $('#inputFirstName').focus();
            return;
        }

        if (firstName.length < 2 || lastName.length < 2) {
            showErrorMessage("First Name and Last Name must be at least 2 characters long.");
            return;
        }

        if (experience < 0 || experience > 50) {
            showErrorMessage("Experience must be between 0 and 50 years.");
            $('#inputExperience').focus();
            return;
        }

        updateUserName(firstName, lastName, function() {
            const workerData = {
                workerId: workerId,
                experienceYears: experience
            };

            if (uploadedUrl) {
                workerData.profilePictureUrl = uploadedUrl;
            }

            if (location) {
                workerData.locations = [{ district: location }];
            }

            updateWorker(workerData, () => {
                $("#displayName").text(firstName + ' ' + lastName);
                $("#displayLocation").text(location);
                $("#displayExperience").text(experience);
                if (uploadedUrl) {
                    $("#profilePic").attr("src", uploadedUrl);
                }
                
                $.cookie('first_name', firstName, { path: '/' });
                $.cookie('last_name', lastName, { path: '/' });
                
                closeOffcanvas('offcanvasProfile');
                
                showSuccessMessage("Profile updated successfully!");
            });
        });
    });

    $('#formSkills').on('submit', function (e) {
        e.preventDefault();
        const raw = $('#inputSkills').val().trim();
        if (raw) {
            const parts = raw.split(',').map(s => s.trim()).filter(s => s);
            parts.forEach(p => { if (!skills.includes(p)) skills.push(p); });
        }
        $('#inputSkills').val('');
        updateWorker({ skills: skills }, () => {
            renderSkills();
            closeOffcanvas('offcanvasSkills');
        });
    });

    $('#formContact').on('submit', function (e) {
        e.preventDefault();
        const mobile = $('#inputMobile').val().trim();
        const home = $('#inputHome').val().trim();

        updateWorker({ phoneNumbers: [mobile, home] }, () => {
            $("#displayMobile").text(mobile);
            $("#displayHome").text(home);
            closeOffcanvas('offcanvasContact');
        });
    });

    $('#offcanvasAbout').on('shown.bs.offcanvas', function () {
        $('#inputAbout').val($('#displayAbout').text().trim());
    });
    $('#offcanvasContact').on('shown.bs.offcanvas', function () {
        $('#inputMobile').val($('#displayMobile').text().trim());
        $('#inputHome').val($('#displayHome').text().trim());
    });
    $('#offcanvasProfile').on('shown.bs.offcanvas', function () {
        $('#inputFirstName').val(userData.firstName || '');
        $('#inputLastName').val(userData.lastName || '');
        $('#inputLocation').val($('#displayLocation').text().trim());
        $('#inputExperience').val($('#displayExperience').text().trim());
        
        $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload')
            .removeClass("btn-success").addClass("btn-dark")
            .prop('disabled', false);
        selectedFile = null;
        $("#profilePicture").val('');
        $("#profilePicture").removeData('uploaded-url');
        $('#profilePreview').attr('src', $('#profilePic').attr('src'));
    });

    $('#profilePicture').on('change', function (e) {
        selectedFile = e.target.files[0];
        
        if (!selectedFile) {
            $('#profilePreview').attr('src', $('#profilePic').attr('src'));
            return;
        }

        if (!selectedFile.type.startsWith('image/')) {
            showErrorMessage("Please select a valid image file (JPG, PNG, GIF, etc.)");
            $(this).val('');
            selectedFile = null;
            $('#profilePreview').attr('src', $('#profilePic').attr('src'));
            return;
        }

        if (selectedFile.size > 2 * 1024 * 1024) {
            showErrorMessage("File size must be less than 2MB. Current size: " + (selectedFile.size / (1024 * 1024)).toFixed(2) + "MB");
            $(this).val('');
            selectedFile = null;
            $('#profilePreview').attr('src', $('#profilePic').attr('src'));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
            $('#profilePreview').attr('src', evt.target.result);
        };
        reader.onerror = function() {
            showErrorMessage("Failed to read the selected file.");
            $('#profilePreview').attr('src', $('#profilePic').attr('src'));
        };
        reader.readAsDataURL(selectedFile);
    });

    $('#uploadBtn').on('click', function () {
        if (!selectedFile) {
            showErrorMessage("Please select an image first.");
            return;
        }
        
        if (!token) {
            showErrorMessage("Authentication token not found. Please login again.");
            return;
        }

        let formData = new FormData();
        formData.append("profilePic", selectedFile);

        $.ajax({
            url: "http://localhost:8080/api/v1/image/upload",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: { "Authorization": `Bearer ${token}` },
            beforeSend: function () {
                $("#uploadBtn").html('<span class="spinner-border spinner-border-sm"></span> Uploading...');
                $("#uploadBtn").prop('disabled', true);
            },
            success: function (response) {
                try {
                    let imageUrl = response.data || response.url || response.imageUrl || response;
                    
                    if (!imageUrl) {
                        throw new Error("No image URL returned from server");
                    }
                    
                    $("#profilePreview").attr("src", imageUrl);
                    $("#profilePic").attr("src", imageUrl);
                    $("#uploadBtn").html('<i class="bi bi-check-circle"></i> Uploaded')
                        .removeClass("btn-dark").addClass("btn-success")
                        .prop('disabled', false);
                    $("#profilePicture").data('uploaded-url', imageUrl);
                    selectedFile = null;
                    $("#profilePicture").val('');
                    
                    showSuccessMessage("Profile picture uploaded successfully!");
                } catch (error) {
                    console.error("Upload success but error processing response:", error);
                    showErrorMessage("Upload completed but failed to process response: " + error.message);
                    $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload')
                        .removeClass("btn-success").addClass("btn-dark")
                        .prop('disabled', false);
                }
            },
            error: function (xhr) {
                console.error("Upload failed:", xhr.responseText);
                let errorMessage = "Upload failed: ";
                
                if (xhr.status === 413) {
                    errorMessage += "File too large";
                } else if (xhr.status === 415) {
                    errorMessage += "Unsupported file type";
                } else if (xhr.status === 401) {
                    errorMessage += "Authentication failed. Please login again.";
                } else {
                    errorMessage += xhr.responseJSON?.message || xhr.responseText || "Unknown error";
                }
                
                showErrorMessage(errorMessage);
                $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload')
                    .removeClass("btn-success").addClass("btn-dark")
                    .prop('disabled', false);
            }
        });
    });
});
