import tokenHandler from './util/tokenRefreshHandler.js';

$(document).ready(function() {
    console.log("Admin Dashboard Loaded");
    
    $('#changeTextBtn').click(async function() {
        console.log("Change Text button clicked");

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
        window.location.href = '../pages/loginPage.html';
    }

    });
});