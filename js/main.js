$(document).ready(function () {
    console.log("Document is ready!");

    $('#getStartedBtn').on('click', function () {
        console.log("Get Started button clicked!");
        window.location.href = 'pages/login-page.html';
    });

    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        const searchQuery = $('#searchQuery').val();
        const location = $('#location').val();
        console.log('Searching for:', searchQuery, 'in', location);
    });

    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });

    $(window).scroll(function () {
        if ($(window).scrollTop() > 50) {
            $('.navbar-custom').addClass('shadow-sm');
        } else {
            $('.navbar-custom').removeClass('shadow-sm');
        }
    });

});
