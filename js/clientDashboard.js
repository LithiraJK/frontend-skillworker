$(document).ready(function() {
    // Initialize the Sri Lanka map
    if (typeof simplemaps_countrymap !== 'undefined') {
        simplemaps_countrymap.load();
    }
    
    // Search form functionality
    $('#search-form').on('submit', function(e) {
        e.preventDefault();
        const searchTerm = $('#search-input').val().trim();
        if (searchTerm) {
            console.log('Searching for:', searchTerm);
            // Add your search logic here
        }
    });
    
    // Apply button functionality
    $('.apply-btn').on('click', function() {
        const jobTitle = $(this).siblings('h5').text();
        console.log('Applying for job:', jobTitle);
        // Add your application logic here
    });
});

// Map click handler - this will be called when a district is clicked
function district_click(district_id, district_name) {
    console.log('District clicked:', district_name, 'ID:', district_id);
    // You can filter job listings based on the selected district
    filterJobsByDistrict(district_id, district_name);
}

function filterJobsByDistrict(districtId, districtName) {
    // Show selected district in console (you can replace with actual filtering logic)
    console.log('Filtering jobs for district:', districtName);
    
    // Update the search input to show selected district
    const searchInput = $('#search-input');
    searchInput.val(`Jobs in ${districtName}`);
    searchInput.attr('placeholder', `Showing jobs in ${districtName}`);
    
    // Add visual feedback
    $('.map-instruction').html(`<strong>Selected District: ${districtName}</strong> - Click on another district to change selection`);
    
    // Here you would typically make an API call to filter jobs
    // Example: 
    // fetchJobsByDistrict(districtId);
}