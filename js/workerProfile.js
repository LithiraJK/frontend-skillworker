let selectedFile = null;

// Preview locally before upload
document.getElementById('profilePicture').addEventListener('change', function (e) {
    selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        // Validate file size (max 2MB)
        if (selectedFile.size > 2 * 1024 * 1024) {
            alert("File size must be less than 2MB");
            this.value = '';
            selectedFile = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = function (evt) {
            document.getElementById('profilePreview').src = evt.target.result;
        };
        reader.readAsDataURL(selectedFile);
    } else {
        alert("Please select a valid image file");
        this.value = '';
        selectedFile = null;
    }
});

// Upload to backend (which uploads to Cloudinary)
document.getElementById('uploadBtn').addEventListener('click', function () {
    
    const token = $.cookie('token');

    console.log('Token:', token ? 'Found' : 'Not found');

    if (!selectedFile) {
        alert("Please select an image first.");
        return;
    }

    if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
    }

    let formData = new FormData();
    formData.append("profilePic", selectedFile);

    // AJAX request to your backend endpoint
    $.ajax({
        url: "http://localhost:8080/api/v1/image/upload",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            "Authorization": `Bearer ${token}`
        },
        beforeSend: function () {
            $("#uploadBtn").html('<span class="spinner-border spinner-border-sm"></span> Uploading...');
            $("#uploadBtn").prop('disabled', true);
        },
        success: function (response) {
            console.log('Upload success:', response);

            // Handle different response formats
            let imageUrl = response;
            if (typeof response === 'object') {
                imageUrl = response.data || response.url || response.imageUrl || response;
            }

            // Update both preview and main profile picture
            $("#profilePreview").attr("src", imageUrl);
            $("#profilePic").attr("src", imageUrl);

            $("#uploadBtn").html('<i class="bi bi-check-circle"></i> Uploaded');
            $("#uploadBtn").removeClass("btn-dark").addClass("btn-success");
            $("#uploadBtn").prop('disabled', false);

            // Store the uploaded image URL for form submission
            $("#profilePicture").data('uploaded-url', imageUrl);

            // Reset file input
            selectedFile = null;
            $("#profilePicture").val('');
        },
        error: function (xhr, status, error) {
            console.error('Upload failed:', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
                error: error
            });

            let errorMessage = "Upload failed. Please try again.";

            if (xhr.status === 401) {
                errorMessage = "Authentication failed. Please login again.";
            } else if (xhr.status === 413) {
                errorMessage = "File too large. Please select a smaller image.";
            } else if (xhr.status === 415) {
                errorMessage = "Invalid file type. Please select an image file.";
            } else if (xhr.responseText) {
                try {
                    const errorResponse = JSON.parse(xhr.responseText);
                    errorMessage = errorResponse.message || errorResponse.error || errorMessage;
                } catch (e) {
                    // Use default error message if response is not JSON
                }
            }

            alert(errorMessage);
            $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload');
            $("#uploadBtn").removeClass("btn-success").addClass("btn-dark");
            $("#uploadBtn").prop('disabled', false);
        }
    });
});


// Initial sample skills (this can be loaded from backend)
let skills = ['Plumbing', 'Pipe Installation', 'Maintenance'];

// Render skills badges in main page and inside Offcanvas existing list
function renderSkills() {
    const cont = $('#skillsContainer').empty();
    const existing = $('#existingSkills').empty();
    skills.forEach((s, idx) => {
        const badge = $(`
        <span class="skill-badge" data-index="${idx}">
            <span class="skill-text">${escapeHtml(s)}</span>
            <button type="button" class="remove-skill" title="Remove skill"><i class="fa-solid fa-xmark"></i></button>
        </span>`);
        cont.append(badge.clone(true));
        existing.append(badge);
    });
    // if none show placeholder
    if (skills.length === 0) {
        cont.append('<div class="text-muted">No skills added yet.</div>');
    }
}

// Escape to prevent accidental HTML injection (still safe demo)
function escapeHtml(text) {
    return $('<div />').text(text).html();
}

// Close offcanvas helper
function closeOffcanvas(id) {
    const el = document.getElementById(id);
    const instance = bootstrap.Offcanvas.getInstance(el);
    if (instance) instance.hide();
}

