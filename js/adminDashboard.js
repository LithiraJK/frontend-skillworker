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


const $ = window.$
const Swal = window.Swal

function getAuthToken() {
  const token = $.cookie('token')
  return token
}

function createAuthHeaders() {
  const token = getAuthToken()
  return {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
}

$(document).ready(() => {

  // if (typeof window.tokenHandler !== 'undefined' && token) {
  //   try {
  //     window.tokenHandler.scheduleSilentRefresh(token)
  //   } catch (error) {
  //     console.warn('Token refresh handler not available:', error)
  //   }
  // }

  initializeDashboard()

  $(".sidebar-item").click(function (e) {
    e.preventDefault()

    $(".sidebar-item").removeClass("active")

    $(this).addClass("active")

    $(".content-section").hide()

    const section = $(this).data("section")
    $(`#${section}-section`).show()

    loadSectionData(section)
  })

  $("#menu-toggle").click(() => {
    $("#sidebar-wrapper").toggleClass("active")
  })

  $("#userSearch").on("keyup", function () {
    filterTable("usersTable", $(this).val())
  })

  $("#serviceSearch").on("keyup", function () {
    filterTable("servicesTable", $(this).val())
  })

  $("#bookingStatusFilter").change(function () {
    filterBookingsByStatus($(this).val())
  })

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
  loadDashboardStats()
  loadRecentAds()
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
        $("#totalAds").text((response.data.totalAds || 0).toLocaleString())
        $("#totalSubscriptions").text((response.data.totalSubscriptions || 0).toLocaleString())
      }
    },
    error: function(error) {
      console.error("Error loading dashboard stats:", error)
      
      // Show default stats if API fails
      const defaultStats = {
        totalUsers: 0,
        activeWorkers: 0,
        totalAds: 0,
        totalSubscriptions: 0,
      }

      $("#totalUsers").text(defaultStats.totalUsers.toLocaleString())
      $("#activeWorkers").text(defaultStats.activeWorkers.toLocaleString())
      $("#totalAds").text(defaultStats.totalAds.toLocaleString())
      $("#totalSubscriptions").text(defaultStats.totalSubscriptions.toLocaleString())

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
    case "services":
      loadServices()
      break
    case "categories":
      loadCategories()
      break
    case "reports":
      loadReports()
      break
    case "reviews":
      loadReviews()
      break
    case "subscriptions":
      loadSubscriptions()
      break
    case "complaints":
      loadComplaints()
      break
    case "broadcast":
      loadBroadcast()
      break
    case "settings":
      loadSettings()
      break
    default:
      console.log("No data loader for section:", section)
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
    url: 'http://localhost:8080/api/v1/user/getall',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Users loaded successfully:", response)
      
      tbody.empty()
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((user) => {
          if (user.role && user.role.toLowerCase() === 'admin') {
            return
          }

          const statusClass = user.active ? "bg-success" : "bg-danger"
          const status = user.active ? "Active" : "Deactive"
          const action = user.active ? "Deactivate" : "Activate"
          const actionClass = user.active ? "bg-danger" : "bg-success"

          const row = `
            <tr>
                <td>${user.userId || user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>${user.role || 'Client'}</td>
                <td>
                    <button class="btn btn-sm ${actionClass}" onclick="changeStatusUser(${user.userId || user.id})">
                        ${action}
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

function loadServices() {
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

  const tbody = $("#servicesTable tbody")
  tbody.html('<tr><td colspan="7" class="text-center">Loading Services...</td></tr>')

  $.ajax({
    url: 'http://localhost:8080/api/v1/ad/getall',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Services loaded successfully:", response)
      
      tbody.empty()
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((service) => {
          const statusClass = service.status === "ACTIVE" ? "bg-success" : "bg-danger"
          const rating = service.rating || 'N/A'
          const row = `
            <tr>
                <td>${service.id}</td>
                <td>${service.title}</td>
                <td>${service.categoryName || 'N/A'}</td>
                <td>${service.startingPrice}</td>
                <td><span class="badge ${statusClass}">${service.status || 'Active'}</span></td>
                <td>${service.createdDate }</td>
                <td>
                        <button class="btn px-1 py-1 bg-secondary" href="#" onclick="ReviewService(${service.id})">
                            <i class="fas fa-eye me-1"></i> Review
                        </button>
                </td>
            </tr>
          `
          tbody.append(row)
        })
      } else {
        tbody.html('<tr><td colspan="7" class="text-center">No services found</td></tr>')
      }
    },
    error: function(error) {
      console.error("Error loading services:", error)
      tbody.html('<tr><td colspan="7" class="text-center text-danger">Error loading services</td></tr>')
      
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

  $.ajax({
    url: 'http://localhost:8080/api/v1/category/getallwithadscount',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      const categories = response.data

      const tbody = $("#categoriesTable tbody")
  tbody.empty()

  categories.forEach((category) => {
    const statusClass = category.active === true ? "bg-success" : "bg-danger"
    const status = category.active === true ? "Active" : "Deactive"
    const row = `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description}</td>
                <td>${category.adCount}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn badge btn-sm bg-warning" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn badge btn-sm bg-danger" onclick="changeStatusCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
    tbody.append(row)
  })

    },

  })

  
}


