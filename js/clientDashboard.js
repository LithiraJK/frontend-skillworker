
$(document).ready(function() {
    $('#logoutBtn').click(function() {
        $.removeCookie('token', { path: '/' });
        $.removeCookie('refresh_token', { path: '/' });
        $.removeCookie('user_role', { path: '/' });
        $.removeCookie('first_name', { path: '/' });

        window.location.href = '../pages/loginPage.html';
    });
});