$(function () {
    // Initial render
    renderSkills();

    // Remove skill (delegation)
    $(document).on('click', '.remove-skill', function (e) {
        e.stopPropagation();
        const idx = $(this).closest('.skill-badge').data('index');
        if (idx !== undefined) {
            skills.splice(idx, 1);
            renderSkills();
            // TODO: send DELETE update to backend via AJAX if needed
        }
    });

    // ABOUT save
    $('#formAbout').on('submit', function (e) {
        e.preventDefault();
        const text = $('#inputAbout').val().trim();
        $('#displayAbout').text(text || ''); // update UI
        closeOffcanvas('offcanvasAbout');

        // Example AJAX (uncomment & adapt to persist)
        /*
        $.post('/api/profile/about', {about: text })
          .done(()=>{closeOffcanvas('offcanvasAbout'); })
          .fail(()=>{alert('Save failed'); });
*/
    });

    // PROFILE save (name, location, experience, pic)
    $('#formProfile').on('submit', function (e) {
        e.preventDefault();

        const name = $('#inputName').val().trim();
        const location = $('#inputLocation').val().trim();
        const experience = $('#inputExperience').val().trim();
        const uploadedUrl = $('#profilePicture').data('uploaded-url');

        // Update display
        $('#displayName').text(name || 'Unnamed');
        $('#displayLocation').text(location || '');
        $('#displayExperience').text(experience || '');

        // Update profile picture if a new one was uploaded
        if (uploadedUrl) {
            $('#profilePic').attr('src', uploadedUrl);
        }

        closeOffcanvas('offcanvasProfile');

        // TODO: AJAX to persist all profile data
        /*
        $.ajax({
    url: '/api/profile/update',
method: 'POST',
data: {
    name: name,
location: location,
experience: experience,
profilePicture: uploadedUrl
            },
success: function(response) {
    console.log('Profile updated successfully');
            },
error: function(xhr, status, error) {
    alert('Failed to update profile');
            }
        });
*/
    });

    // SKILLS save (parse comma separated)
    $('#formSkills').on('submit', function (e) {
        e.preventDefault();
        const raw = $('#inputSkills').val().trim();
        if (raw) {
            const parts = raw.split(',').map(s => s.trim()).filter(s => s);
            // add unique new ones
            parts.forEach(p => {
                if (!skills.includes(p)) skills.push(p);
            });
        }
        $('#inputSkills').val('');
        renderSkills();
        closeOffcanvas('offcanvasSkills');

        // TODO: AJAX persist (send full skills array or diffs)
    });

    // CONTACT save
    $('#formContact').on('submit', function (e) {
        e.preventDefault();
        $('#displayMobile').text($('#inputMobile').val().trim() || '');
        $('#displayHome').text($('#inputHome').val().trim() || '');
        closeOffcanvas('offcanvasContact');

        // TODO: AJAX persist
    });

    // When offcanvas opens, keep inputs in sync with current UI
    $('#offcanvasAbout').on('shown.bs.offcanvas', function () {
        $('#inputAbout').val($('#displayAbout').text().trim());
    });
    $('#offcanvasSkills').on('shown.bs.offcanvas', function () {
        $('#inputSkills').val('');
        // render existing list is already done by renderSkills()
    });
    $('#offcanvasContact').on('shown.bs.offcanvas', function () {
        $('#inputMobile').val($('#displayMobile').text().trim());
        $('#inputHome').val($('#displayHome').text().trim());
    });
    $('#offcanvasProfile').on('shown.bs.offcanvas', function () {
        $('#inputName').val($('#displayName').text().trim());
        $('#inputLocation').val($('#displayLocation').text().trim());
        $('#inputExperience').val($('#displayExperience').text().trim());

        // Reset upload button state
        $("#uploadBtn").html('<i class="bi bi-cloud-upload"></i> Upload');
        $("#uploadBtn").removeClass("btn-success").addClass("btn-dark");
        $("#uploadBtn").prop('disabled', false);

        // Clear any selected file
        selectedFile = null;
        $("#profilePicture").val('');
        $("#profilePicture").removeData('uploaded-url');

        // Set preview to current profile picture
        $('#profilePreview').attr('src', $('#profilePic').attr('src'));
    });
});
