var simplemaps_countrymap_mapdata={
  main_settings: {
    //General settings
		width: "responsive", //or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",
    pop_ups: "detect",
    
		//State defaults
		state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#023047",
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "yes",
    
		//Location defaults
		location_description: "Location description",
    location_url: "",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_size: 25,
    location_type: "square",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",
    
		//Label defaults
		label_color: "#ffffff",
    label_hover_color: "#ffffff",
    label_size: 16,
    label_font: "Arial",
    label_display: "auto",
    label_scale: "yes",
    hide_labels: "no",
    hide_eastern_labels: "no",
   
		//Zoom settings
		zoom: "yes",
    manual_zoom: "yes",
    back_image: "no",
    initial_back: "no",
    initial_zoom: "-1",
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",
    zoom_percentage: 0.99,
    zoom_time: 0.5,
    
		//Popup settings
		popup_color: "white",
    popup_opacity: 0.8,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",
    
		//Advanced settings
		div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Services"
  },
  state_specific: {
    LK11: {
      name: "Colombo",
      description: "Colombo District - Capital region with many job opportunities",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK11', 'Colombo');"
    },
    LK12: {
      name: "Gampaha",
      description: "Gampaha District - Industrial and residential area",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK12', 'Gampaha');"
    },
    LK13: {
      name: "Kalutara",
      description: "Kalutara District - Coastal area with tourism opportunities",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK13', 'Kalutara');"
    },
    LK21: {
      name: "Kandy",
      description: "Kandy District - Central province with cultural heritage jobs",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK21', 'Kandy');"
    },
    LK22: {
      name: "Matale",
      description: "Matale District - Central highlands region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK22', 'Matale');"
    },
    LK23: {
      name: "Nuwara Eliya",
      description: "Nuwara Eliya District - Hill country with tea plantations",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK23', 'Nuwara Eliya');"
    },
    LK31: {
      name: "Galle",
      description: "Galle District - Southern coastal area with tourism and services",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK31', 'Galle');"
    },
    LK32: {
      name: "Matara",
      description: "Matara District - Southern coastal region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK32', 'Matara');"
    },
    LK33: {
      name: "Hambantota",
      description: "Hambantota District - Southern development zone",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK33', 'Hambantota');"
    },
    LK41: {
      name: "Jaffna",
      description: "Jaffna District - Northern peninsula region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK41', 'Jaffna');"
    },
    LK42: {
      name: "Kilinochchi",
      description: "Kilinochchi District - Northern mainland region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK42', 'Kilinochchi');"
    },
    LK43: {
      name: "Mannar",
      description: "Mannar District - Northwestern coastal area",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK43', 'Mannar');"
    },
    LK44: {
      name: "Vavuniya",
      description: "Vavuniya District - North central region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK44', 'Vavuniya');"
    },
    LK45: {
      name: "Mullaitivu",
      description: "Mullaitivu District - Northeastern coastal region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK45', 'Mullaitivu');"
    },
    LK51: {
      name: "Batticaloa",
      description: "Batticaloa District - Eastern coastal region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK51', 'Batticaloa');"
    },
    LK52: {
      name: "Ampara",
      description: "Ampara District - Southeastern region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK52', 'Ampara');"
    },
    LK53: {
      name: "Trincomalee",
      description: "Trincomalee District - Eastern port city",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK53', 'Trincomalee');"
    },
    LK61: {
      name: "Kurunegala",
      description: "Kurunegala District - North western province",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK61', 'Kurunegala');"
    },
    LK62: {
      name: "Puttalam",
      description: "Puttalam District - Western coastal region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK62', 'Puttalam');"
    },
    LK71: {
      name: "Anuradhapura",
      description: "Anuradhapura District - Ancient capital region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK71', 'Anuradhapura');"
    },
    LK72: {
      name: "Polonnaruwa",
      description: "Polonnaruwa District - Ancient kingdom region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK72', 'Polonnaruwa');"
    },
    LK81: {
      name: "Badulla",
      description: "Badulla District - Uva province hill country",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK81', 'Badulla');"
    },
    LK82: {
      name: "Moneragala",
      description: "Moneragala District - Uva province lowlands",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK82', 'Moneragala');"
    },
    LK91: {
      name: "Ratnapura",
      description: "Ratnapura District - Gem mining region",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK91', 'Ratnapura');"
    },
    LK92: {
      name: "Kegalle",
      description: "Kegalle District - Sabaragamuwa province",
      color: "default",
      hover_color: "#023047",
      url: "javascript:district_click('LK92', 'Kegalle');"
    }
  },
  locations: {
    // "0": {
    //   name: "Colombo",
    //   lat: "6.931944",
    //   lng: "79.847778"
    // }
  },
  labels: {
    LK11: {
      name: "Colombo",
      parent_id: "LK11"
    },
    LK12: {
      name: "Gampaha",
      parent_id: "LK12"
    },
    LK13: {
      name: "Kaluthara",
      parent_id: "LK13"
    },
    LK21: {
      name: "Kandy",
      parent_id: "LK21"
    },
    LK22: {
      name: "Matale",
      parent_id: "LK22"
    },
    LK23: {
      name: "Nuwara Eliya",
      parent_id: "LK23"
    },
    LK31: {
      name: "Galle",
      parent_id: "LK31"
    },
    LK32: {
      name: "Matara",
      parent_id: "LK32"
    },
    LK33: {
      name: "Hambantota",
      parent_id: "LK33"
    },
    LK41: {
      name: "Jaffna",
      parent_id: "LK41"
    },
    LK42: {
      name: "Kilinochchi",
      parent_id: "LK42"
    },
    LK43: {
      name: "Mannarr",
      parent_id: "LK43"
    },
    LK44: {
      name: "Vavuniya",
      parent_id: "LK44"
    },
    LK45: {
      name: "Mulathiv",
      parent_id: "LK45"
    },
    LK51: {
      name: "Madakalapuwa",
      parent_id: "LK51"
    },
    LK52: {
      name: "Ampara",
      parent_id: "LK52"
    },
    LK53: {
      name: "Trincomallee",
      parent_id: "LK53"
    },
    LK61: {
      name: "Kurunagala",
      parent_id: "LK61"
    },
    LK62: {
      name: "Puttalam",
      parent_id: "LK62"
    },
    LK71: {
      name: "Anuradhapura",
      parent_id: "LK71"
    },
    LK72: {
      name: "Polonnaruwa",
      parent_id: "LK72"
    },
    LK81: {
      name: "Badulla",
      parent_id: "LK81"
    },
    LK82: {
      name: "Monaragala",
      parent_id: "LK82"
    },
    LK91: {
      name: "Rathnapura",
      parent_id: "LK91"
    },
    LK92: {
      name: "Kegalle",
      parent_id: "LK92"
    }
  }
};