function loadReports() {
  // Load reports data - this would typically fetch from API
  console.log("Loading reports data...")
}

function loadReviews() {
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
  const tbody = $("#reviewsTable tbody")
  tbody.html('<tr><td colspan="8" class="text-center">Loading reviews...</td></tr>')

  $.ajax({
    url: 'http://localhost:8080/api/v1/review/getall',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Reviews loaded successfully:", response)
      
      tbody.empty()
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((review) => {
          const statusClass = review.status === 'PENDING' ? 'bg-info' : 
                            review.status === 'APPROVED' ? 'bg-success' : 'bg-danger'
          
          // Format the date
          const createdDate = new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })

        
          let stars = ''
          for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star ${i <= review.rating ? ' text-warning' : ' text-secondary'}"></i>`
          }

          const row = `
            <tr>
              <td>${review.id}</td>
              <td>${review.reviewerName}</td>
              <td>${review.workerName}</td>
              <td class="text">${stars}</td>
              <td>${review.comment}</td>
              <td><span class="badge ${statusClass}">${review.status}</span></td>
              <td>${createdDate}</td>
              <td>
                <button class="btn badge btn-sm bg-warning me-1" onclick="approveReview(${review.id})">
                  <i class="fas fa-check"></i> Accept
                </button>
                <button class="btn badge btn-sm bg-danger me-1" onclick="rejectReview(${review.id})">
                  <i class="fas fa-close"></i> Reject
                </button>
              </td>
            </tr>
          `
          tbody.append(row)
        })
      } else {
        tbody.html('<tr><td colspan="8" class="text-center">No reviews available</td></tr>')
      }
    },
    error: function(error) {
      console.error("Error loading reviews:", error)
      tbody.html('<tr><td colspan="8" class="text-center text-danger">Error loading reviews</td></tr>')
      
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

function approveReview(reviewId) {
  Swal.fire({
    title: "Approve Review",
    text: "Are you sure you want to approve this review?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Yes, Approve!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: "Approving Review",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      $.ajax({
        url: `http://localhost:8080/api/v1/review/approve/${reviewId}`,
        type: 'PATCH',
        headers: createAuthHeaders(),
        success: function(response) {
          console.log("Review approved successfully:", response)
          Swal.fire("Approved!", "Review has been approved.", "success")
          loadReviews()
        },
        error: function(error) {
          console.error("Error approving review:", error)
          
          let errorMessage = "Failed to approve review"
          if (error.status === 401) {
            errorMessage = "Session expired. Please login again."
          } else if (error.status === 403) {
            errorMessage = "You don't have permission to perform this action"
          } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          })

          if (error.status === 401) {
            setTimeout(() => {
              window.location.href = '../pages/login-page.html'
            }, 2000)
          }
        }
      })
    }
  })
}

