import tokenHandler from './util/tokenRefreshHandler.js'; 

$(document).ready(function() {
    $('#changeTextBtn').click(async function() {
        const token = await $.cookie('token');

        if (token) {
        tokenHandler.scheduleSilentRefresh(token);
        
        $.ajax({
            url: 'http://localhost:8080/api/hello',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },

            success: function(response) {
                console.log("Data fetched successfully:", response);
                $('#text').text(response);
            },
            error: function(error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to fetch data.'
                });
            }
        });

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Required',
                text: 'Please login to access this feature.',
            }).then(() => {
                window.location.href = '../pages/login-page.html';
            });
        }
    });


    $('#logoutBtn').click(function() {
        $.removeCookie('token', { path: '/' });
        $.removeCookie('refresh_token', { path: '/' });
        $.removeCookie('user_role', { path: '/' });
        $.removeCookie('first_name', { path: '/' });
        $.removeCookie('last_name', { path: '/' });
        $.removeCookie('email', { path: '/' });

        window.location.href = '../pages/login-page.html';
    });
});