$(document).ready(function() {
    console.log("Document is ready!");

    $('#getStartedBtn').on('click', function() {
        console.log("Get Started button clicked!");
        window.location.href = 'pages/loginPage.html';
    });
    
});