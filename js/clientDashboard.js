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

  // Sample data
  const categories = [
    { id: "plumbing", name: "Plumbing", count: 1245 },
    { id: "electrical", name: "Electrical Work", count: 1138 },
    { id: "cleaning", name: "House Cleaning", count: 952 },
    { id: "carpentry", name: "Carpentry", count: 829 },
    { id: "painting", name: "Painting", count: 734 },
    { id: "gardening", name: "Gardening", count: 627 },
    { id: "hvac", name: "HVAC", count: 456 },
    { id: "appliance-repair", name: "Appliance Repair", count: 420 },
    { id: "landscaping", name: "Landscaping", count: 234 },
    { id: "roofing", name: "Roofing", count: 234 },
    { id: "pest-control", name: "Pest Control", count: 234 },
    { id: "office-cleaning", name: "Office Cleaning", count: 234 },
    { id: "computer-repair", name: "Computer Repair", count: 234 },
    { id: "flooring", name: "Flooring", count: 345 },
    { id: "car-repair", name: "Car Repair", count: 345 },
    { id: "deep-cleaning", name: "Deep Cleaning", count: 345 },
    { id: "phone-repair", name: "Phone Repair", count: 567 },
    { id: "carpet-cleaning", name: "Carpet Cleaning", count: 156 },
    { id: "tree-service", name: "Tree Service", count: 156 },
    { id: "windows", name: "Windows & Doors", count: 123 },
    { id: "furniture-repair", name: "Furniture Repair", count: 123 },
    { id: "car-wash", name: "Car Wash", count: 123 },
    { id: "window-cleaning", name: "Window Cleaning", count: 89 },
    { id: "pool-service", name: "Pool Service", count: 89 },
    { id: "bike-repair", name: "Bike Repair", count: 89 },
    { id: "tire-service", name: "Tire Service", count: 89 },
    { id: "auto-detailing", name: "Auto Detailing", count: 67 },
  ]

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

  const workerAds = [
    {
      id: 1,
      name: "Kamal Perera",
      title: "Expert Plumber",
      category: "plumbing",
      district: "Colombo",
      rating: 4.9,
      reviews: 127,
      hourlyRate: "LKR 2,500",
      experience: "8 years",
      description: "Professional plumbing services including pipe repairs, installations, and emergency fixes.",
      avatar: "../assets/images/workerDefualtPP.png",
      verified: true,
      responseTime: "Within 2 hours",
      completedJobs: 340,
      skills: ["Pipe Repair", "Installation", "Emergency Service"],
    },
    {
      id: 2,
      name: "Nimal Silva",
      title: "Licensed Electrician",
      category: "electrical",
      district: "Gampaha",
      rating: 4.8,
      reviews: 89,
      hourlyRate: "LKR 3,000",
      experience: "12 years",
      description: "Certified electrician specializing in home wiring, repairs, and electrical installations.",
      avatar: "../assets/images/workerDefualtPP.png",
      verified: true,
      responseTime: "Within 1 hour",
      completedJobs: 280,
      skills: ["Wiring", "Repairs", "Installation"],
    },
    {
      id: 3,
      name: "Saman Fernando",
      title: "Professional Carpenter",
      category: "carpentry",
      district: "Kandy",
      rating: 4.7,
      reviews: 156,
      hourlyRate: "LKR 2,200",
      experience: "15 years",
      description: "Custom furniture making, repairs, and woodwork for residential and commercial projects.",
      avatar: "../assets/images/workerDefualtPP.png",
      verified: true,
      responseTime: "Within 3 hours",
      completedJobs: 420,
      skills: ["Furniture Making", "Repairs", "Custom Work"],
    },
    {
      id: 4,
      name: "Priya Jayawardena",
      title: "House Cleaning Expert",
      category: "cleaning",
      district: "Colombo",
      rating: 4.9,
      reviews: 203,
      hourlyRate: "LKR 1,800",
      experience: "6 years",
      description:
        "Thorough house cleaning services including deep cleaning, regular maintenance, and office cleaning.",
      avatar: "../assets/images/workerDefualtPP.png",
      verified: true,
      responseTime: "Within 4 hours",
      completedJobs: 580,
      skills: ["Deep Cleaning", "Regular Cleaning", "Office Cleaning"],
    },
    {
      id: 5,
      name: "Dilshan Rajapaksa",
      title: "HVAC Specialist",
      category: "hvac",
      district: "Galle",
      rating: 4.6,
      reviews: 98,
      hourlyRate: "LKR 3,200",
      experience: "10 years",
      description: "Air conditioning installation, repair, and maintenance services for homes and offices.",
      avatar: "../assets/images/workerDefualtPP.png",
      verified: true,
      responseTime: "Within 5 hours",
      completedJobs: 245,
      skills: ["AC Installation", "Repair", "Maintenance"],
    },
    {
      id: 6,
      name: "Amara Wickramasinghe",
      title: "Professional Painter",
      category: "painting",
      district: "Matara",
      rating: 4.8,
      reviews: 134,
      hourlyRate: "LKR 2,000",
      experience: "9 years",
      description: "Interior and exterior painting services with attention to detail and quality finishes.",
      avatar: "../assets/images/workerDefualtPP.png",
      verified: true,
      responseTime: "Within 6 hours",
      completedJobs: 367,
      skills: ["Interior Painting", "Exterior Painting", "Wall Preparation"],
    },
  ]

  // Initialize the application
  function init() {
    populateCategories()
    populateDistricts()
    initializeMap()
    bindEvents()
    filterAndDisplayWorkers()
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

  // Initialize interactive map
  function initializeMap() {
    const mapContainer = $("#interactiveMap")
    
    // Check if simplemaps library is available
    if (typeof simplemaps_countrymap !== 'undefined') {
      // Use the proper map library
      simplemaps_countrymap.load()
    } else {
      // Create detailed SVG map of Sri Lanka with all districts
      const svgMap = `
        <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" class="sri-lanka-map">
          <defs>
            <style>
              .district-path {
                fill: var(--accent-color);
                stroke: white;
                stroke-width: 2;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              .district-path:hover {
                fill: var(--accent-hover);
                stroke: var(--primary-color);
                stroke-width: 3;
                filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
              }
              .district-path.selected {
                fill: var(--primary-color);
                stroke: var(--warning-color);
                stroke-width: 3;
              }
              .district-label {
                font-family: Arial, sans-serif;
                font-size: 10px;
                fill: white;
                text-anchor: middle;
                pointer-events: none;
                font-weight: bold;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.7);
              }
              .tooltip {
                position: absolute;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
            </style>
          </defs>
          
          <!-- Sri Lanka Districts -->
          <!-- Western Province -->
          <path class="district-path" data-district="Colombo" data-workers="1245" 
                d="M180,280 L200,275 L205,290 L200,305 L185,300 L175,285 Z" 
                title="Colombo - 1,245 workers available" />
          <text class="district-label" x="190" y="290">COL</text>
          
          <path class="district-path" data-district="Gampaha" data-workers="985" 
                d="M165,260 L195,255 L200,275 L180,280 L170,275 L160,265 Z" 
                title="Gampaha - 985 workers available" />
          <text class="district-label" x="180" y="268">GAM</text>
          
          <path class="district-path" data-district="Kalutara" data-workers="756" 
                d="M175,285 L200,305 L195,325 L175,320 L165,305 L170,290 Z" 
                title="Kalutara - 756 workers available" />
          <text class="district-label" x="183" y="305">KAL</text>
          
          <!-- Central Province -->
          <path class="district-path" data-district="Kandy" data-workers="1138" 
                d="M220,260 L260,255 L265,285 L240,290 L220,275 L215,265 Z" 
                title="Kandy - 1,138 workers available" />
          <text class="district-label" x="240" y="273">KAN</text>
          
          <path class="district-path" data-district="Matale" data-workers="634" 
                d="M220,230 L260,225 L265,255 L220,260 L210,245 Z" 
                title="Matale - 634 workers available" />
          <text class="district-label" x="240" y="243">MAT</text>
          
          <path class="district-path" data-district="Nuwara Eliya" data-workers="523" 
                d="M240,290 L280,285 L285,315 L260,320 L240,305 Z" 
                title="Nuwara Eliya - 523 workers available" />
          <text class="district-label" x="263" y="303">NUW</text>
          
          <!-- Southern Province -->
          <path class="district-path" data-district="Galle" data-workers="892" 
                d="M165,325 L195,325 L200,355 L175,360 L155,345 Z" 
                title="Galle - 892 workers available" />
          <text class="district-label" x="178" y="343">GAL</text>
          
          <path class="district-path" data-district="Matara" data-workers="567" 
                d="M200,355 L235,350 L240,380 L210,385 L195,370 Z" 
                title="Matara - 567 workers available" />
          <text class="district-label" x="218" y="368">MAR</text>
          
          <path class="district-path" data-district="Hambantota" data-workers="423" 
                d="M240,380 L290,375 L300,405 L265,410 L240,395 Z" 
                title="Hambantota - 423 workers available" />
          <text class="district-label" x="270" y="393">HAM</text>
          
          <!-- Northern Province -->
          <path class="district-path" data-district="Jaffna" data-workers="345" 
                d="M200,80 L260,75 L270,105 L230,110 L195,95 Z" 
                title="Jaffna - 345 workers available" />
          <text class="district-label" x="235" y="93">JAF</text>
          
          <path class="district-path" data-district="Kilinochchi" data-workers="198" 
                d="M200,110 L250,105 L255,135 L220,140 L195,125 Z" 
                title="Kilinochchi - 198 workers available" />
          <text class="district-label" x="225" y="123">KIL</text>
          
          <path class="district-path" data-district="Mannar" data-workers="234" 
                d="M160,130 L200,125 L205,155 L175,160 L155,145 Z" 
                title="Mannar - 234 workers available" />
          <text class="district-label" x="180" y="143">MAN</text>
          
          <path class="district-path" data-district="Vavuniya" data-workers="289" 
                d="M205,155 L245,150 L250,180 L220,185 L200,170 Z" 
                title="Vavuniya - 289 workers available" />
          <text class="district-label" x="225" y="168">VAV</text>
          
          <path class="district-path" data-district="Mullaitivu" data-workers="167" 
                d="M250,135 L290,130 L295,160 L270,165 L250,150 Z" 
                title="Mullaitivu - 167 workers available" />
          <text class="district-label" x="273" y="148">MUL</text>
          
          <!-- Eastern Province -->
          <path class="district-path" data-district="Batticaloa" data-workers="678" 
                d="M295,220 L340,215 L345,265 L320,270 L295,255 Z" 
                title="Batticaloa - 678 workers available" />
          <text class="district-label" x="320" y="243">BAT</text>
          
          <path class="district-path" data-district="Ampara" data-workers="512" 
                d="M295,270 L335,265 L340,315 L305,320 L285,295 Z" 
                title="Ampara - 512 workers available" />
          <text class="district-label" x="315" y="293">AMP</text>
          
          <path class="district-path" data-district="Trincomalee" data-workers="445" 
                d="M270,180 L315,175 L320,210 L295,215 L270,195 Z" 
                title="Trincomalee - 445 workers available" />
          <text class="district-label" x="295" y="193">TRI</text>
          
          <!-- North Western Province -->
          <path class="district-path" data-district="Kurunegala" data-workers="834" 
                d="M160,200 L210,195 L215,235 L180,240 L155,220 Z" 
                title="Kurunegala - 834 workers available" />
          <text class="district-label" x="185" y="218">KUR</text>
          
          <path class="district-path" data-district="Puttalam" data-workers="423" 
                d="M130,170 L175,165 L180,200 L155,205 L125,185 Z" 
                title="Puttalam - 423 workers available" />
          <text class="district-label" x="155" y="183">PUT</text>
          
          <!-- North Central Province -->
          <path class="district-path" data-district="Anuradhapura" data-workers="567" 
                d="M180,140 L230,135 L235,175 L200,180 L175,160 Z" 
                title="Anuradhapura - 567 workers available" />
          <text class="district-label" x="208" y="158">ANU</text>
          
          <path class="district-path" data-district="Polonnaruwa" data-workers="389" 
                d="M235,175 L280,170 L285,210 L250,215 L230,195 Z" 
                title="Polonnaruwa - 389 workers available" />
          <text class="district-label" x="258" y="193">POL</text>
          
          <!-- Uva Province -->
          <path class="district-path" data-district="Badulla" data-workers="456" 
                d="M265,285 L305,280 L310,320 L285,325 L265,305 Z" 
                title="Badulla - 456 workers available" />
          <text class="district-label" x="285" y="303">BAD</text>
          
          <path class="district-path" data-district="Moneragala" data-workers="334" 
                d="M285,325 L325,320 L330,360 L300,365 L280,345 Z" 
                title="Moneragala - 334 workers available" />
          <text class="district-label" x="308" y="343">MON</text>
          
          <!-- Sabaragamuwa Province -->
          <path class="district-path" data-district="Ratnapura" data-workers="623" 
                d="M200,305 L240,300 L245,340 L210,345 L190,325 Z" 
                title="Ratnapura - 623 workers available" />
          <text class="district-label" x="220" y="323">RAT</text>
          
          <path class="district-path" data-district="Kegalle" data-workers="467" 
                d="M200,275 L240,270 L245,300 L215,305 L195,285 Z" 
                title="Kegalle - 467 workers available" />
          <text class="district-label" x="220" y="288">KEG</text>
        </svg>
      `

      mapContainer.html(svgMap)
      
      // Add map legend
      addMapLegend()
      
      // Add tooltip functionality
      addMapTooltips()
      
      // Add map interactions
      addMapInteractions()
    }
  }

  // Add map legend
  function addMapLegend() {
    const legend = `
      <div class="map-legend">
        <div class="map-legend-item">
          <div class="map-legend-color" style="background-color: var(--accent-color);"></div>
          <span>Available Districts</span>
        </div>
        <div class="map-legend-item">
          <div class="map-legend-color" style="background-color: var(--primary-color);"></div>
          <span>Selected District</span>
        </div>
        <div class="map-legend-item">
          <div class="map-legend-color" style="background-color: var(--accent-hover);"></div>
          <span>Hover State</span>
        </div>
      </div>
    `
    $('.map-container').append(legend)
  }

  // Add map interactions
  function addMapInteractions() {
    $('.district-path').on('click', function() {
      const district = $(this).data('district')
      const workers = $(this).data('workers')
      
      // Update selected district
      selectedDistrict = district
      $("#districtSelect").val(district)
      
      // Update map visual state
      $('.district-path').removeClass('selected')
      $(this).addClass('selected')
      
      // Reset page and filter
      currentPage = 1
      filterAndDisplayWorkers()
      
      // Show notification
      showMapNotification(district, workers)
    })
  }

  // Show map notification
  function showMapNotification(district, workers) {
    const notification = $(`
      <div class="map-notification">
        <i class="fas fa-map-marker-alt me-2"></i>
        <strong>${district}</strong> selected - ${workers} workers available
      </div>
    `)
    
    $('body').append(notification)
    
    setTimeout(() => {
      notification.addClass('show')
    }, 100)
    
    setTimeout(() => {
      notification.removeClass('show')
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  // Add tooltip functionality for map
  function addMapTooltips() {
    const tooltip = $('<div class="tooltip" style="display: none;"></div>')
    $('body').append(tooltip)
    
    $('.district-path').on('mouseenter', function(e) {
      const district = $(this).data('district')
      const workers = $(this).data('workers')
      const title = $(this).attr('title')
      
      tooltip.html(`
        <strong>${district}</strong><br>
        ${workers} workers available<br>
        <small>Click to filter by this district</small>
      `).show()
    }).on('mousemove', function(e) {
      tooltip.css({
        left: e.pageX + 10,
        top: e.pageY - 10
      })
    }).on('mouseleave', function() {
      tooltip.hide()
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
      filterAndDisplayWorkers()

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
        filterAndDisplayWorkers()
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
  }

  // Filter and display workers
  function filterAndDisplayWorkers() {
    const filteredWorkers = workerAds.filter((worker) => {
      const matchesSearch =
        searchQuery === "" ||
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "all" || worker.category === selectedCategory
      const matchesDistrict = selectedDistrict === "all" || worker.district === selectedDistrict

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
      const workerCard = $(`
                <div class="${gridClass} mb-4">
                    <div class="worker-card">
                        <div class="d-flex align-items-start mb-3">
                            <img src="${worker.avatar}" alt="${worker.name}" class="worker-avatar me-3">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-1">
                                    <h5 class="mb-0 me-2">${worker.name}</h5>
                                    ${worker.verified ? '<i class="fas fa-award text-success"></i>' : ""}
                                </div>
                                <p class="text-primary mb-1">${worker.title}</p>
                                <div class="d-flex align-items-center mb-2">
                                    <i class="fas fa-star rating-stars me-1"></i>
                                    <span class="fw-medium me-1">${worker.rating}</span>
                                    <span class="text-muted small">(${worker.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>
                        
                        <p class="text-muted mb-3">${worker.description}</p>
                        
                        <div class="row g-2 mb-3 small">
                            <div class="col-6">
                                <span class="text-muted">Location:</span>
                                <div class="fw-medium">${worker.district}</div>
                            </div>
                            <div class="col-6">
                                <span class="text-muted">Rate:</span>
                                <div class="fw-medium text-success">${worker.hourlyRate}/hour</div>
                            </div>
                            <div class="col-6">
                                <span class="text-muted">Experience:</span>
                                <div class="fw-medium">${worker.experience}</div>
                            </div>
                            <div class="col-6">
                                <span class="text-muted">Response:</span>
                                <div class="fw-medium small">${worker.responseTime}</div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            ${worker.skills.map((skill) => `<span class="skill-badge">${skill}</span>`).join("")}
                        </div>
                        
                        <div class="d-flex gap-2">
                            <button class="btn skillworker-btn-primary flex-grow-1 btn-sm">
                                <i class="fas fa-comment me-1"></i>Contact
                            </button>
                            <button class="btn btn-outline-secondary btn-sm">
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
  window.district_click = function(districtCode, districtName) {
    selectedDistrict = districtName
    $("#districtSelect").val(districtName)
    currentPage = 1
    filterAndDisplayWorkers()
  }
})
