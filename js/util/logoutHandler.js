/**
 * Logout Handler Utility
 * Handles user logout functionality across all pages
 */

function handleLogout() {
    try {
        removeAllAuthCookies();

        clearSessionStorage();

        clearUserLocalStorage();

        console.log('User logged out successfully');

        window.location.href = '/pages/login-page.html';

    } catch (error) {
        console.error('Error during logout:', error);
        window.location.href = '/pages/login-page.html';
    }
}

function removeAllAuthCookies() {
    const cookiesToRemove = [
        'token',
        'refreshToken',
        'userRole',
        'userId',
        'userName',
        'userEmail',
        'isAuthenticated',
        'sessionId',
        'authToken',
        'jwt',
        'access_token',
        'user_session'
    ];

    cookiesToRemove.forEach(cookieName => {
        removeCookie(cookieName, '/');
        removeCookie(cookieName, '/pages/');
        removeCookie(cookieName, '');
    });
}

function removeCookie(name, path = '/') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;

    const domain = window.location.hostname;
    if (domain && domain !== 'localhost') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
    }

    if (window.$ && window.$.removeCookie) {
        window.$.removeCookie(name, { path: path });
    }
}

function clearSessionStorage() {
    try {
        if (typeof(Storage) !== "undefined" && sessionStorage) {
            sessionStorage.clear();
        }
    } catch (error) {
        console.warn('Could not clear session storage:', error);
    }
}

function clearUserLocalStorage() {
    try {
        if (typeof(Storage) !== "undefined" && localStorage) {
            const keysToRemove = [
                'user',
                'userProfile',
                'authData',
                'userPreferences',
                'dashboardData',
                'userSettings'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
        }
    } catch (error) {
        console.warn('Could not clear local storage:', error);
    }
}

function initializeLogoutButtons() {
    $(document).ready(function() {
        // Handle logout button clicks
        $(document).on('click', '#logoutBtn, .logout-btn, [data-action="logout"]', function(e) {
            e.preventDefault();

            Swal.fire({
                title: 'Are you sure?',
                text: 'You will be logged out of your account',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, logout!',
                cancelButtonText: 'Cancel',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Logging out...',
                        text: 'Please wait',
                        icon: 'info',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    setTimeout(() => {
                        handleLogout();
                    }, 1000);
                }
            });
        });

        $(document).on('keydown', function(e) {
            if (e.ctrlKey && e.altKey && e.key === 'l') {
                e.preventDefault();

                Swal.fire({
                    title: 'Keyboard Logout',
                    text: 'Are you sure you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, logout!',
                    cancelButtonText: 'Cancel',
                    reverseButtons: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Show loading state
                        Swal.fire({
                            title: 'Logging out...',
                            text: 'Please wait',
                            icon: 'info',
                            allowOutsideClick: false,
                            showConfirmButton: false,
                            willOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        setTimeout(() => {
                            handleLogout();
                        }, 500);
                    }
                });
            }
        });
    });
}

// Auto-initialize when script is loaded
initializeLogoutButtons();

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleLogout,
        removeAllAuthCookies,
        clearSessionStorage,
        clearUserLocalStorage
    };
}
