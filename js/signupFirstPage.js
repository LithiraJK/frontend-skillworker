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
        if (selectedType === 'freelancer') {
            $('#continueBtn').text('Join as a Freelancer');
        } else {
            $('#continueBtn').text('Join as a Client');
        }
    });

    // Handle continue button click
    $('#continueBtn').on('click', function () {
        if (selectedType === 'freelancer') {
            window.location.href = '../pages/signupSecondPage.html?role=FREELANCER';
        } else if (selectedType === 'client') {
            window.location.href = '../pages/signupSecondPage.html?role=CLIENT';
        }
    });
});
