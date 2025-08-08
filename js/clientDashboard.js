$(document).ready(function() {
    $('#logoutBtn').click(function() {
        cookieStore.delete('token');
        cookieStore.delete('user_role');

        window.location.href = '../pages/loginPage.html';
    });
});