import tokenHandler from './util/tokenRefreshHandler.js';

let adsData = [];

const token = $.cookie("token");

$(document).ready(function () {


    if (token) {
        tokenHandler.scheduleSilentRefresh(token);
    }

    fetchCategories();
    fetchAds();

    $('#logoutBtn').click(function () {
        $.removeCookie('token', { path: '/' });
        $.removeCookie('refresh_token', { path: '/' });
        $.removeCookie('user_role', { path: '/' });
        $.removeCookie('first_name', { path: '/' });
        $.removeCookie('last_name', { path: '/' });
        $.removeCookie('email', { path: '/' });

        window.location.href = '../pages/login-page.html';
    });

    // Search functionality
    $('#search-form').on('submit', function (e) {
        e.preventDefault();
        const searchTerm = $('#search-input').val().toLowerCase();
        filterAndRenderAds(searchTerm);
    });

    $('#search-input').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        filterAndRenderAds(searchTerm);
    });
});



function fetchCategories() {
    $.ajax({
        url: `http://localhost:8080/api/v1/category/getactive`,
        method: "GET",
        dataType: "json",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.status === 200 && response.data) {
                renderCategories(response.data);
            } else {
                console.warn("No categories found!");
                $('#category-ul').html('<li class="text-muted">No categories available.</li>');
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching categories:", error);
            $('#category-ul').html('<li class="text-danger">Error loading categories.</li>');
        }
    });
}

function renderCategories(categories) {
    const categoryList = $('#category-ul');
    categoryList.empty();

    if (!categories || categories.length === 0) {
        categoryList.html('<li class="text-muted">No categories available.</li>');
        return;
    }

    categoryList.append(`
        <li>
            <a href="#" class="category-link" data-category="all">All Categories</a>
        </li>
    `);

    categories.forEach(category => {
        categoryList.append(`
            <li>
                <a href="#" class="category-link" data-category="${category.categoryId}" data-category-name="${category.name}">
                    ${category.name}
                </a>
            </li>
        `);
    });

    $('.category-link').on('click', function(e) {
        e.preventDefault();
        const categoryId = $(this).data('category');
        const categoryName = $(this).data('category-name');
        
        $('.category-link').removeClass('active');
        $(this).addClass('active');
        
        if (categoryId === 'all') {
            renderAdsWithWorkerDetails(adsData);
        } else {
            filterAdsByCategory(categoryName);
        }
    });
}




function fetchAds() {

    $.ajax({
        url: `http://localhost:8080/api/v1/ad/getall`,
        method: "GET",
        dataType: "json",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.status === 200 && response.data) {
                adsData = response.data;
                renderAdsWithWorkerDetails(adsData);
            } else {
                console.warn("No Ads found!");
                $('.card-container').html('<p class="text-center text-muted">No ads available at the moment.</p>');
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Ads data:", error);
            $('.card-container').html('<p class="text-center text-danger">Error loading ads. Please try again later.</p>');
        }
    });
}


function renderAdsWithWorkerDetails(ads) {
    const cardContainer = $('.card-container');
    cardContainer.empty();

    if (!ads || ads.length === 0) {
        cardContainer.html('<p class="text-center text-muted">No ads available at the moment.</p>');
        return;
    }

    ads.forEach(ad => {
        fetchWorkerDetails(ad.workerId, ad);
    });
}

function fetchWorkerDetails(workerId, ad) {

    $.ajax({
        url: `http://localhost:8080/api/v1/worker/getworker/${workerId}`,
        method: "GET",
        dataType: "json",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.status === 200 && response.data) {
                const worker = response.data;


                $.ajax({
                    url: `http://localhost:8080/api/v1/user/getuser/${workerId}`,
                    method: 'GET',
                    headers: { "Authorization": `Bearer ${token}` },
                    success: function (userResponse) {
                        if (userResponse.status === 200 && userResponse.data) {
                            createAdCard(ad, worker, userResponse.data);
                        } else {
                            createAdCard(ad, worker, null);
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error(`Error fetching user details for ID: ${workerId}`, error);
                        createAdCard(ad, worker, null);
                    }
                });
            } else {
                console.warn(`Worker details not found for ID: ${workerId}`);
                createAdCard(ad, null, null);
            }
        },
        error: function (xhr, status, error) {
            console.error(`Error fetching worker details for ID: ${workerId}`, error);
            createAdCard(ad, null, null);
        }
    });
}



