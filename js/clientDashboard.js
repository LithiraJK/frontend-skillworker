const $ = window.$

$(document).ready(() => {
  let currentPage = 0
  const itemsPerPage = 6
  let viewMode = "grid"
  let selectedCategory = "all"
  let selectedDistrict = "all"
  let searchQuery = ""

  const token = $.cookie("token");

  let categories = []
  let workerAds = []
  let totalPages = 0
  let totalElements = 0

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

  
  function init() {
    populateDistricts()
    bindEvents()
    fetchCategories()
    fetchAds()
  }

 
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
         
          categories = result.data.map(category => ({
            id: category.name.toLowerCase(),
            name: category.name,
            count: 0 
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

 
  function fetchAds(district = null, page = 0) {
  
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

   
    let apiUrl = `http://localhost:8080/api/v1/ad/getall/active?page=${page}&size=${itemsPerPage}`
    if (district && district !== 'all') {
      apiUrl = `http://localhost:8080/api/v1/ad/getall/active/${district.toUpperCase()}?page=${page}&size=${itemsPerPage}`
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
          // Update pagination info from server response
          totalPages = result.data.totalPages
          totalElements = result.data.totalElements
          currentPage = result.data.currentPage
         
          workerAds = result.data.content.map(ad => ({
            id: ad.adId,
            name: `${ad.categoryName} Service Provider`,
            category: ad.categoryName.toLowerCase(),
            district: ad.location,
            rating: 4.5, 
            reviews: Math.floor(Math.random() * 200) + 50, 
            hourlyRate: `LKR ${ad.startingPrice.toLocaleString()}`,
            experience: `${Math.floor(Math.random() * 10) + 1} years`, 
            title: ad.title,
            description: ad.description,
            avatar: ad.profilePictureUrl,
            verified: true,
            responseTime: "Within 2 hours", 
            completedJobs: Math.floor(Math.random() * 500) + 100, 
            skills: ad.skills,
            phoneNumbers: ad.phoneNumbers,
            createdDate: ad.createdDate,
            status: ad.status
          }))

          updateCategoryCounts()
          populateCategories()
          displayWorkers(workerAds)
          updateResultsCount(totalElements)
          updatePagination()
        } else {
          console.error('Failed to fetch ads:', result.message)
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

        const errorResponse = xhr.responseJSON ? xhr.responseJSON.message : 'Error loading services';
        
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

  function updateCategoryCounts() {
    const categoryCount = {}

    workerAds.forEach(ad => {
      const category = ad.category
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    categories.forEach(category => {
      category.count = categoryCount[category.id] || 0
    })

    categories.sort((a, b) => b.count - a.count)
  }

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

  function populateDistricts() {
    const select = $("#districtSelect")
    districts.forEach((district) => {
      select.append(`<option value="${district}">${district}</option>`)
    })
  }

  function bindEvents() {
    $("#mobileMenuToggle").on("click", () => {
      $("#mobileMenuOverlay").toggleClass("show")
    })

    $("#mobileMenuOverlay").on("click", function (e) {
      if (e.target === this) {
        $(this).removeClass("show")
      }
    })

    $("#searchBtn").on("click", () => {
      searchQuery = $("#searchInput").val()
      currentPage = 0
      fetchAds(selectedDistrict, 0)
    })

    $("#searchInput").on("keypress", (e) => {
      if (e.which === 13) {
        $("#searchBtn").click()
      }
    })

    $("#categorySearch").on("input", function () {
      const searchTerm = $(this).val().toLowerCase()
      $(".category-item").each(function () {
        const categoryName = $(this).find("span").first().text().toLowerCase()
        $(this).toggle(categoryName.includes(searchTerm))
      })
    })

    $(document).on("click", ".category-item", function () {
      $(".category-item").removeClass("active")
      $(this).addClass("active")
      selectedCategory = $(this).data("category")
      currentPage = 0
      fetchAds(selectedDistrict, 0)
    })

    $("#districtSelect").on("change", function () {
      selectedDistrict = $(this).val() === "All Districts" ? "all" : $(this).val()
      currentPage = 0
      
      fetchAds(selectedDistrict, 0)

      $(".district-path").removeClass("selected")
      if (selectedDistrict !== "all") {
        $(`.district-path[data-district="${selectedDistrict}"]`).addClass("selected")
      }
    })

    $(document).on("click", ".district-path", function () {
      if (!$(this).hasClass('enhanced-map-district')) {
        const district = $(this).data("district")
        selectedDistrict = district
        $("#districtSelect").val(district)
        $(".district-path").removeClass("selected")
        $(this).addClass("selected")
        currentPage = 0
        
        fetchAds(district, 0)
      }
    })

    $("#gridViewBtn").on("click", () => {
      viewMode = "grid"
      $("#gridViewBtn").addClass("active")
      $("#listViewBtn").removeClass("active")
      displayWorkers(workerAds)
    })

    $("#listViewBtn").on("click", () => {
      viewMode = "list"
      $("#listViewBtn").addClass("active")
      $("#gridViewBtn").removeClass("active")
      displayWorkers(workerAds)
    })

    $(document).on("click", ".contact-btn", function () {
      const workerId = $(this).data("worker-id")
      const phoneNumbers = $(this).data("phone")

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
        window.location.href = `ad-preview.html?adId=${workerId}`
      }
    })
  }

  function displayWorkers(workers) {
    const container = $("#workersContainer")
    container.empty()

    const gridClass = viewMode === "grid" ? "col-md-6 col-lg-4 col-xl-4" : "col-12"

    workers.forEach((worker) => {
      const skillsDisplay = worker.skills && worker.skills.length > 0
        ? worker.skills.slice(0, 3).join(', ') + (worker.skills.length > 3 ? '...' : '')
        : 'Various skills'

      let avatarUrl = worker.avatar
      if (avatarUrl && avatarUrl.startsWith('/assets')) {
        avatarUrl = '../assets/images/workerDefualtPP.png'
      } else if (!avatarUrl || avatarUrl.trim() === '') {
        avatarUrl = '../assets/images/workerDefualtPP.png'
      }

      const workerCard = $(`
                <div class="${gridClass} mb-4">
                    <div class="worker-card clickable-card" data-worker-id="${worker.id}"  style="cursor: pointer;">
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

  function updateResultsCount(count) {
    $("#resultsCount").text(`${count} services found`)
  }

  function updatePagination() {
    const pagination = $("#pagination")
    pagination.empty()

    if (totalPages <= 1) return

    // Display current page as 1-based for UI (server uses 0-based)
    const displayCurrentPage = currentPage + 1
    
    const prevDisabled = currentPage === 0 ? "disabled" : ""
    pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `)

    // Show page numbers (convert to 1-based for display)
    for (let i = 0; i < totalPages; i++) {
      const active = i === currentPage ? "active" : ""
      pagination.append(`
                <li class="page-item ${active}">
                    <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
                </li>
            `)
    }

    const nextDisabled = currentPage === (totalPages - 1) ? "disabled" : ""
    pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `)

    $(".page-link").on("click", function (e) {
      e.preventDefault()
      const page = Number.parseInt($(this).data("page"))
      if (page !== undefined && page !== currentPage && page >= 0 && page < totalPages) {
        fetchAds(selectedDistrict, page)
      }
    })
  }

  init()

  window.district_click = function (districtCode, districtName) {
    selectedDistrict = districtName
    $("#districtSelect").val(districtName)
    currentPage = 0
    
    fetchAds(districtName, 0)
    
    $(".district-path").removeClass("selected")
    $(`.district-path[data-district="${districtName}"]`).addClass("selected")
  }
})
