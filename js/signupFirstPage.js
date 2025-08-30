$(document).ready(function () {
    let selectedType = null;

    $('.user-type-toggle').on('click', function () {
        // Remove active class from all cards
        $('.user-type-toggle').removeClass('active');

        // Add active class to clicked card
        $(this).addClass('active');

        // Store selected type
        selectedType = $(this).data('type');

        // Enable continue button
        $('#continueBtn').prop('disabled', false);

        // Update button text based on selection
        if (selectedType === 'worker') {
            $('#continueBtn').text('Join as a Worker');
        } else {
            $('#continueBtn').text('Join as a Client');
        }
    });

    // Handle continue button click
    $('#continueBtn').on('click', function () {
        if (selectedType === 'worker') {
            window.location.href = '../pages/signup-second-page.html?role=WORKER';
        } else if (selectedType === 'client') {
            window.location.href = '../pages/signup-second-page.html?role=CLIENT';
        }
    });
});
