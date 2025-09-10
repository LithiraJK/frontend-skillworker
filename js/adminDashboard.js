// $(document).ready(function() {
//     // Check if required libraries are loaded
//     if (typeof $ === 'undefined') {
//         console.error('jQuery is not loaded!')
//         return
//     }

//     console.log('Admin dashboard initialized successfully')

//     $('#changeTextBtn').click(async function() {
//         const token = await $.cookie('token');

//         // Check if tokenHandler is available (loaded via script tag)
//         if (typeof window.tokenHandler !== 'undefined' && token) {
//             try {
//                 window.tokenHandler.scheduleSilentRefresh(token)
//             } catch (error) {
//                 console.warn('Token refresh handler not available:', error)
//             }
//         }
//         $.ajax({
//             url: 'http://localhost:8080/api/hello',
//             type: 'GET',
//             headers: {
//                 'Authorization': 'Bearer ' + token
//             },

//             success: function(response) {
//                 console.log("Data fetched successfully:", response);
//                 $('#text').text(response);
//             },
//             error: function(error) {
//                 console.error("Error fetching data:", error);
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Error',
//                     text: 'Failed to fetch data.'
//                 });
//             }
//         });

//         if (!token) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Authentication Required',
//                 text: 'Please login to access this feature.',
//             }).then(() => {
//                 window.location.href = '../pages/login-page.html';
//             });
//         }
//     });


//     $('#logoutBtn').click(function() {
//         $.removeCookie('token', { path: '/' });
//         $.removeCookie('refresh_token', { path: '/' });
//         $.removeCookie('user_role', { path: '/' });
//         $.removeCookie('first_name', { path: '/' });
//         $.removeCookie('last_name', { path: '/' });
//         $.removeCookie('email', { path: '/' });

//         window.location.href = '../pages/login-page.html';
//     });
// });


/* global $, Swal */
const $ = window.$
const Swal = window.Swal

// Utility function to get token from cookies
function getAuthToken() {
  return $.cookie('token')
}

// Function to create headers with authorization
function createAuthHeaders() {
  const token = getAuthToken()
  return {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
}

$(document).ready(() => {
  // Initialize dashboard
  initializeDashboard()

  // Sidebar navigation
  $(".sidebar-item").click(function (e) {
    e.preventDefault()

    // Remove active class from all items
    $(".sidebar-item").removeClass("active")

    // Add active class to clicked item
    $(this).addClass("active")

    // Hide all content sections
    $(".content-section").hide()

    // Show selected section
    const section = $(this).data("section")
    $(`#${section}-section`).show()

    // Load section data
    loadSectionData(section)
  })

  // Toggle sidebar
  $("#menu-toggle").click(() => {
    $("#sidebar-wrapper").toggleClass("active")
  })

  // Search functionality
  $("#userSearch").on("keyup", function () {
    filterTable("usersTable", $(this).val())
  })

  $("#workerSearch").on("keyup", function () {
    filterTable("workersTable", $(this).val())
  })

  // Booking status filter
  $("#bookingStatusFilter").change(function () {
    filterBookingsByStatus($(this).val())
  })

  // Form submissions
  $("#generalSettingsForm").submit((e) => {
    e.preventDefault()
    saveGeneralSettings()
  })

    $("#logoutBtn").click(() => {
    $.removeCookie("token", { path: "/" })
    $.removeCookie("refresh_token", { path: "/" })
    $.removeCookie("user_role", { path: "/" })
    $.removeCookie("userId", { path: "/" })
    window.location.href = "../pages/login-page.html"
  })
})

function initializeDashboard() {
  // Load initial dashboard data
  loadDashboardStats();
}

function loadDashboardStats() {
  const token = getAuthToken()
  
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'Please login to access this feature.',
    }).then(() => {
      window.location.href = '../pages/login-page.html'
    })
    return
  }

  // Fetch dashboard statistics from API
  $.ajax({
    url: 'http://localhost:8080/api/v1/admin/dashboard/stats',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Dashboard stats loaded successfully:", response)
      
      // Update dashboard stats (adjust based on your API response structure)
      if (response.data) {
        $("#totalUsers").text((response.data.totalUsers || 0).toLocaleString())
        $("#activeWorkers").text((response.data.activeWorkers || 0).toLocaleString())
        $("#totalBookings").text((response.data.totalBookings || 0).toLocaleString())
        $("#totalRevenue").text((response.data.totalRevenue || 0).toLocaleString())
      }
    },
    error: function(error) {
      console.error("Error loading dashboard stats:", error)
      
      // Show default stats if API fails
      const defaultStats = {
        totalUsers: 0,
        activeWorkers: 0,
        totalBookings: 0,
        totalRevenue: 0,
      }

      $("#totalUsers").text(defaultStats.totalUsers.toLocaleString())
      $("#activeWorkers").text(defaultStats.activeWorkers.toLocaleString())
      $("#totalBookings").text(defaultStats.totalBookings.toLocaleString())
      $("#totalRevenue").text(defaultStats.totalRevenue.toLocaleString())

      if (error.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please login again.',
        }).then(() => {
          window.location.href = '../pages/login-page.html'
        })
      }
    }
  })
}



