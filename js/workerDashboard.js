$(document).ready(function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Logout functionality
    $('#logoutBtn').click(function() {
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
                $.removeCookie('first_name', { path: '/' });

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

    // Navigation functionality
    $('.nav-link').click(function(e) {
        e.preventDefault();
        
        // Remove active class from all nav links
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        
        // Hide all sections
        $('.dashboard-content').hide();
        
        // Show selected section
        const targetSection = $(this).data('section');
        $('#' + targetSection).show();
        
        // Update URL hash
        window.location.hash = $(this).attr('href');
    });

    // Job application functionality
    $('.job-item button').click(function() {
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
                // Here you would typically send an API request
                Swal.fire({
                    icon: 'success',
                    title: 'Application Submitted!',
                    text: 'Your application has been sent to the client.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Update button state
                $(this).removeClass('btn-outline-primary')
                       .addClass('btn-success')
                       .text('Applied')
                       .prop('disabled', true);
            }
        });
    });

    // Profile completion functionality
    $('.card-body button:contains("Complete Profile")').click(function() {
        Swal.fire({
            icon: 'info',
            title: 'Complete Your Profile',
            text: 'Redirecting to profile completion...',
            timer: 1500,
            showConfirmButton: false
        });
        window.location.href = '../pages/profileCompletion.html';
        // Here you would redirect to profile completion page
    });

    // Message notification (simulate new messages)
    setTimeout(() => {
        if ($('#messages-section').is(':visible')) {
            showNotification('You have 2 new messages!', 'info');
        }
    }, 3000);
});

// Initialize dashboard with user data
function initializeDashboard() {
    const firstName = $.cookie('first_name');
    if (firstName) {
        $('#freelancerName').text(firstName);
    }
    
    // Check authentication
    const token = $.cookie('token');
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

    // Set default active section
    $('.nav-link[data-section="dashboard-section"]').addClass('active');
    $('#dashboard-section').show();
}

// Utility function to show notifications
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

// Simulate real-time updates
setInterval(() => {
    // Update statistics occasionally
    const earnings = Math.floor(Math.random() * 100) + 2450;
    $('.card-body h3:contains("$")').text('$' + earnings.toLocaleString());
}, 30000);