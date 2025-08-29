$(document).ready(function () {
    // Real-time validation for form fields
    $('#adTitle').on('input', function () {
        const currentLength = $(this).val().trim().length;
        const minLength = 10;

        if (currentLength < minLength) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#adDescription').on('input', function () {
        const currentLength = $(this).val().length;
        const minLength = 50;

        if (currentLength < minLength) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#startingPrice').on('input', function () {
        const value = parseFloat($(this).val());

        if (isNaN(value) || value <= 0) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#categoryId, #serviceAreas').on('change', function () {
        if ($(this).val()) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
            $(this).removeClass('is-valid').addClass('is-invalid');
        }
    });

    // Handle Create Ad form submission
    $('#saveAdBtn').on('click', function () {
        if (validateAdForm()) {
            createAd();
        }
    });

    // Form validation
    function validateAdForm() {
        const title = $('#adTitle').val().trim();
        const description = $('#adDescription').val().trim();
        const startingPrice = $('#startingPrice').val();
        const categoryId = $('#categoryId').val();
        const serviceAreas = $('#serviceAreas').val();

        // Reset previous validation states
        $('.form-control, .form-select').removeClass('is-invalid');

        if (!title || title.length < 10) {
            showError('Ad title must be at least 10 characters long');
            $('#adTitle').addClass('is-invalid').focus();
            return false;
        }

        if (!description || description.length < 50) {
            showError('Description must be at least 50 characters long');
            $('#adDescription').addClass('is-invalid').focus();
            return false;
        }

        if (!startingPrice || parseFloat(startingPrice) <= 0) {
            showError('Please enter a valid starting price');
            $('#startingPrice').addClass('is-invalid').focus();
            return false;
        }

        if (!categoryId) {
            showError('Please select a service category');
            $('#categoryId').addClass('is-invalid').focus();
            return false;
        }

        if (!serviceAreas) {
            showError('Please select your service location');
            $('#serviceAreas').addClass('is-invalid').focus();
            return false;
        }

        return true;
    }

    // Create ad function
    function createAd() {
        const token = $.cookie('token');

        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }

        // Prepare form data
        const formData = {
            title: $('#adTitle').val().trim(),
            description: $('#adDescription').val().trim(),
            startingPrice: parseFloat($('#startingPrice').val()),
            status: 'PENDING', // Default status for new ads
            categoryId: parseInt($('#categoryId').val()),
            serviceAreas: parseInt($('#serviceAreas').val())
        };

        // Show loading state
        $('#saveAdBtn').html('<span class="spinner-border spinner-border-sm me-1"></span>Creating...');
        $('#saveAdBtn').prop('disabled', true);

        // API call
        $.ajax({
            url: 'http://localhost:8080/api/v1/ads',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: JSON.stringify(formData),
            success: function (response) {
                console.log('Ad created successfully:', response);

                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: 'Your ad has been created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#198754'
                }).then(() => {
                    // Close offcanvas and refresh page
                    $('#createAdOffcanvas').offcanvas('hide');
                    location.reload();
                });
            },
            error: function (xhr, status, error) {
                console.error('Failed to create ad:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });

                let errorMessage = 'Failed to create ad. Please try again.';

                if (xhr.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                } else if (xhr.status === 400) {
                    errorMessage = 'Invalid data provided. Please check your inputs.';
                } else if (xhr.responseText) {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.message || errorResponse.error || errorMessage;
                    } catch (e) {
                        // Use default error message
                    }
                }

                showError(errorMessage);
            },
            complete: function () {
                // Reset button state
                $('#saveAdBtn').html('<i class="fas fa-save me-1"></i>Create Ad');
                $('#saveAdBtn').prop('disabled', false);
            }
        });
    }

    // Error message helper
    function showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }

    // Form reset function
    function resetForm() {
        $('#createAdForm')[0].reset();
        $('.form-control, .form-select').removeClass('is-valid is-invalid');
        $('#saveAdBtn').html('<i class="fas fa-save me-1"></i>Create Ad');
        $('#saveAdBtn').prop('disabled', false);
    }

    // Reset form when offcanvas is closed
    $('#createAdOffcanvas').on('hidden.bs.offcanvas', function () {
        resetForm();
    });

    // Initialize form when offcanvas opens
    $('#createAdOffcanvas').on('shown.bs.offcanvas', function () {
        $('#adTitle').focus();
    });
});