function loadSectionData(section) {
  switch (section) {
    case "users":
      loadUsers()
      break
    case "workers":
      loadWorkers()
      break
    case "categories":
      loadCategories()
      break
    case "reports":
      loadReports()
      break
  }
}

function loadUsers() {
  const token = getAuthToken()
  
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'Please login to access this feature.',
    }).then(() => {
      window.location.href = '../pages/login-page.html'
    })
    return
  }

  // Show loading state
  const tbody = $("#usersTable tbody")
  tbody.html('<tr><td colspan="6" class="text-center">Loading users...</td></tr>')

  $.ajax({
    url: 'http://localhost:8080/api/v1/admin/users',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Users loaded successfully:", response)
      
      tbody.empty()
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((user) => {
          const statusClass = user.status === "ACTIVE" ? "bg-success" : "bg-danger"
          const row = `
            <tr>
                <td>${user.userId || user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.role || 'Client'}</td>
                <td><span class="badge ${statusClass}">${user.status || 'Active'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editUser(${user.userId || user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.userId || user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
          `
          tbody.append(row)
        })
      } else {
        tbody.html('<tr><td colspan="6" class="text-center">No users found</td></tr>')
      }
    },
    error: function(error) {
      console.error("Error loading users:", error)
      tbody.html('<tr><td colspan="6" class="text-center text-danger">Error loading users</td></tr>')
      
      if (error.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please login again.',
        }).then(() => {
          window.location.href = '../pages/login-page.html'
        })
      }
    }
  })
}

function loadWorkers() {
  const token = getAuthToken()
  
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Required',
      text: 'Please login to access this feature.',
    }).then(() => {
      window.location.href = '../pages/login-page.html'
    })
    return
  }

  // Show loading state
  const tbody = $("#workersTable tbody")
  tbody.html('<tr><td colspan="9" class="text-center">Loading workers...</td></tr>')

  $.ajax({
    url: 'http://localhost:8080/api/v1/admin/workers',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Workers loaded successfully:", response)
      
      tbody.empty()
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((worker) => {
          const statusClass = worker.status === "ACTIVE" ? "bg-success" : "bg-danger"
          const rating = worker.rating || 'N/A'
          const row = `
            <tr>
                <td>${worker.workerId || worker.id}</td>
                <td>${worker.firstName} ${worker.lastName}</td>
                <td>${worker.email}</td>
                <td>${worker.phoneNumber || worker.phone || 'N/A'}</td>
                <td>${worker.category || 'N/A'}</td>
                <td>${worker.location || worker.district || 'N/A'}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="me-1">${rating}</span>
                        ${rating !== 'N/A' ? '<i class="fas fa-star text-warning"></i>' : ''}
                    </div>
                </td>
                <td><span class="badge ${statusClass}">${worker.status || 'Active'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editWorker(${worker.workerId || worker.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteWorker(${worker.workerId || worker.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
          `
          tbody.append(row)
        })
      } else {
        tbody.html('<tr><td colspan="9" class="text-center">No workers found</td></tr>')
      }
    },
    error: function(error) {
      console.error("Error loading workers:", error)
      tbody.html('<tr><td colspan="9" class="text-center text-danger">Error loading workers</td></tr>')
      
      if (error.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please login again.',
        }).then(() => {
          window.location.href = '../pages/login-page.html'
        })
      }
    }
  })
}