function rejectReview(reviewId) {
  Swal.fire({
    title: "Reject Review",
    text: "Are you sure you want to reject this review?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    confirmButtonText: "Yes, Reject!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: "Rejecting Review",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      $.ajax({
        url: `http://localhost:8080/api/v1/review/reject/${reviewId}`,
        type: 'PATCH',
        headers: createAuthHeaders(),
        contentType: 'application/json',
        success: function(response) {
          console.log("Review rejected successfully:", response)
          Swal.fire("Rejected!", "Review has been rejected.", "success")
          loadReviews()
        },
        error: function(error) {
          console.error("Error rejecting review:", error)
          
          let errorMessage = "Failed to reject review"
          if (error.status === 401) {
            errorMessage = "Session expired. Please login again."
          } else if (error.status === 403) {
            errorMessage = "You don't have permission to perform this action"
          } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          })

          if (error.status === 401) {
            setTimeout(() => {
              window.location.href = '../pages/login-page.html'
            }, 2000)
          }
        }
      })
    }
  })
}

function loadSubscriptions() {
  // Load subscriptions data - this would typically fetch from API
  console.log("Loading subscriptions data...")
  const tbody = $("#subscriptionsTable tbody")
  tbody.html('<tr><td colspan="8" class="text-center">No subscriptions available</td></tr>')
}

function loadComplaints() {
  // Load complaints data - this would typically fetch from API
  console.log("Loading complaints data...")
  const tbody = $("#complaintsTable tbody")
  tbody.html('<tr><td colspan="8" class="text-center">No complaints available</td></tr>')
}

function loadBroadcast() {
  // Load broadcast data - this would typically fetch from API
  console.log("Loading broadcast data...")
}

function loadSettings() {
  // Load settings data - this would typically fetch from API
  console.log("Loading settings data...")
}

