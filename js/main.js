$(document).ready(function () {
    console.log("Document is ready!");

    // Load top-rated workers on page load
    loadTopRatedWorkers();

    $('#getStartedBtn').on('click', function () {
        console.log("Get Started button clicked!");
        window.location.href = 'pages/login-page.html';
    });

    $('#searchForm').on('submit', function (e) {
        e.preventDefault();
        const searchQuery = $('#searchQuery').val();
        const location = $('#location').val();
        console.log('Searching for:', searchQuery, 'in', location);
    });

    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });

    $(window).scroll(function () {
        if ($(window).scrollTop() > 50) {
            $('.navbar-custom').addClass('shadow-sm');
        } else {
            $('.navbar-custom').removeClass('shadow-sm');
        }
    });
});

// Function to load top-rated workers
function loadTopRatedWorkers() {
    const API_BASE_URL = 'http://localhost:8080/api/v1';

    $.ajax({
        url: `${API_BASE_URL}/worker/top-rated`,
        method: 'GET',
        success: function(response) {
            console.log('Top workers loaded successfully:', response);
            displayTopWorkers(response.data);
        },
        error: function(xhr, status, error) {
            console.error('Error loading top workers:', error);
            showWorkersError();
        }
    });
}

// Function to display workers in the UI
function displayTopWorkers(workers) {
    $('#workers-loading').hide();

    if (!workers || workers.length === 0) {
        showWorkersError();
        return;
    }

    const workersContainer = $('#top-workers-container');
    workersContainer.empty();

    workers.forEach(worker => {
        const workerCard = createWorkerCard(worker);
        workersContainer.append(workerCard);
    });

    workersContainer.show();
}

// Function to create a worker card HTML
function createWorkerCard(worker) {
    const profilePicture = worker.profilePictureUrl || '/assets/images/workerDefualtPP.png';
    const workerName = `${worker.user?.firstName || 'Unknown'} ${worker.user?.lastName || 'Worker'}`;
    const primaryCategory = worker.categories && worker.categories.length > 0 ? worker.categories[0].name : 'Professional';
    const primaryLocation = worker.locations && worker.locations.length > 0 ? worker.locations[0].name : 'Location not specified';
    const rating = worker.averageRating ? worker.averageRating.toFixed(1) : '0.0';
    const reviewCount = worker.totalReviews || 0;

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 worker-card border-custom">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <img src="${profilePicture}" alt="${workerName}" class="rounded-circle me-3" 
                             style="width: 64px; height: 64px; object-fit: cover;"
                             onerror="this.src='/assets/images/workerDefualtPP.png'">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <h5 class="card-title mb-0">${workerName}</h5>
                                <span class="verified-badge">
                                    <i class="fas fa-shield-alt me-1"></i>Verified
                                </span>
                            </div>
                            <p class="small text-muted-foreground mb-0">${primaryCategory}</p>
                        </div>
                    </div>
                    
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-star star-rating me-1"></i>
                            <span class="fw-medium">${rating}</span>
                            <span class="small text-muted-foreground ms-1">(${reviewCount} reviews)</span>
                        </div>
                    </div>
                    
                    <div class="d-flex align-items-center text-muted-foreground small mb-3">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        ${primaryLocation}
                    </div>
                    
                    <button class="btn bg-primary text-white w-100" onclick="viewWorkerProfile(${worker.workerId})">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to show error message
function showWorkersError() {
    $('#workers-loading').hide();
    $('#workers-error').show();
}

// Function to handle view profile button click
function viewWorkerProfile(workerId) {
    // You can implement navigation to worker profile page here
    console.log('View profile for worker:', workerId);
    // Example: window.location.href = `pages/worker-profile.html?id=${workerId}`;
}
