/* global $, bootstrap */

// Declare the $ variable to fix lint/correctness/noUndeclaredVariables error
const $ = window.$


$(document).ready(() => {
  // Application state
  let currentPage = 1
  const itemsPerPage = 8
  let viewMode = "grid"
  let selectedCategory = "all"
  let selectedDistrict = "all"
  let searchQuery = ""

  const token = $.cookie("token");

  // Data storage
  let categories = []
  let workerAds = []

  const districts = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Moneragala",
    "Ratnapura",
    "Kegalle",
  ]

  // Initialize the application
  function init() {
    populateDistricts()
    bindEvents()
    fetchCategories()
    fetchAds()
  }

  // Fetch categories from API
  function fetchCategories() {
    $.ajax({
      url: 'http://localhost:8080/api/v1/category/getactive',
      type: 'GET',
      dataType: 'json',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      success: function (result) {
        console.log('Categories fetched successfully:', result)

        if (result.status === 200) {
          // Transform API data to match our component structure
          categories = result.data.map(category => ({
            id: category.name.toLowerCase(),
            name: category.name,
            count: 0 // Will be updated after fetching ads
          }))

          populateCategories()
        } else {
          console.error('Failed to fetch categories:', result.message)
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching categories:', error)
        console.error('Status:', status)
        console.error('Response:', xhr.responseText)
      }
    })
  }

  // Fetch ads from API
  function fetchAds(district = null) {
    // Show loading state
    $('#workersContainer').html(`
      <div class="col-12">
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading services...</p>
        </div>
      </div>
    `)

    // Determine the API URL based on whether a district is specified
    let apiUrl = 'http://localhost:8080/api/v1/ad/getall/active'
    if (district && district !== 'all') {
      apiUrl = `http://localhost:8080/api/v1/ad/getall/active/${district.toUpperCase()}`
    }

    $.ajax({
      url: apiUrl,
      type: 'GET',
      dataType: 'json',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      success: function (result) {
        console.log('Ads fetched successfully:', result)

        if (result.status === 200) {
          // Transform API data to match our component structure
          workerAds = result.data.map(ad => ({
            id: ad.adId,
            name: `${ad.categoryName} Service Provider`, // Better default name
            category: ad.categoryName.toLowerCase(),
            district: ad.location,
            rating: 4.5, // Default rating since API doesn't provide this
            reviews: Math.floor(Math.random() * 200) + 50, // Random reviews
            hourlyRate: `LKR ${ad.startingPrice.toLocaleString()}`,
            experience: `${Math.floor(Math.random() * 10) + 1} years`, // Random experience
            title: ad.title,
            description: ad.description,
            avatar: ad.profilePictureUrl,
            verified: true,
            responseTime: "Within 2 hours", // Default response time
            completedJobs: Math.floor(Math.random() * 500) + 100, // Random completed jobs
            skills: ad.skills,
            phoneNumbers: ad.phoneNumbers,
            createdDate: ad.createdDate,
            status: ad.status
          }))

          // Update category counts
          updateCategoryCounts()
          populateCategories()
          filterAndDisplayWorkers()
        } else {
          console.error('Failed to fetch ads:', result.message)
          // Show error message to user
          $('#workersContainer').html(`
            <div class="col-12">
              <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Failed to load services. Please try again later.
              </div>
            </div>
          `)
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching ads:', error)
        console.error('Status:', status)
        console.error('Response:', xhr.responseText)

        const errorResponse = xhr.responseJSON.message;

        // Show error message to user
        
        $('#workersContainer').html(`
          <div class="col-12">
            <div class="alert alert-danger text-center">
              <i class="fas fa-times-circle me-2"></i>
              ${errorResponse}
            </div>
          </div>
        `)
      }
    })
  }

  // Update category counts based on fetched ads
  function updateCategoryCounts() {
    const categoryCount = {}

    workerAds.forEach(ad => {
      const category = ad.category
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    // Update existing categories with counts
    categories.forEach(category => {
      category.count = categoryCount[category.id] || 0
    })

    // Sort categories by count (descending)
    categories.sort((a, b) => b.count - a.count)
  }

  // Populate categories
  function populateCategories() {
    const container = $("#categoriesContainer")
    container.empty()

    categories.forEach((category) => {
      const categoryElement = $(`
                <button class="category-item" data-category="${category.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-medium">${category.name}</span>
                        <span class="badge bg-light text-dark">${category.count}</span>
                    </div>
                </button>
            `)
      container.append(categoryElement)
    })
  }

  // Populate districts dropdown
  function populateDistricts() {
    const select = $("#districtSelect")
    districts.forEach((district) => {
      select.append(`<option value="${district}">${district}</option>`)
    })
  }


  // Bind event handlers
  function bindEvents() {
    // Mobile menu toggle
    $("#mobileMenuToggle").on("click", () => {
      $("#mobileMenuOverlay").toggleClass("show")
    })

    $("#mobileMenuOverlay").on("click", function (e) {
      if (e.target === this) {
        $(this).removeClass("show")
      }
    })

    // Search functionality
    $("#searchBtn").on("click", () => {
      searchQuery = $("#searchInput").val()
      currentPage = 1
      filterAndDisplayWorkers()
    })

    $("#searchInput").on("keypress", (e) => {
      if (e.which === 13) {
        $("#searchBtn").click()
      }
    })

    // Category search
    $("#categorySearch").on("input", function () {
      const searchTerm = $(this).val().toLowerCase()
      $(".category-item").each(function () {
        const categoryName = $(this).find("span").first().text().toLowerCase()
        $(this).toggle(categoryName.includes(searchTerm))
      })
    })

    // Category selection
    $(document).on("click", ".category-item", function () {
      $(".category-item").removeClass("active")
      $(this).addClass("active")
      selectedCategory = $(this).data("category")
      currentPage = 1
      filterAndDisplayWorkers()
    })

    // District selection
    $("#districtSelect").on("change", function () {
      selectedDistrict = $(this).val() === "All Districts" ? "all" : $(this).val()
      currentPage = 1
      
      // Fetch ads for the selected district
      fetchAds(selectedDistrict)

      // Update map selection
      $(".district-path").removeClass("selected")
      if (selectedDistrict !== "all") {
        $(`.district-path[data-district="${selectedDistrict}"]`).addClass("selected")
      }
    })

    // Map district selection (fallback for simple map)
    $(document).on("click", ".district-path", function () {
      if (!$(this).hasClass('enhanced-map-district')) {
        const district = $(this).data("district")
        selectedDistrict = district
        $("#districtSelect").val(district)
        $(".district-path").removeClass("selected")
        $(this).addClass("selected")
        currentPage = 1
        
        // Fetch ads for the selected district
        fetchAds(district)
      }
    })

    // View mode toggle
    $("#gridViewBtn").on("click", () => {
      viewMode = "grid"
      $("#gridViewBtn").addClass("active")
      $("#listViewBtn").removeClass("active")
      filterAndDisplayWorkers()
    })

    $("#listViewBtn").on("click", () => {
      viewMode = "list"
      $("#listViewBtn").addClass("active")
      $("#gridViewBtn").removeClass("active")
      filterAndDisplayWorkers()
    })

    // Contact button click
    $(document).on("click", ".contact-btn", function () {
      const workerId = $(this).data("worker-id")
      const phoneNumbers = $(this).data("phone")

      // Show contact modal or alert
      if (phoneNumbers && phoneNumbers !== 'No phone available') {
        const modal = $(`
          <div class="modal fade" id="contactModal" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Contact Information</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  <p><strong>Phone Numbers:</strong></p>
                  <p>${phoneNumbers}</p>
                  <p class="text-muted">Click on a number to call directly.</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        `)

        $('body').append(modal)
        $('#contactModal').modal('show')

        $('#contactModal').on('hidden.bs.modal', function () {
          $(this).remove()
        })
      } else {
        alert('Contact information not available for this service provider.')
      }
    })

    // Favorite button click
    $(document).on("click", ".favorite-btn", function () {
      $(this).toggleClass("text-danger")
      const icon = $(this).find("i")
      icon.toggleClass("fas far")
    })

    // Worker card click - navigate to ad preview
    $(document).on("click", ".clickable-card", function () {
      const workerId = $(this).data("worker-id")
      if (workerId) {
        // Navigate to ad-preview page with the worker/ad ID
        window.location.href = `../pages/ad-preview.html?adId=${workerId}`
      }
    })
  }

  // Filter and display workers
  function filterAndDisplayWorkers() {
    const filteredWorkers = workerAds.filter((worker) => {
      const matchesSearch =
        searchQuery === "" ||
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (worker.description && worker.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (worker.skills && worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesCategory = selectedCategory === "all" || worker.category === selectedCategory
      const matchesDistrict = selectedDistrict === "all" || worker.district.toLowerCase() === selectedDistrict.toLowerCase()

      return matchesSearch && matchesCategory && matchesDistrict
    })

    displayWorkers(filteredWorkers)
    updateResultsCount(filteredWorkers.length)
    updatePagination(filteredWorkers.length)
  }

  // Display workers
  function displayWorkers(workers) {
    const container = $("#workersContainer")
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedWorkers = workers.slice(startIndex, endIndex)

    container.empty()

    const gridClass = viewMode === "grid" ? "col-md-6 col-lg-4 col-xl-3" : "col-12"

    paginatedWorkers.forEach((worker) => {
      const skillsDisplay = worker.skills && worker.skills.length > 0
        ? worker.skills.slice(0, 3).join(', ') + (worker.skills.length > 3 ? '...' : '')
        : 'Various skills'

      // Handle avatar URL - use default if starts with /assets or is invalid
      let avatarUrl = worker.avatar
      if (avatarUrl && avatarUrl.startsWith('/assets')) {
        avatarUrl = '../assets/images/workerDefualtPP.png'
      } else if (!avatarUrl || avatarUrl.trim() === '') {
        avatarUrl = '../assets/images/workerDefualtPP.png'
      }

      const workerCard = $(`
                <div class="${gridClass} mb-4">
                    <div class="worker-card clickable-card" data-worker-id="${worker.id}" style="cursor: pointer;">
                        <div class="d-flex align-items-start mb-3">
                            <img src="${avatarUrl}" alt="Worker Profile" class="worker-avatar me-3" 
                                 onerror="this.src='../assets/images/workerDefualtPP.png'">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-1">
                                    <h5 class="mb-0 me-2">${worker.category.charAt(0).toUpperCase() + worker.category.slice(1)} Service</h5>
                                    ${worker.verified ? '<i class="fas fa-award text-success" title="Verified"></i>' : ""}
                                </div>
                                <p class="text-primary mb-1">${worker.category.charAt(0).toUpperCase() + worker.category.slice(1)}</p>
                                <div class="d-flex align-items-center mb-2">
                                    <i class="fas fa-star rating-stars me-1"></i>
                                    <span class="fw-medium me-1">${worker.rating}</span>
                                    <span class="text-muted small">(${worker.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>
                        
                        <p class="h6 text-dark mb-2" title="${worker.title}">${worker.title.length > 50 ? worker.title.substring(0, 50) + '...' : worker.title}</p>
                        
                        
                        <div class="row g-2 mb-3 small">
                            <div class="col-6">
                                <span class="text-muted">Location:</span>
                                <div class="fw-medium">${worker.district}</div>
                            </div>
                            <div class="col-6">
                                <span class="text-muted">Rate:</span>
                                <div class="fw-medium text-success">${worker.hourlyRate}/Day</div>
                            </div>
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn skillworker-btn-primary flex-grow-1 btn-sm contact-btn" 
                                    data-worker-id="${worker.id}" 
                                    data-phone="${worker.phoneNumbers ? worker.phoneNumbers.join(', ') : 'No phone available'}"
                                    onclick="event.stopPropagation()">
                                <i class="fas fa-comment me-1"></i>Contact
                            </button>
                            <button class="btn btn-outline-secondary btn-sm favorite-btn" 
                                    data-worker-id="${worker.id}"
                                    onclick="event.stopPropagation()">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `)
      container.append(workerCard)
    })
  }

  // Update results count
  function updateResultsCount(count) {
    $("#resultsCount").text(`${count} services found`)
  }

  // Update pagination
  function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const pagination = $("#pagination")

    pagination.empty()

    if (totalPages <= 1) return

    // Previous button
    const prevDisabled = currentPage === 1 ? "disabled" : ""
    pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `)

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const active = i === currentPage ? "active" : ""
      pagination.append(`
                <li class="page-item ${active}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `)
    }

    // Next button
    const nextDisabled = currentPage === totalPages ? "disabled" : ""
    pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `)

    // Bind pagination events
    $(".page-link").on("click", function (e) {
      e.preventDefault()
      const page = Number.parseInt($(this).data("page"))
      if (page && page !== currentPage && page >= 1 && page <= totalPages) {
        currentPage = page
        filterAndDisplayWorkers()
      }
    })
  }

  // Initialize the application
  init()

  // Global function for map district clicks (referenced in mapdata.js)
  window.district_click = function (districtCode, districtName) {
    selectedDistrict = districtName
    $("#districtSelect").val(districtName)
    currentPage = 1
    
    // Fetch ads for the selected district
    fetchAds(districtName)
    
    // Update map selection visually
    $(".district-path").removeClass("selected")
    $(`.district-path[data-district="${districtName}"]`).addClass("selected")
  }
})