function loadCategories() {
  // Simulate loading categories data
  const categories = [
    {
      id: 1,
      name: "Plumbing",
      description: "Water pipe repairs and installations",
      workersCount: 45,
      status: "Active",
    },
    {
      id: 2,
      name: "Electrical",
      description: "Electrical repairs and installations",
      workersCount: 38,
      status: "Active",
    },
  ]

  const tbody = $("#categoriesTable tbody")
  tbody.empty()

  categories.forEach((category) => {
    const statusClass = category.status === "Active" ? "bg-success" : "bg-danger"
    const row = `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>${category.workersCount}</td>
                <td><span class="badge ${statusClass}">${category.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
    tbody.append(row)
  })
}


function loadReports() {
  // Load reports data - this would typically fetch from API
  console.log("Loading reports data...")
}

// Utility functions
function filterTable(tableId, searchTerm) {
  const table = $(`#${tableId}`)
  const rows = table.find("tbody tr")

  rows.each(function () {
    const row = $(this)
    const text = row.text().toLowerCase()

    if (text.includes(searchTerm.toLowerCase())) {
      row.show()
    } else {
      row.hide()
    }
  })
}

function filterBookingsByStatus(status) {
  const rows = $("#bookingsTable tbody tr")

  if (!status) {
    rows.show()
    return
  }

  rows.each(function () {
    const row = $(this)
    const statusText = row.find(".badge").text().toLowerCase()

    if (statusText.includes(status.toLowerCase())) {
      row.show()
    } else {
      row.hide()
    }
  })
}

// Action functions
function refreshDashboard() {
  Swal.fire({
    title: "Refreshing Dashboard",
    text: "Loading latest data...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  setTimeout(() => {
    loadDashboardStats()
    loadRecentBookings()
    Swal.fire("Success!", "Dashboard refreshed successfully", "success")
  }, 2000)
}







function addNewUser() {
  Swal.fire({
    title: "Add New User",
    html: `
            <input id="userName" class="swal2-input" placeholder="Full Name">
            <input id="userEmail" class="swal2-input" placeholder="Email">
            <input id="userPhone" class="swal2-input" placeholder="Phone">
            <select id="userDistrict" class="swal2-input">
                <option value="">Select District</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Gampaha">Gampaha</option>
            </select>
        `,
    confirmButtonText: "Add User",
    preConfirm: () => {
      return {
        name: $("#userName").val(),
        email: $("#userEmail").val(),
        phone: $("#userPhone").val(),
        district: $("#userDistrict").val(),
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Success!", "User added successfully", "success")
      loadUsers()
    }
  })
}

function addNewWorker() {
  Swal.fire({
    title: "Add New Worker",
    html: `
            <input id="workerName" class="swal2-input" placeholder="Full Name">
            <input id="workerEmail" class="swal2-input" placeholder="Email">
            <input id="workerPhone" class="swal2-input" placeholder="Phone">
            <select id="workerCategory" class="swal2-input">
                <option value="">Select Category</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
            </select>
            <select id="workerDistrict" class="swal2-input">
                <option value="">Select District</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Gampaha">Gampaha</option>
            </select>
        `,
    confirmButtonText: "Add Worker",
    preConfirm: () => {
      return {
        name: $("#workerName").val(),
        email: $("#workerEmail").val(),
        phone: $("#workerPhone").val(),
        category: $("#workerCategory").val(),
        district: $("#workerDistrict").val(),
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Success!", "Worker added successfully", "success")
      loadWorkers()
    }
  })
}

function addNewCategory() {
  Swal.fire({
    title: "Add New Category",
    html: `
            <input id="categoryName" class="swal2-input" placeholder="Category Name">
            <textarea id="categoryDescription" class="swal2-textarea" placeholder="Description"></textarea>
        `,
    confirmButtonText: "Add Category",
    preConfirm: () => {
      return {
        name: $("#categoryName").val(),
        description: $("#categoryDescription").val(),
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Success!", "Category added successfully", "success")
      loadCategories()
    }
  })
}

function generateReport() {
  Swal.fire({
    title: "Generate Report",
    text: "Select report type and date range",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Generate",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Success!", "Report generated and downloaded", "success")
    }
  })
}

function editUser(userId) {
  Swal.fire("Edit User", `Editing user with ID: ${userId}`, "info")
}

function deleteUser(userId) {
  Swal.fire({
    title: "Delete User",
    text: "Are you sure you want to delete this user?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "User has been deleted.", "success")
      loadUsers()
    }
  })
}

function editWorker(workerId) {
  Swal.fire("Edit Worker", `Editing worker with ID: ${workerId}`, "info")
}

function deleteWorker(workerId) {
  Swal.fire({
    title: "Delete Worker",
    text: "Are you sure you want to delete this worker?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Worker has been deleted.", "success")
      loadWorkers()
    }
  })
}

function editCategory(categoryId) {
  Swal.fire("Edit Category", `Editing category with ID: ${categoryId}`, "info")
}

function deleteCategory(categoryId) {
  Swal.fire({
    title: "Delete Category",
    text: "Are you sure you want to delete this category?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Category has been deleted.", "success")
      loadCategories()
    }
  })
}

function viewBooking(bookingId) {
  Swal.fire("View Booking", `Viewing booking details for: ${bookingId}`, "info")
}

function editBooking(bookingId) {
  Swal.fire("Edit Booking", `Editing booking: ${bookingId}`, "info")
}

function saveGeneralSettings() {
  Swal.fire({
    title: "Saving Settings",
    text: "Please wait...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  setTimeout(() => {
    Swal.fire("Success!", "Settings saved successfully", "success")
  }, 1500)
}
