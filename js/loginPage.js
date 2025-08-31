
$(document).ready(function () {
    $('#loginBtn').click(async function (event) {
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

        try {
            const response = await $.ajax({
                type: 'POST',
                url: 'http://localhost:8080/api/v1/auth/login',
                data: JSON.stringify(loginData),
                contentType: 'application/json'
            });

            await Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: response.message
            });

            $.cookie('token', response.data.token, { path: '/' });
            $.cookie('refresh_token', response.data.refreshToken, { path: '/' });
            $.cookie('user_role', response.data.role, { path: '/' });
            $.cookie('first_name', response.data.firstName, { path: '/' });
            $.cookie('last_name', response.data.lastName, { path: '/' });
            $.cookie('email', response.data.email, { path: '/' });
            $.cookie('userId', response.data.userId, { path: '/' });

            localStorage.setItem("workerId", response.data.userId);

            // Redirect based on role
            if (response.data.role === 'WORKER') {
                window.location.href = '../pages/worker-dashboard.html';
                return;
            }
            if (response.data.role === 'CLIENT') {
                window.location.href = '../pages/client-dashboard.html';
                return;
            }
            if (response.data.role === 'ADMIN') {
                window.location.href = '../pages/admin-dashboard.html';
                return;
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid email or password.'
            });
        }

    });

});