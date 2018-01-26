$(function() {
	// generate unique user id
	var userId = Math.random().toString(16).substring(2,15);
	var socket = io.connect("/");
	var map;

	var info = $("#infobox");
	var doc = $(document);

	// custom marker's icon styles
	var tinyIcon = L.Icon.extend({
		options: {
			shadowUrl: "../assets/marker-shadow.png",
			iconSize: [25, 39],
			iconAnchor:   [12, 36],
			shadowSize: [41, 41],
			shadowAnchor: [12, 38],
			popupAnchor: [0, -30]
		}
	});
	var redIcon = new tinyIcon({ iconUrl: "../assets/marker-red.png" });
	var yellowIcon = new tinyIcon({ iconUrl: "../assets/marker-yellow.png" });

	var sentData = {boxes:[]};

	var connects = {};
	var markers = {};

  var markerGroup;

	socket.on("load:boxes", function(data) {
		// remember users id to show marker only once
    //console.log(data.id);
		sentData = data;

		// connects[data.id] = data;
		// connects[data.id].updated = $.now(); // shorthand for (new Date).getTime()
	});

	function initMap() {
		// load leaflet map
		map = L.map("map", {
        center: [51.505, -0.09],
        zoom: 19
    });

		// leaflet API key tiler
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 22,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoibWFidXMiLCJhIjoiY2lwd2xnMHZ5MDA1c2k3bm9wc2J2dnRjZyJ9.lHIMqnnD4gx9z6ovNgzcmg'
    }).addTo(map);
	}


	function updateMarker(data) {
    if(markerGroup){
      map.removeLayer(markerGroup);
    }

    markerGroup = L.layerGroup().addTo(map);
		for (i = 0; i < data.boxes.length; i++) {
      let box = data.boxes[i];


      console.log(box);
			var marker = L.marker([box[1], box[0]], { icon: yellowIcon }).addTo(markerGroup);
			//markers[data.id] = marker;
		}
	}

  initMap();

	// delete inactive users every 15 sec
	setInterval(function() {
		updateMarker(sentData);
  }, 1000);
});