function loadRecentAds() {
  console.log("Loading recent ads...")
  const tbody = $("#recentAdsTable tbody")
  if (tbody.length === 0) {
    // If tbody doesn't exist, create the table structure
    $("#recentAdsTable").html(`
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr><td colspan="5" class="text-center">Loading recent ads...</td></tr>
      </tbody>
    `)
  } else {
    tbody.html('<tr><td colspan="5" class="text-center">Loading recent ads...</td></tr>')
  }

  // Make API call to fetch recent ads
  $.ajax({
    url: 'http://localhost:8080/api/v1/ad/getrecent',
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      console.log("Recent ads loaded successfully:", response)
      
      const tbody = $("#recentAdsTable tbody")
      tbody.empty()
      
      if (response.data && response.data.length > 0) {
        response.data.forEach((ad) => {
          const statusClass = ad.status === "ACTIVE" ? "bg-success" : 
                            ad.status === "PENDING" ? "bg-info" : 
                            ad.status === "PAUSED" ? "bg-warning" : "bg-danger"
          
          const createdDate = new Date(ad.createdDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })

          const row = `
            <tr>
              <td>${ad.id}</td>
              <td>${ad.title}</td>
              <td>${ad.categoryName || 'N/A'}</td>
              <td><span class="badge ${statusClass}">${ad.status}</span></td>
              <td>${createdDate}</td>
            </tr>
          `
          tbody.append(row)
        })
      } else {
        tbody.html('<tr><td colspan="5" class="text-center">No recent ads available</td></tr>')
      }
    },
    error: function(error) {
      console.error("Error loading recent ads:", error)
      const tbody = $("#recentAdsTable tbody")
      tbody.html('<tr><td colspan="5" class="text-center text-danger">Error loading recent ads</td></tr>')
      
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
    loadRecentAds()
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

function addNewCategory() {
  // Remove any existing modal
  $('#addCategoryModal').remove();

  // Create modal HTML
  const modalHtml = `
    <div class="modal fade" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addCategoryModalLabel">Add New Category</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addCategoryForm">
              <div class="mb-3">
                <label for="categoryName" class="form-label">Category Name</label>
                <input type="text" class="form-control" id="categoryName" placeholder="Enter category name" required>
              </div>
              <div class="mb-3">
                <label for="categoryDescription" class="form-label">Description</label>
                <textarea class="form-control" id="categoryDescription" rows="3" placeholder="Enter category description" required></textarea>
              </div>
            </form>
            <div id="addCategoryError" class="alert alert-danger" style="display: none;"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="addCategoryBtn">Add Category</button>
          </div>
        </div>
      </div>
    </div>`;

  // Append modal to body and show it
  $('body').append(modalHtml);
  const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
  modal.show();

  // Handle form submission
  $('#addCategoryBtn').click(function() {
    const name = $('#categoryName').val().trim();
    const description = $('#categoryDescription').val().trim();

    // Validate form
    if (!name || !description) {
      $('#addCategoryError').text('Please fill in all fields').show();
      return;
    }

    // Show loading state
    $('#addCategoryBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...');
    $('#addCategoryError').hide();

    // Make API call to create category
    $.ajax({
      url: 'http://localhost:8080/api/v1/category/create',
      type: 'POST',
      headers: createAuthHeaders(),
      contentType: 'application/json',
      data: JSON.stringify({
        name: name,
        description: description
      }),
      success: function(response) {
        modal.hide();
        $('#addCategoryModal').remove();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Category added successfully.'
        });
        loadCategories();
      },
      error: function(error) {
        let errorMessage = "Failed to add category.";
        if (error.status === 401) {
          errorMessage = "Session expired. Please login again.";
        } else if (error.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (error.responseJSON && error.responseJSON.message) {
          errorMessage = error.responseJSON.message;
        }
        $('#addCategoryError').text(errorMessage).show();
        $('#addCategoryBtn').prop('disabled', false).text('Add Category');

        if (error.status === 401) {
          setTimeout(() => { window.location.href = '../pages/login-page.html'; }, 2000);
        }
      }
    });
  });

  // Clean up modal when hidden
  $('#addCategoryModal').on('hidden.bs.modal', function() {
    $('#addCategoryModal').remove();
  });
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


function changeStatusUser(userId) {
  Swal.fire({
    title: "Change Status",
    text: "Are you sure you want to change status this user?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "rgba(255, 191, 14, 1)",
    confirmButtonText: "Yes, Change!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: "Changing Status",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      $.ajax({
        url: `http://localhost:8080/api/v1/user/status/${userId}`,
        type: 'PATCH',
        headers: createAuthHeaders(),
        success: function(response) {
          console.log("User status changed successfully:", response)
          Swal.fire("Changed", "User Status Changed Successfully!", "success")
          loadUsers()
        },
        error: function(error) {
          console.error("Error changing user status:", error)
          
          let errorMessage = "Failed to change user status"
          if (error.status === 401) {
            errorMessage = "Session expired. Please login again."
          } else if (error.status === 403) {
            errorMessage = "You don't have permission to perform this action"
          } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          })

          if (error.status === 401) {
            setTimeout(() => {
              window.location.href = '../pages/login-page.html'
            }, 2000)
          }
        }
      })
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
      loadServices()
    }
  })
}