function createAdCard(ad, worker, workerUser) {

    const workerName = workerUser ? `${workerUser.firstName} ${workerUser.lastName}` : 'Unknown Worker';
    const workerTitle = worker ? (worker.categories && worker.categories.length > 0 ? worker.categories[0].name : 'Professional') : 'Service Provider';
    const workerLocation = worker ? (worker.locations && worker.locations.length > 0 && worker.locations[1].district ? worker.locations[0].district : 'Location not specified') : 'Location not specified';
    const workerProfilePic = worker ? (worker.profilePictureUrl || '/assets/images/workerDefualtPP.png') : '/assets/images/workerDefualtPP.png';
    const workerRating = worker ? (worker.rating || 4.0) : 4.0;
    const reviewCount = worker ? (worker.reviewCount || 0) : 0;
    const contactNumber = worker ? (worker.phoneNumbers && worker.phoneNumbers.length > 0 ? worker.phoneNumbers[0] : null) : null;

    const cardHtml = `
        <div class="card service-card modern-service-card border-0 shadow-sm h-100">
            <div class="card-body p-4">
                <!-- Service Provider Info -->
                <div class="d-flex align-items-center mb-3">
                    <img src="${workerProfilePic}" class="rounded-circle me-3" width="50"
                        height="50" alt="Profile Picture" style="object-fit: cover; border: 2px solid #f8f9fa;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-semibold text-dark">${workerName}</h6>
                        <p class="mb-0 text-muted small">${workerTitle}</p>
                        <p class="mb-0 text-muted small">
                            <i class="fas fa-map-marker-alt text-warning me-1"></i>
                            ${workerLocation}
                        </p>
                    </div>
                </div>

                <!-- Service Details -->
                <div class="service-details">
                    <h5 class="card-title mb-2 fw-bold text-dark">${ad.title}</h5>

                    <!-- Rating -->
                    <div class="d-flex align-items-center mb-3">
                        <div class="rating-stars me-2">
                            <i class="fas fa-star text-warning"></i>
                            <span class="fw-semibold text-dark ms-1">${workerRating.toFixed(1)}</span>
                        </div>
                        <span class="text-muted small">(${reviewCount} reviews)</span>
                    </div>

                    <!-- Price and Contact -->
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="pricing">
                            <span class="text-muted small">Starting from</span>
                            <div class="fw-bold text-black fs-5">Rs. ${ad.startingPrice ? ad.startingPrice.toLocaleString() : 'N/A'}</div>
                        </div>
                        ${contactNumber ?
            `<button class="btn btn-outline-dark btn-sm rounded-pill px-3" onclick="contactWorker('${contactNumber}')">
                                <i class="fas fa-phone me-1"></i>
                            </button>` :
            `<button class="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled>
                                <i class="fas fa-phone me-1"></i>
                            </button>`
        }
                    </div>
                </div>
            </div>
        </div>
    `;

    $('.card-container').append(cardHtml);
}

function filterAndRenderAds(searchTerm) {
    if (!searchTerm) {
        renderAdsWithWorkerDetails(adsData);
        return;
    }

    const filteredAds = adsData.filter(ad =>
        ad.title.toLowerCase().includes(searchTerm) ||
        ad.description.toLowerCase().includes(searchTerm) ||
        (ad.categoryName && ad.categoryName.toLowerCase().includes(searchTerm))
    );

    renderAdsWithWorkerDetails(filteredAds);
}

function filterAdsByCategory(categoryName) {
    if (!categoryName) {
        renderAdsWithWorkerDetails(adsData);
        return;
    }

    const filteredAds = adsData.filter(ad =>
        ad.categoryName && ad.categoryName.toLowerCase() === categoryName.toLowerCase()
    );

    renderAdsWithWorkerDetails(filteredAds);
}

function contactWorker(phoneNumber) {
    Swal.fire({
        title: 'Contact Worker',
        text: `Phone: ${phoneNumber}`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Call Now',
        cancelButtonText: 'Copy Number'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = `tel:${phoneNumber}`;
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigator.clipboard.writeText(phoneNumber).then(() => {
                Swal.fire('Copied!', 'Phone number copied to clipboard', 'success');
            });
        }
    });
}
