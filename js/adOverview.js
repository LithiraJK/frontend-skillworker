import tokenHandler from './util/tokenRefreshHandler.js'; 

$(document).ready(function () {
    const token = $.cookie('token');
    const workerId = $.cookie('userId');

    if (token) {
        tokenHandler.scheduleSilentRefresh(token);
    }

    console.log('Page loaded. Token:', token ? 'Present' : 'Missing', 'WorkerId:', workerId);

    if ($('#adsTable').length === 0) {
        console.error('Table with id "adsTable" not found!');
    } else {
        console.log('Table found successfully');
    }

    getAds();

    $('#adTitle').on('input', function () {
        const currentLength = $(this).val().trim().length;
        const minLength = 10;
        const maxLength = 30;

        if (currentLength < minLength || currentLength > maxLength) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#adDescription').on('input', function () {
        const currentLength = $(this).val().length;
        const minLength = 50;
        const maxLength = 1000;

        if (currentLength < minLength || currentLength > maxLength) {
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

    $('#editAdTitle').on('input', function () {
        const currentLength = $(this).val().trim().length;
        const minLength = 10;
        const maxLength = 30;

        if (currentLength < minLength || currentLength > maxLength) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#editAdDescription').on('input', function () {
        const currentLength = $(this).val().length;
        const minLength = 50;
        const maxLength = 1000;

        if (currentLength < minLength || currentLength > maxLength) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#editStartingPrice').on('input', function () {
        const value = parseFloat($(this).val());

        if (isNaN(value) || value <= 0) {
            $(this).removeClass('is-valid').addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid').addClass('is-valid');
        }
    });

    $('#editCategoryId, #editStatus').on('change', function () {
        if ($(this).val()) {
            $(this).removeClass('is-invalid').addClass('is-valid');
        } else {
            $(this).removeClass('is-valid').addClass('is-invalid');
        }
    });

    $('#saveAdBtn').on('click', function () {
        if (validateAdForm()) {
            createAd();
        }
    });

    $('#updateAdBtn').on('click', function () {
        if (validateEditAdForm()) {
            updateAd();
        }
    });

    function validateAdForm() {
        const title = $('#adTitle').val().trim();
        const description = $('#adDescription').val().trim();
        const startingPrice = $('#startingPrice').val();
        const categoryId = $('#categoryId').val();

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

        return true;
    }

    function validateEditAdForm() {
        const title = $('#editAdTitle').val().trim();
        const description = $('#editAdDescription').val().trim();
        const startingPrice = $('#editStartingPrice').val();
        const categoryId = $('#editCategoryId').val();
        const status = $('#editStatus').val();

        $('#editAdForm .form-control, #editAdForm .form-select').removeClass('is-invalid');

        if (!title || title.length < 10) {
            showError('Ad title must be at least 10 characters long');
            $('#editAdTitle').addClass('is-invalid').focus();
            return false;
        }

        if (!description || description.length < 50) {
            showError('Description must be at least 50 characters long');
            $('#editAdDescription').addClass('is-invalid').focus();
            return false;
        }

        if (!startingPrice || parseFloat(startingPrice) <= 0) {
            showError('Please enter a valid starting price');
            $('#editStartingPrice').addClass('is-invalid').focus();
            return false;
        }

        if (!categoryId) {
            showError('Please select a service category');
            $('#editCategoryId').addClass('is-invalid').focus();
            return false;
        }

        if (!status) {
            showError('Please select a status');
            $('#editStatus').addClass('is-invalid').focus();
            return false;
        }

        return true;
    }

    function createAd() {
        
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }

        const formData = {
            title: $('#adTitle').val().trim(),
            description: $('#adDescription').val().trim(),
            startingPrice: parseFloat($('#startingPrice').val()),
            status: 'PENDING', 
            categoryId: $('#categoryId').val(),
            workerId: workerId
        };

        console.log(formData);

        $('#saveAdBtn').html('<span class="spinner-border spinner-border-sm me-1"></span>Creating...');
        $('#saveAdBtn').prop('disabled', true);

        $.ajax({
            url: 'http://localhost:8080/api/v1/ad/create',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: JSON.stringify(formData),
            success: function (response) {
                console.log('Ad created successfully:', response);

                Swal.fire({
                    title: 'Success!',
                    text: 'Your ad has been created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#198754'
                }).then(() => {
                    $('#createAdOffcanvas').find(':focus').blur();
                    const offcanvasElement = document.getElementById('createAdOffcanvas');
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
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
                    }
                }

                showError(errorMessage);
            },
            complete: function () {
                $('#saveAdBtn').html('<i class="fas fa-save me-1"></i>Create Ad');
                $('#saveAdBtn').prop('disabled', false);
            }
        });
    }

    function updateAd() {
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }

        const adId = $('#editAdId').val();
        const formData = {
            title: $('#editAdTitle').val().trim(),
            description: $('#editAdDescription').val().trim(),
            startingPrice: parseFloat($('#editStartingPrice').val()),
            status: $('#editStatus').val(),
            categoryId: parseInt($('#editCategoryId').val()),
            workerId: parseInt(workerId)
        };

        console.log('Update data:', formData);

        $('#updateAdBtn').html('<span class="spinner-border spinner-border-sm me-1"></span>Updating...');
        $('#updateAdBtn').prop('disabled', true);

        $.ajax({
            url: `http://localhost:8080/api/v1/ad/update/${adId}`,
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: JSON.stringify(formData),
            success: function (response) {
                console.log('Ad updated successfully:', response);

                Swal.fire({
                    title: 'Success!',
                    text: 'Your ad has been updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#198754'
                }).then(() => {
                    $('#editAdOffcanvas').find(':focus').blur();
                    const offcanvasElement = document.getElementById('editAdOffcanvas');
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
                    getAds(); 
                });
            },
            error: function (xhr, status, error) {
                console.error('Failed to update ad:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });

                let errorMessage = 'Failed to update ad. Please try again.';

                if (xhr.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                } else if (xhr.status === 400) {
                    errorMessage = 'Invalid data provided. Please check your inputs.';
                } else if (xhr.responseText) {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        errorMessage = errorResponse.message || errorResponse.error || errorMessage;
                    } catch (e) {
                        alert('Failed to parse error response.');
                    }
                }

                showError(errorMessage);
            },
            complete: function () {
                // Reset button state
                $('#updateAdBtn').html('<i class="fas fa-save me-1"></i>Update Ad');
                $('#updateAdBtn').prop('disabled', false);
            }
        });
    }

    function populateEditForm(adId) {
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }

        console.log('Fetching ad data for ID:', adId);

        $.ajax({
            url: `http://localhost:8080/api/v1/ad/get/${adId}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                console.log('Ad data retrieved:', response);
                
                if (response && response.data) {
                    const ad = response.data;
                    
                    $('#editAdId').val(ad.id);
                    $('#editAdTitle').val(ad.title);
                    $('#editAdDescription').val(ad.description);
                    $('#editStartingPrice').val(ad.startingPrice);
                    $('#editStatus').val(ad.status);
                    
                    
                    $('#editAdForm .form-control, #editAdForm .form-select').removeClass('is-valid is-invalid');
                    
                    // Show the offcanvas
                    const offcanvasElement = document.getElementById('editAdOffcanvas');
                    const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
                    bsOffcanvas.show();
                } else {
                    showError('Failed to load ad data.');
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch ad data:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                
                let errorMessage = 'Failed to load ad data.';
                
                if (xhr.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                } else if (xhr.status === 404) {
                    errorMessage = 'Ad not found.';
                }
                
                showError(errorMessage);
            }
        });
    }

    function getAds(){
        if (!token) {
            showError('Authentication token not found. Please login again.');
            return;
        }
        
        $('#adsTable tbody').empty();
        

        $('#adsTable tbody').html('<tr><td colspan="5" class="text-center">Loading ads...</td></tr>');
        
        $.ajax({
            url: `http://localhost:8080/api/v1/ad/getbyworker/${workerId}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                console.log('API Response:', response);
                $('#adsTable tbody').empty();
                
                if (response && Array.isArray(response.data) && response.data.length > 0) {
                    response.data.forEach(function(ad) {
                        let statusBadge = '';
                        switch (ad.status) {
                            case 'ACTIVE':
                                statusBadge = '<span class="badge bg-success">Active</span>';
                                break;
                            case 'PENDING':
                                statusBadge = '<span class="badge bg-info">Pending</span>';
                                break;
                            case 'INACTIVE':
                                statusBadge = '<span class="badge bg-secondary">Inactive</span>';
                                break;
                            default:
                                statusBadge = `<span class="badge bg-dark">${ad.status}</span>`;
                        }
                        const row = `
                            <tr>
                                <td>${ad.title || 'N/A'}</td>
                                <td>${ad.categoryName || 'N/A'}</td>
                                <td>${ad.createdDate ? ad.createdDate.split('T')[0] : 'N/A'}</td>
                                <td>${statusBadge}</td>
                                <td>
                                    <div class="dropdown">
                                        <button class="btn btn-secondary btn-sm dropdown-toggle" type="button"
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                            Actions
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item" href="#" onclick="previewAd(${ad.id})">Preview</a></li>
                                            <li><a class="dropdown-item" href="#editAdOffcanvas" onclick="editAd(${ad.id})">Edit</a></li>
                                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteAd(${ad.id})">Delete</a></li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        `;
                        $('#adsTable tbody').append(row);
                    });
                } else {
                    $('#adsTable tbody').html('<tr><td colspan="5" class="text-center text-muted">No ads found. <a href="#" data-bs-toggle="offcanvas" data-bs-target="#createAdOffcanvas">Create your first ad</a></td></tr>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to retrieve ads:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    responseText: xhr.responseText,
                    error: error
                });
                
                $('#adsTable tbody').empty();
                let errorMessage = 'Failed to load ads.';
                
                if (xhr.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                    $('#adsTable tbody').html('<tr><td colspan="5" class="text-center text-danger">Authentication failed. <a href="/pages/login-page.html">Please login again</a></td></tr>');
                } else {
                    $('#adsTable tbody').html(`<tr><td colspan="5" class="text-center text-danger">${errorMessage} <button class="btn btn-sm btn-outline-primary ms-2" onclick="getAds()">Retry</button></td></tr>`);
                }
                
                showError(errorMessage);
            }
        });
    }

    function loadCategories(){
        $.ajax({
            url: 'http://localhost:8080/api/v1/category/getactive',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(response) {
                if (response && Array.isArray(response.data)) {
                   
                    $('#categoryId').empty().append('<option value="">Select a category</option>');
                    
                    $('#editCategoryId').empty().append('<option value="">Select a category</option>');
                    
                    response.data.forEach(function(category) {
                        const option = $('<option>', {
                            value: category.id,
                            text: category.name
                        });
                        
                        $('#categoryId').append(option.clone());
                        $('#editCategoryId').append(option.clone());
                    });
                    
                    if ($('#categoryId').hasClass('selectpicker')) {
                        $('#categoryId').selectpicker('refresh');
                    } else {
                        $('#categoryId').selectpicker();
                    }
                    
                    if ($('#editCategoryId').hasClass('selectpicker')) {
                        $('#editCategoryId').selectpicker('refresh');
                    } else {
                        $('#editCategoryId').selectpicker();
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to load categories:', error);
                $('#categoryId').empty().append('<option value="">Select a category</option>');
                $('#categoryId').append('<option value="">Failed to load categories</option>');
                
                $('#editCategoryId').empty().append('<option value="">Select a category</option>');
                $('#editCategoryId').append('<option value="">Failed to load categories</option>');
                
                if ($('#categoryId').hasClass('selectpicker')) {
                    $('#categoryId').selectpicker('refresh');
                }
                
                if ($('#editCategoryId').hasClass('selectpicker')) {
                    $('#editCategoryId').selectpicker('refresh');
                }
            }
        });
    }

    function showError(message) {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#dc3545'
        });
    }

    function resetForm() {
        $('#createAdForm')[0].reset();
        $('.form-control, .form-select').removeClass('is-valid is-invalid');
        $('#saveAdBtn').html('<i class="fas fa-save me-1"></i>Create Ad');
        $('#saveAdBtn').prop('disabled', false);
    }

    function resetEditForm() {
        $('#editAdForm')[0].reset();
        $('#editAdForm .form-control, #editAdForm .form-select').removeClass('is-valid is-invalid');
        $('#updateAdBtn').html('<i class="fas fa-save me-1"></i>Update Ad');
        $('#updateAdBtn').prop('disabled', false);
    }

    $('#createAdOffcanvas').on('hidden.bs.offcanvas', function () {
        resetForm();
    });

    $('#editAdOffcanvas').on('hidden.bs.offcanvas', function () {
        resetEditForm();
    });

    $('#createAdOffcanvas').on('shown.bs.offcanvas', function () {
        $(this).removeAttr('aria-hidden');
    
        
        $('#adTitle').focus();
    });

    $('#editAdOffcanvas').on('shown.bs.offcanvas', function () {
        $(this).removeAttr('aria-hidden');
        
        $('#editAdTitle').focus();
    });

    $('#createAdOffcanvas').on('show.bs.offcanvas', function () {
        $(this).removeAttr('aria-hidden');
    });

    $('#editAdOffcanvas').on('show.bs.offcanvas', function () {
        $(this).removeAttr('aria-hidden');
    });

    $('#createAdOffcanvas').on('hide.bs.offcanvas', function () {
        $(this).find(':focus').blur();
    });

    $('#editAdOffcanvas').on('hide.bs.offcanvas', function () {
        $(this).find(':focus').blur();
    });

    $(function() {
        $('.selectpicker').selectpicker();
        loadCategories();
    });

    // Action functions for table buttons
    window.previewAd = function(adId) {
        console.log('Preview ad:', adId);
        // Navigate to ad preview page with ad ID
        window.location.href = `../pages/ad-preview.html?adId=${adId}`;
    };

    window.editAd = function(adId) {
        console.log('Edit ad:', adId);
        populateEditForm(adId);
    };

    window.deleteAd = function(adId) {
        console.log('Delete ad:', adId);
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Implement actual delete functionality here
                $.ajax({
                    url: `http://localhost:8080/api/v1/ad/delete/${adId}`,
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    success: function(response) {
                        Swal.fire(
                            'Deleted!',
                            'Your ad has been deleted.',
                            'success'
                        );
                        getAds(); // Refresh the table
                    },
                    error: function(xhr, status, error) {
                        Swal.fire(
                            'Error!',
                            'Failed to delete the ad.',
                            'error'
                        );
                    }
                });
            }
        });
    };
});