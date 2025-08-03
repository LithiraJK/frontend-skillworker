$(document).ready(function () {
    $('#signupButton').click(function (e) {
        e.preventDefault();

        console.log("Signing up clicked");
        let userData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            role: new URLSearchParams(window.location.search).get('role')
        };

        console.log(userData);

        $.ajax({
            url: 'http://localhost:8080/api/v1/auth/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function(response) {
                console.log(response.message);
                Swal.fire({
                    icon: 'success',
                    title: 'Sign-up Successful',
                    text: response.message
                });
                window.location.href = '../pages/loginPage.html';
            },
            error: function(error) {
                console.error("Sign-up failed:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Sign-up Failed',
                    text: error.message
                });
            }
        });


        

    });
});
