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
    state_color: "#212121",
    state_hover_color: "#ffc107",
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
    popup_opacity: 0.9,
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
    link_text: "View Website"
  },
  state_specific: {
    LK11: {
      name: "Colombo",
      description: "Colombo District - Capital region with many job opportunities",
      color: "default",
      hover_color: "#ffc107",
      url: "javascript:district_click('LK11', 'Colombo');"
    },
    LK12: {
      name: "Gampaha",
      description: "Gampaha District - Industrial and residential area",
      color: "default",
      hover_color: "#ffc107",
      url: "javascript:district_click('LK12', 'Gampaha');"
    },
    LK13: {
      name: "Kalutara",
      description: "Kalutara District - Coastal area with tourism opportunities",
      color: "default",
      hover_color: "#ffc107",
      url: "javascript:district_click('LK13', 'Kalutara');"
    },
    LK21: {
      name: "Kandy",
      description: "Kandy District - Central province with cultural heritage jobs",
      color: "default",
      hover_color: "#ffc107",
      url: "javascript:district_click('LK21', 'Kandy');"
    },
    LK22: {
      name: "Mātale",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK23: {
      name: "Nuvara Ĕliya",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK31: {
      name: "Gālla",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK32: {
      name: "Mātara",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK33: {
      name: "Hambantŏṭa",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK41: {
      name: "Yāpanaya",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK42: {
      name: "Kilinŏchchi",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK43: {
      name: "Mannārama",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK44: {
      name: "Vavuniyāva",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK45: {
      name: "Mulativ",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK51: {
      name: "Maḍakalapuva",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK52: {
      name: "Ampāra",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK53: {
      name: "Trikuṇāmalaya",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK61: {
      name: "Kuruṇægala",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK62: {
      name: "Puttalama",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK71: {
      name: "Anurādhapura",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK72: {
      name: "Pŏḷŏnnaruva",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK81: {
      name: "Badulla",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK82: {
      name: "Mŏṇarāgala",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK91: {
      name: "Ratnapura",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
    },
    LK92: {
      name: "Kægalla",
      description: "default",
      color: "default",
      hover_color: "default",
      url: "default"
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
      name: "Kŏḷamba",
      parent_id: "LK11"
    },
    LK12: {
      name: "Gampaha",
      parent_id: "LK12"
    },
    LK13: {
      name: "Kaḷutara",
      parent_id: "LK13"
    },
    LK21: {
      name: "Mahanuvara",
      parent_id: "LK21"
    },
    LK22: {
      name: "Mātale",
      parent_id: "LK22"
    },
    LK23: {
      name: "Nuvara Ĕliya",
      parent_id: "LK23"
    },
    LK31: {
      name: "Gālla",
      parent_id: "LK31"
    },
    LK32: {
      name: "Mātara",
      parent_id: "LK32"
    },
    LK33: {
      name: "Hambantŏṭa",
      parent_id: "LK33"
    },
    LK41: {
      name: "Yāpanaya",
      parent_id: "LK41"
    },
    LK42: {
      name: "Kilinŏchchi",
      parent_id: "LK42"
    },
    LK43: {
      name: "Mannārama",
      parent_id: "LK43"
    },
    LK44: {
      name: "Vavuniyāva",
      parent_id: "LK44"
    },
    LK45: {
      name: "Mulativ",
      parent_id: "LK45"
    },
    LK51: {
      name: "Maḍakalapuva",
      parent_id: "LK51"
    },
    LK52: {
      name: "Ampāra",
      parent_id: "LK52"
    },
    LK53: {
      name: "Trikuṇāmalaya",
      parent_id: "LK53"
    },
    LK61: {
      name: "Kuruṇægala",
      parent_id: "LK61"
    },
    LK62: {
      name: "Puttalama",
      parent_id: "LK62"
    },
    LK71: {
      name: "Anurādhapura",
      parent_id: "LK71"
    },
    LK72: {
      name: "Pŏḷŏnnaruva",
      parent_id: "LK72"
    },
    LK81: {
      name: "Badulla",
      parent_id: "LK81"
    },
    LK82: {
      name: "Mŏṇarāgala",
      parent_id: "LK82"
    },
    LK91: {
      name: "Ratnapura",
      parent_id: "LK91"
    },
    LK92: {
      name: "Kægalla",
      parent_id: "LK92"
    }
  }
};