function ReviewService(serviceId) {
  $('#reviewServiceModal').remove();
  $.ajax({
    url: `http://localhost:8080/api/v1/ad/get/${serviceId}`,
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      const service = response.data
      const modalHtml = `
      <div class="modal fade" id="reviewServiceModal" tabindex="-1" aria-labelledby="reviewServiceModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="reviewServiceModalLabel">Review Service</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3 p-3 rounded bg-light">
                <div class="fw-bold fs-5 mb-2">${service.title || ''}</div>
                <div class="row mb-2">
                  <div class="col-md-6"><span class="fw-semibold text-secondary">Category :</span> ${service.categoryName || 'N/A'}</div>
                  <div class="col-md-6"><span class="fw-semibold text-secondary">Rate / Day :</span> <span class="text fw-bold"> Rs.</span> <span class="text fw-bold">${service.startingPrice || 'N/A'}</span></div>
                </div>
                <div class="row mb-2">
                  <div class="col-md-6"><span class="fw-semibold text-secondary">Status :</span> <span class="badge fw-bold ${service.status==='ACTIVE'?'bg-success':'PENDING' ? 'bg-info' : 'PAUSED' ? 'bg-warning' : 'bg-danger'}">${service.status || 'N/A'}</span></div>
                  <div class="col-md-6"><span class="fw-semibold text-secondary">Created :</span> ${service.createdDate || 'N/A'}</div>
                </div>
                <div class="mb-2 text-dark"><span class="fw-semibold">Description:</span> ${service.description || ''}</div>
              </div>
              <form id="reviewServiceForm">
                <div class="mb-3">
                  <label for="serviceStatus" class="form-label fw-semibold">Review Action</label>
                  <select id="serviceStatus" class="form-select">
                    <option value="ACTIVE">Approve</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="serviceMessage" class="form-label fw-semibold">Reason <span class="text-danger">(required if rejected)</span></label>
                  <textarea id="serviceMessage" class="form-control" rows="3" placeholder="Enter reason for rejection"></textarea>
                </div>
              </form>
              <div id="reviewServiceError" class="bg-danger p-2 mb-2" style="display:none;"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="submitReviewServiceBtn">Submit Review</button>
            </div>
          </div>
        </div>
      </div>`;
      $('body').append(modalHtml);
      const modal = new bootstrap.Modal(document.getElementById('reviewServiceModal'));
      modal.show();

      $('#submitReviewServiceBtn').off('click').on('click', function() {
        const status = $('#serviceStatus').val();
        const message = $('#serviceMessage').val();
        if (status === 'REJECTED' && !message.trim()) {
          $('#reviewServiceError').text('Reason is required for rejection.').show();
          return;
        }
        $('#reviewServiceError').hide();
        $('#submitReviewServiceBtn').prop('disabled', true).text('Submitting...');
        $.ajax({
          url: `http://localhost:8080/api/v1/ad/status/${serviceId}`,
          type: 'PATCH',
          headers: createAuthHeaders(),
          contentType: 'application/json',
          data: JSON.stringify({
            status,
            message
          }),
          success: function(response) {
            modal.hide();
            $('#reviewServiceModal').remove();
            Swal.fire('Success!', 'Service review submitted successfully.', 'success');
            loadServices();
          },
          error: function(error) {
            let errorMessage = 'Failed to submit review.';
            if (error.status === 401) {
              errorMessage = 'Session expired. Please login again.';
            } else if (error.status === 403) {
              errorMessage = "You don't have permission to perform this action.";
            } else if (error.responseJSON && error.responseJSON.message) {
              errorMessage = error.responseJSON.message;
            }
            $('#reviewServiceError').text(errorMessage).show();
            $('#submitReviewServiceBtn').prop('disabled', false).text('Submit Review');
            if (error.status === 401) {
              setTimeout(() => {
                window.location.href = '../pages/login-page.html';
              }, 2000);
            }
          }
        });
      });

      $('#reviewServiceModal').on('hidden.bs.modal', function () {
        $('#reviewServiceModal').remove();
      });
    },
    error: function(error) {
      let errorMessage = 'Failed to load service details.';
      if (error.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
      if (error.status === 401) {
        setTimeout(() => {
          window.location.href = '../pages/login-page.html';
        }, 2000);
      }
    }
  });
}


