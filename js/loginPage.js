$(document).ready(function() {
    $('#loginBtn').click(function(event) {
        event.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();

        if (email === '' || password === '') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill in all fields.'
            });
            return;
        }

        const loginData = {
            email: email,
            password: password
        };

        $.ajax({
            type: 'POST',
            url: 'http://localhost:8080/api/v1/auth/login',
            data: JSON.stringify(loginData),
            contentType: 'application/json',
            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: response.message
                }).then(() => {
                    cookieStore.set('token', response.data.token);
                    cookieStore.set('user_role', response.data.role);
                    cookieStore.set('first_name', response.data.firstName);

                    if (response.data.role === 'FREELANCER') {
                        window.location.href = '../pages/freelancerDashboard.html';
                        return;
                    }

                    if (response.data.role === 'CLIENT') {
                        window.location.href = '../pages/clientDashboard.html';
                        return;
                    }
                    
                    if (response.data.role === 'ADMIN') {
                        window.location.href = '../pages/adminDashboard.html';
                        return;
                    }
                });

            },
            error: function(xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Invalid email or password.'
                });
            }
        });

    });
});