console.log("Token Refresh Handler Loaded");

// Helper function to decode JWT expiry time (milliseconds)
function getTokenExpiry(token) {

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000;
    } catch (error) {
        console.error("Invalid token format", error);
        return null;
    }
}

// Schedule silent refresh 1 minute before expiry
function scheduleSilentRefresh(token) {

    console.log("Scheduling silent refresh for token ");

    const expiry = getTokenExpiry(token);

    if (!expiry) return;

    const now = Date.now();
    const refreshAt = expiry - 60000; // 1 minute before expiry
    const delay = refreshAt - now;


    if (delay <= 0) {
        console.log("Token expiring soon or expired, refreshing now...");
        refreshAccessToken().catch(() => { 
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Please log in again.'
            });
            window.location.href = '../pages/login-page.html';
         });
        return;
    }

    console.log(`Scheduling silent refresh in ${Math.floor(delay / 1000)} seconds`);

    setTimeout(() => {
        console.log("Silent token refresh running...");
        refreshAccessToken().catch(() => {
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Please log in again.'
            });
            window.location.href = '../pages/login-page.html';
        });
    }, delay);
}

// Promise wrapper for $.ajax to use async/await
function ajaxAsync(options) {
    return new Promise((resolve, reject) => {
        $.ajax({
            ...options,
            success: resolve,
            error: (jqxhr, textStatus, errorThrown) => reject({ jqxhr, textStatus, errorThrown })
        });
    });
}

// Refresh access token function
async function refreshAccessToken() {
    console.log("Refreshing access token...");


    const refreshToken = $.cookie('refresh_token');

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    try {
        const response = await ajaxAsync({
            type: 'POST',
            url: 'http://localhost:8080/api/v1/auth/refresh',
            headers: { 'Authorization': 'Bearer ' + refreshToken }
        });

        const newToken = response.data?.token;
        const newRefreshToken = response.data?.refreshToken;

        if (!newToken) throw new Error("Invalid refresh token response");

        $.cookie('token', newToken, { path: '/' });
        if (newRefreshToken) {
            $.cookie('refresh_token', newRefreshToken, { path: '/' });
        }

        console.log("Token refreshed successfully");
        scheduleSilentRefresh(newToken);

        return newToken;

    } catch (error) {
        console.error("Refresh token failed", error);
        await Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Please log in again.'
        });
        window.location.href = '../pages/login-page.html';
        throw error;
    }
}

// Global AJAX error handler for 401 Unauthorized with retry
$(document).ajaxError(async (event, jqxhr, settings) => {
    if (jqxhr.status === 401 && !settings.url.includes('/auth/refresh')) {
        console.log("401 Unauthorized detected, trying to refresh token...");
        try {
            const newToken = await refreshAccessToken();
            $.ajax({
                type: settings.type,
                url: settings.url,
                data: settings.data,
                headers: Object.assign({}, settings.headers, {
                    'Authorization': 'Bearer ' + newToken
                }),
                success: settings.success,
                error: settings.error
            });
        } catch (error) {
            console.error("Token refresh retry failed", error);
            await Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Please log in again.'
            }).then(() => {
                window.location.href = '../pages/login-page.html';
            });
        }
    }
});

// Make tokenHandler globally available
window.tokenHandler = {
    refreshAccessToken,
    scheduleSilentRefresh
};