function editCategory(categoryId) {
  $('#editCategoryModal').remove();

  $.ajax({
    url: `http://localhost:8080/api/v1/category/get/${categoryId}`,
    type: 'GET',
    headers: createAuthHeaders(),
    success: function(response) {
      const category = response.data || {};
      
      // Create modal HTML
      const modalHtml = `
        <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="editCategoryModalLabel">Edit Category</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form id="editCategoryForm">
                  <div class="mb-3">
                    <label for="editCategoryName" class="form-label">Category Name</label>
                    <input type="text" class="form-control" id="editCategoryName" value="${category.name || ''}" required>
                  </div>
                  <div class="mb-3">
                    <label for="editCategoryDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="editCategoryDescription" rows="3" required>${category.description || ''}</textarea>
                  </div>
                </form>
                <div id="editCategoryError" class="alert alert-danger" style="display: none;"></div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="updateCategoryBtn">Update Category</button>
              </div>
            </div>
          </div>
        </div>`;

      $('body').append(modalHtml);
      const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
      modal.show();

      $('#updateCategoryBtn').click(function() {
        const name = $('#editCategoryName').val().trim();
        const description = $('#editCategoryDescription').val().trim();

        if (!name || !description) {
          $('#editCategoryError').text('Please fill in all fields').show();
          return;
        }

        $('#updateCategoryBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...');
        $('#editCategoryError').hide();

        $.ajax({
          url: `http://localhost:8080/api/v1/category/update/${categoryId}`,
          type: 'PUT',
          headers: createAuthHeaders(),
          contentType: 'application/json',
          data: JSON.stringify({ name, description }),
          success: function(updateResponse) {
            modal.hide();
            $('#editCategoryModal').remove();
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Category updated successfully.'
            });
            loadCategories();
          },
          error: function(error) {
            let errorMessage = "Failed to update category.";
            if (error.status === 401) {
              errorMessage = "Session expired. Please login again.";
            } else if (error.status === 403) {
              errorMessage = "You don't have permission to perform this action.";
            } else if (error.responseJSON && error.responseJSON.message) {
              errorMessage = error.responseJSON.message;
            }
            $('#editCategoryError').text(errorMessage).show();
            $('#updateCategoryBtn').prop('disabled', false).text('Update Category');

            if (error.status === 401) {
              setTimeout(() => { window.location.href = '../pages/login-page.html'; }, 2000);
            }
          }
        });
      });

      $('#editCategoryModal').on('hidden.bs.modal', function() {
        $('#editCategoryModal').remove();
      });
    },
    error: function(error) {
      let errorMessage = 'Failed to load category details.';
      if (error.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.responseJSON && error.responseJSON.message) {
        errorMessage = error.responseJSON.message;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
      if (error.status === 401) {
        setTimeout(() => { window.location.href = '../pages/login-page.html'; }, 2000);
      }
    }
  });
}

function changeStatusCategory(categoryId) {
  Swal.fire({
    title: "Change Status",
    text: "Are you sure you want to change the status of this category?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "rgba(255, 191, 14, 1)",
    confirmButtonText: "Yes, Change!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: "Changing Status",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      $.ajax({
        url: `http://localhost:8080/api/v1/category/status/${categoryId}`,
        type: 'PATCH',
        headers: createAuthHeaders(),
        success: function(response) {
          console.log("Category status changed successfully:", response)
          Swal.fire("Changed", "Category Status Changed Successfully!", "success")
          loadCategories()
        },
        error: function(error) {
          console.error("Error changing category status:", error)
          
          let errorMessage = "Failed to change category status"
          if (error.status === 401) {
            errorMessage = "Session expired. Please login again."
          } else if (error.status === 403) {
            errorMessage = "You don't have permission to perform this action"
          } else if (error.responseJSON && error.responseJSON.message) {
            errorMessage = error.responseJSON.message
          }

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          })

          if (error.status === 401) {
            setTimeout(() => {
              window.location.href = '../pages/login-page.html'
            }, 2000)
          }
        }
      })
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

// Additional functions for the dashboard
function manageAds() {
  // Switch to services/ads section
  $(".sidebar-item").removeClass("active")
  $(".sidebar-item[data-section='services']").addClass("active")
  $(".content-section").hide()
  $("#services-section").show()
  loadServices()
}

function sendBroadcast() {
  // Switch to broadcast section
  $(".sidebar-item").removeClass("active")
  $(".sidebar-item[data-section='broadcast']").addClass("active")
  $(".content-section").hide()
  $("#broadcast-section").show()
  loadBroadcast()
}

function addSubscriptionPlan() {
  Swal.fire({
    title: "Add Subscription Plan",
    html: `
      <input id="planName" class="swal2-input" placeholder="Plan Name">
      <input id="planPrice" class="swal2-input" placeholder="Price (LKR)">
      <input id="planAds" class="swal2-input" placeholder="Number of Ads">
      <textarea id="planDescription" class="swal2-textarea" placeholder="Description"></textarea>
    `,
    confirmButtonText: "Add Plan",
    preConfirm: () => {
      return {
        name: $("#planName").val(),
        price: $("#planPrice").val(),
        ads: $("#planAds").val(),
        description: $("#planDescription").val(),
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Success!", "Subscription plan added successfully", "success")
      loadSubscriptions()
    }
  })
}
