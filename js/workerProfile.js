$(document).ready(function () {
    let skills = []; // Will be loaded from backend
    let selectedFile = null;
    const workerId = localStorage.getItem("workerId");
    const token = $.cookie("token");
    let userData = {
        firstName: $.cookie('first_name') || "Unnamed",
        lastName: $.cookie('last_name') || "Unnamed",
        email: $.cookie('email') || "Unnamed",
    };

    // Escape HTML
    function escapeHtml(text) {
        return $('<div />').text(text).html();
    }

    // Render skills
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

    // Close offcanvas
    function closeOffcanvas(id) {
        const el = $('#' + id)[0];
        const instance = bootstrap.Offcanvas.getInstance(el);
        if (instance) instance.hide();
    }

    // Load worker profile from backend
    function loadWorker() {
        $("#displayName").text(userData.firstName);
        $("#displayEmail").text(userData.email);
        $.ajax({
            url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
            type: "GET",
            headers: { "Authorization": `Bearer ${token}` },
            success: function (res) {
                const w = res.data;
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

    // Update worker profile in backend
    function updateWorker(data, successCb) {
        $.ajax({
            url: `http://localhost:8080/api/v1/worker/update/${workerId}`,
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                if (successCb) successCb();
                loadWorker(); // refresh UI
            },
            error: function (xhr) {
                alert("Update failed: " + xhr.responseText);
            }
        });
    }

    // Initial load
    loadWorker();

    // Remove skill
    $(document).on('click', '.remove-skill', function (e) {
        e.stopPropagation();
        const idx = $(this).closest('.skill-badge').data('index');
        if (idx !== undefined) {
            skills.splice(idx, 1);
            updateWorker({ skills: skills }, renderSkills);
        }
    });

    // ABOUT save
    $('#formAbout').on('submit', function (e) {
        e.preventDefault();
        const text = $('#inputAbout').val().trim();
        updateWorker({ bio: text }, () => {
            $("#displayAbout").text(text);
            closeOffcanvas('offcanvasAbout');
        });
    });

    // PROFILE save
    $('#formProfile').on('submit', function (e) {
        e.preventDefault();

        const location = $('#inputLocation').val().trim();
        const experience = parseInt($('#inputExperience').val().trim()) || 0;
        const uploadedUrl = $('#profilePicture').data('uploaded-url');

        updateWorker({
            workerId: workerId,
            experienceYears: experience,
            profilePictureUrl: uploadedUrl,
            locations: location ? [{ name: location }] : undefined
        }, () => {
            $("#displayLocation").text(location);
            $("#displayExperience").text(experience);
            if (uploadedUrl) $("#profilePic").attr("src", uploadedUrl);
            closeOffcanvas('offcanvasProfile');
        });
    });

    // SKILLS save
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

    // CONTACT save
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

    // Offcanvas input sync
    $('#offcanvasAbout').on('shown.bs.offcanvas', function () {
        $('#inputAbout').val($('#displayAbout').text().trim());
    });
    $('#offcanvasContact').on('shown.bs.offcanvas', function () {
        $('#inputMobile').val($('#displayMobile').text().trim());
        $('#inputHome').val($('#displayHome').text().trim());
    });
    $('#offcanvasProfile').on('shown.bs.offcanvas', function () {
        $('#inputExperience').val($('#displayExperience').text().trim());
        $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload')
            .removeClass("btn-success").addClass("btn-dark")
            .prop('disabled', false);
        selectedFile = null;
        $("#profilePicture").val('');
        $("#profilePicture").removeData('uploaded-url');
        $('#profilePreview').attr('src', $('#profilePic').attr('src'));
    });

    // File select + preview
    $('#profilePicture').on('change', function (e) {
        selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            if (selectedFile.size > 2 * 1024 * 1024) {
                alert("File size must be less than 2MB");
                $(this).val(''); selectedFile = null; return;
            }
            const reader = new FileReader();
            reader.onload = evt => $('#profilePreview').attr('src', evt.target.result);
            reader.readAsDataURL(selectedFile);
        } else {
            alert("Please select a valid image file");
            $(this).val(''); selectedFile = null;
        }
    });

    // Upload image
    $('#uploadBtn').on('click', function () {
        if (!selectedFile) { alert("Please select an image first."); return; }
        if (!token) { alert("Authentication token not found."); return; }

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
                let imageUrl = response.data || response.url || response.imageUrl || response;
                $("#profilePreview").attr("src", imageUrl);
                $("#profilePic").attr("src", imageUrl);
                $("#uploadBtn").html('<i class="bi bi-check-circle"></i> Uploaded')
                    .removeClass("btn-dark").addClass("btn-success")
                    .prop('disabled', false);
                $("#profilePicture").data('uploaded-url', imageUrl);
                selectedFile = null;
                $("#profilePicture").val('');
            },
            error: function (xhr) {
                alert("Upload failed: " + xhr.responseText);
                $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload')
                    .removeClass("btn-success").addClass("btn-dark")
                    .prop('disabled', false);
            }
        });
    });
});
