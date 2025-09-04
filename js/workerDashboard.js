import tokenHandler from './util/tokenRefreshHandler.js'; 


$(document).ready(function () {
    
    initializeDashboard();

    $('#logoutBtn').click(function () {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of your account.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.removeCookie('token', { path: '/' });
                $.removeCookie('refresh_token', { path: '/' });
                $.removeCookie('user_role', { path: '/' });
                $.removeCookie('userId', { path: '/' });
                $.removeCookie('profile_complete', { path: '/' });

                Swal.fire({
                    icon: 'success',
                    title: 'Logged out successfully!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '../pages/loginPage.html';
                });
            }
        });
    });

    $('.nav-link').click(function (e) {
        e.preventDefault();

        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        $('.dashboard-content').hide();

        const targetSection = $(this).data('section');
        $('#' + targetSection).show();

        window.location.hash = $(this).attr('href');
    });

    $('.job-item button').click(function () {
        const jobTitle = $(this).closest('.job-item').find('h6').text();

        Swal.fire({
            title: 'Apply for Job',
            text: `Do you want to apply for "${jobTitle}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, apply!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Application Submitted!',
                    text: 'Your application has been sent to the client.',
                    timer: 2000,
                    showConfirmButton: false
                });

                $(this).removeClass('btn-outline-primary')
                    .addClass('btn-success')
                    .text('Applied')
                    .prop('disabled', true);
            }
        });
    });
    
    const isProfileComplete = $.cookie('profile_complete') === 'true';
    console.log('Profile complete cookie value:', $.cookie('profile_complete'));
    console.log('Is profile complete:', isProfileComplete); 
    
    if (isProfileComplete) {
        $('.card-body:contains("Complete Profile")').each(function () {
            console.log('Found card body with Complete Profile text'); 
            
            $(this).find('a:contains("Complete Profile")')
                .prop('disabled', true)
                .text('Profile Completed')
                .off('click') 
                .css('pointer-events', 'none');
                
            $(this).closest('.card').find('.card-header h5').text('Professional Profile');
            
            $(this).find('.progress-bar')
                .css('width', '100%')
                .attr('aria-valuenow', '100')
                .text('100%')
                
            $(this).find('.fas.fa-times.text-danger')
                .removeClass('fa-times text-danger')
                .addClass('fa-check text-success');
        });
    }

    $('.card-body button:contains("Complete Profile")').click(function () {
        Swal.fire({
            icon: 'info',
            title: 'Complete Your Profile',
            text: 'Redirecting to profile completion...',
            timer: 1500,
            showConfirmButton: false
        });
        window.location.href = '../pages/profileCompletion.html';
    });

    setTimeout(() => {
        if ($('#messages-section').is(':visible')) {
            showNotification('You have 2 new messages!', 'info');
        }
    }, 3000);
});

function initializeDashboard() {
    const workerId = $.cookie("userId");
    const token = $.cookie("token");
       if (token) {
            tokenHandler.scheduleSilentRefresh(token);
        }
    let userData = {};

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

    console.log('User Info:' , userData);


    if (userData.firstName) {
        $('#firstName').text(userData.firstName);
        $('#userName').text(userData.firstName);
    }
    if (userData.lastName) {
        $('#lastName').text(userData.lastName);
    }
    if (userData.email) {
        $('#email').text(userData.email);
    }

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Authentication Required',
            text: 'Please login to access the dashboard.',
        }).then(() => {
            window.location.href = '../pages/loginPage.html';
        });
        return;
    }

    $('.nav-link[data-section="dashboard-section"]').addClass('active');
    $('#dashboard-section').show();
}

function showNotification(message, type = 'info') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
}

setInterval(() => {
    const earnings = Math.floor(Math.random() * 100) + 2450;
    $('.card-body h3:contains("$")').text('$' + earnings.toLocaleString());
}, 30000);