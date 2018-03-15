$(function() {
	// generate unique user id
	var userId = Math.random().toString(16).substring(2,15);
	var socket = io.connect("/");
	var map;
	var center = [52.52604901080316, 13.403679728507996];
	var projection;
	var mouseCircle;

	var info = $("#infobox");
	var doc = $(document);

	var sentData = {boxes:[]};

	var connects = {};
	var markers = {};

  var markerGroup;

	socket.on("load:boxes", function(data) {
		// remember users id to show marker only once
    console.log('Receiving new data: ' + data.boxes.length);
		sentData = data;
		updateMarker(sentData);

		// connects[data.id] = data;
		// connects[data.id].updated = $.now(); // shorthand for (new Date).getTime()
	});

	function initMap() {
		// load leaflet map
		map = L.map("map", {
        center: center,
        zoom: 18
    });

		// leaflet API key tiler
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.streets',
				accessToken: 'pk.eyJ1IjoibWFidXMiLCJhIjoiY2lwd2xnMHZ5MDA1c2k3bm9wc2J2dnRjZyJ9.lHIMqnnD4gx9z6ovNgzcmg'
		}).addTo(map);

		markerGroup = L.layerGroup().addTo(map);

		mouseCircle = L.circle([52.52604901080316, 13.403679728507996], {
				color: 'blue',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 1
		}).addTo(markerGroup);
	}

	function initD3() {
		var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");
		var w = 600;
		//Define map projection
		projection = d3.geoMercator()
								 .center([ 13.403679728507996, 52.52604901080316 ])
								 .translate([ 0,0 ])
								 .scale([ w/0.163 ]);

		 //Load in GeoJSON data
 		d3.json("../assets/map.geojson", function(error, collection) {

 			var transform = d3.geoTransform({point: projectPoint});
 			var path = d3.geoPath()
 							 .projection(transform);

 			var feature = g.selectAll("path")
 				.data(collection.features)
 				.enter().append("path");
 			map.on("zoom", reset);
 			reset();


 			function reset() {
 				var bounds = path.bounds(collection),
 					topLeft = bounds[0],
 					bottomRight = bounds[1];

 				var width = bottomRight[0] - topLeft[0];
 				var height = bottomRight[1] - topLeft[1];

 				projection.fitExtent([[0, 0], [width, height]], collection);

				svg.attr("width", width)
				.attr("height", height)
				.style("left", topLeft[0] + "px")
				.style("top", topLeft[1] + "px");

				g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

				feature.attr("d", path);
 			}

		});

		// Attach a listener for the mousemove event
		svg.on('click', function(ev) {

			// Get the (x, y) position of the mouse (relative to the SVG element)
			var pos = d3.mouse(svg.node()),
					px = pos[0],
					py = pos[1];

			var data = {id:Math.random().toString(16).substring(2,15),boxes: [pos]};

			socket.emit('send:boxes', data);

			// Compute the corresponding geographic coordinates using the inverse projection
			// var coords = projection.invert([px, py]);
			//
			// // Format the coordinates to have at most 4 decimal places
			// var lng = coords[0].toFixed(8),
			// 		lat = coords[1].toFixed(8);
			//
			// var newLatLng = new L.LatLng(lat, lng);
			// mouseCircle.setLatLng(newLatLng);

			// Set the content of the label
		//	console.log([lat, lng].join(', '));
		 // label.text([lat, lon].join(', '));
		});
	}

	function projectPoint(x, y) {
		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}


	function updateMarker(data) {
    markerGroup.clearLayers();


		for (i = 0; i < data.boxes.length; i++) {
      let box = data.boxes[i];
			var px = box[0];
			var py = box[1];


			var coords = projection.invert([px, py]);

			var lng = coords[0].toFixed(8),
			 		lat = coords[1].toFixed(8);

			var newLatLng = new L.LatLng(lat, lng);
			var marker = createMarkerAt(newLatLng);

			marker.addTo(map);


      console.log(box);

			//markers[data.id] = marker;
		}
	}

	function createMarkerAt(latLng){
		return circle = L.circle(latLng, {
				color: 'blue',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: 1
		});
	}

  initMap();
	initD3();

	// delete inactive users every 15 sec
	setInterval(function() {
		//updateMarker(sentData);
  }, 1000);
});
