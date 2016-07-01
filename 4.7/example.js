/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    28 June, 2016
 */

'use strict';

/*global google*/
/*global MarkerTracker*/
/*global MarkerLabelLib*/

/**
 * @global 
 * @description The global map varaible representing the map instance of this demo.
 */
var map;

/**
 * @global 
 * @description Instance of the MarkerTracker library, needed to track markers and their statuses.
 */
var markerLib;

/**
 * @global 
 * @description Instance of the MarkerLabelLib, needed to keep track of the labels being using in each marker.
 */
var markerLabels;

/**
 * @global 
 * @description	The position of the last clicked marker. Used for the panoramic view.
 */
var lastMarkerPos;

/**
 * @global 
 * @description	The last known address from the last clicked marker. Used for the panoramic view.
 */
var lastMarkerAddress;

/**
 * @function initMap
 * @description Initializes the and the libraries.
 */
function initMap() {

	markerLib = new MarkerTracker();
	markerLabels = new MarkerLabelLib(MarkerLabelLib.GREEK_ALPHABET, true);

	let location = {
		lat: -25.363,
		lng: 131.044
	};

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: location
	});

	// This event listener calls addMarker() when the map is clicked.
	google.maps.event.addListener(map, 'click', function(event) {


		let newMarker = createMarker(event.latLng, "Marker Number " + markerLib.getIdCounter, markerLabels.nextSymbol(), true);
		markerLib.trackMarker(newMarker);
		reverseGeocodeInfo(event.latLng, newMarker);
	});
}

//listeners
/**
 * @function	clickMarkerEvent
 * @description Function that runs once a marker is clicked. Given a marker, it will show the object current information and make it jump, or turn these behaviours off in case they are enabled.
 * @param		{Marker}	marker	The marker clicked.
 */
function clickMarkerEvent(marker) {
	var infoWindow = markerLib.getMarkerInfo(marker).infoWindow;

	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
		infoWindow.close();
		markerLib.getMarkerInfo(marker).isBouncing = false;
	}
	else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		infoWindow.open(map, marker);
		markerLib.getMarkerInfo(marker).isBouncing = true;
	}
}

//single buttons
/**
 * @function	zoomInStreeViewer
 * @description	Zooms in into the closest street view mode to the position of the given marker in a 1000 meters radius.
 * @param		{MouseEvent}	event	The mouse 'click' event. 
 */
function zoomInStreeViewer(event) {
	event = event || window.event;
	let target = event.target || event.srcElement;

	let markerId = target.getAttribute("markerid");
	let marker = markerLib.getMarkerById(markerId);

	lastMarkerPos = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
	let webService = new google.maps.StreetViewService();

	//Check in a perimeter of 1000 meters
	let checkaround = 1000;

	//checkNearestStreetView is a valid callback function
	webService.getPanoramaByLocation(lastMarkerPos, checkaround, checkNearestStreetView);

	function checkNearestStreetView(panoData) {
		if (panoData) {
			let streetViewPano = map.getStreetView();
			streetViewPano.setPosition({
				lat: panoData.location.latLng.lat(),
				lng: panoData.location.latLng.lng()
			});

			let angle = bearing(lastMarkerPos.lat(), lastMarkerPos.lng(), streetViewPano.getPosition().lat(), streetViewPano.getPosition().lng());
			let convertedAngle = convertTo90(angle);

			streetViewPano.setPov({
				heading: convertedAngle,
				pitch: 0
			});

			streetViewPano.setVisible(true);
			map.setStreetView(streetViewPano);
		}
		else
			alert("No street views available in a 1000 meters radius.");
	}
}

/**
 * @function	convertTo90
 * @description	Converts the given degrees in 360º format to 90º format. 
 * @param		{Number}	degrees	The degrees we want to convert in 360º format.
 * @see 		{@link http://stackoverflow.com/questions/1628386/normalise-orientation-between-0-and-360|StackOverflow Conversion Algorithm}
 */
function convertTo90(degrees) {
	let result = degrees % 90;

	if (result < 0)
		result += 90;

	return result;
}

/**
 * @function	bearing 
 * @description	Calculate the bearing between two positions as a value from 0-360
 * @param		{Number}	lat1	The latitude of the first position
 * @param		{Number}	lng1	The longitude of the first position
 * @param		{Number}	lat2	The latitude of the second position
 * @param		{Number}	lng2	The longitude of the second position
 * @return		{Number}	The bearing between 0 and 360
 * @see 		{@link http://stackoverflow.com/questions/11415106/issue-with-calcuating-compass-bearing-between-two-gps-coordinates|StackOverflow Angle Calculation Algorithms}
 */
function bearing(lat1, lng1, lat2, lng2) {
	var dLon = (lng2 - lng1);
	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
	var brng = toDeg(Math.atan2(y, x));
	return 360 - ((brng + 360) % 360);
}

/**
 * @function	toDeg
 * @description	Since not all browsers implement this we have our own utility that will convert from radians into degrees.
 * @param		{Number}	rad	The radians to be converted into degrees
 * @return		{Number}	degrees
 * @see 		{@link http://stackoverflow.com/questions/11415106/issue-with-calcuating-compass-bearing-between-two-gps-coordinates|StackOverflow Angle Calculation Algorithms}
 */
function toDeg(rad) {
	return rad * 180 / Math.PI;
}

//global buttons
/**
 * @function	hideAllMarkers
 * @description	Hides all the markers currently being tracked by MarkerTracker from the maps they are in. Activated once the "Hide Markers" button in the UI is clicked.
 */
function hideAllMarkers() {
	var markers = markerLib.getIterator();
	for (var marker of markers) {
		marker.setMap(null);
	}
}

/**
 * @function	showAllMarkers
 * @description Shows all the markers currently tracked by MarkerTracker that are hidden and restores their animations. Activated once the "Show all Markers" button in the UI is clicked.
 */
function showAllMarkers() {
	var markers = markerLib.getIterator();
	for (var marker of markers) {
		marker.setMap(map);

		if (markerLib.getMarkerInfo(marker).isBouncing)
			marker.setAnimation(google.maps.Animation.BOUNCE);
	}

}

/**
 * @function	deleteAllMarkers
 * @description	Deletes all the markers currently being tracked by MarkerTracker from the maps they are in. Activated once the "Delete Markers" button is clicked. 
 */
function deleteAllMarkers() {
	markerLib.reset();
	markerLabels.reset(true);
}

//Auxiliary functions 
/**
 * @function	createInfoWindow
 * @description Creates and returns an InfoWindow object with the given parameters.
 * @param		{Array}		results			An array containing all the places to be shown in the InfoWindow.
 * @param		{Number}	markerId		The Id of the marker where to which this infoWndow is associated. 
 * @param		{Number}	customMaxWidth	<b>OPTIONAL</b>, The width of the Infowindow. If not declared, uses the default value of 200px. 
 * @returns 	{Object}	The InfoWindow object with the given information. 
 */
function createInfoWindow(results, markerId, customMaxWidth) {
	let windowMaxWidth = (Number.isInteger(customMaxWidth) && customMaxWidth != null && customMaxWidth > 0 ? customMaxWidth : 200);
	let result = '';

	lastMarkerAddress = results[0];
	if (results.length === 0)
		result = '<p><b>No results found</b></p>';
	else {
		result += '<p><b>Location Types:</b>' + lastMarkerAddress.types + '</p>' +
			'<p><b>Formatted Address:</b>' + lastMarkerAddress.formatted_address + '</p>';
	}

	let infoContent =
		'<div id="content">' +
		'<div id="siteNotice"></div>' +
		'<h1 id="firstHeading" class="firstHeading">Reverse Geocoding Info</h1>' +
		'<div id="bodyContent">' + result + '</div>' +
		'<input type="text" name="street" placeholder="Sreet Address" id="inputStreetAddress"><br>' +
		'<button onclick="zoomInStreeViewer()" markerid="' + markerId + '">Zoom In Street View</button> ' +
		'<button onclick="calculateRoute()" markerid="' + markerId + '">Get Route</button> ' +
		'</div>';

	return new google.maps.InfoWindow({
		content: infoContent,
		maxWidth: windowMaxWidth
	});
}

/**
 * @function	createMarker
 * @description Creates and returns a marker with the given parameters. Depends on the global variable <code>map</code>.
 * @param		{Location}	aPosition		The Position object (containing a <code>lat</code> and <code>lng</code> properties) with the coordinates of the marker.
 * @param		{String}	aTitle			The title of the marker. 
 * @param		{Char}		aLabel			<b>OPTIONAL</b>, The label of the marker. Markers can only have labels with 1 (one) character. If it is not set, defaults to to empty <code>''</code>. 
 * @param		{Boolean}	isDraggable		<b>OPTIONAL</b>, If the marker is draggable or not. If not set, defaults to <code>false</code>. 
 * @param		{Object}	anAnimation		<b>OPTIONAL</b>, The animation of the marker when it is added to the map. If not set, defaults to <code>google.maps.Animation.DROP</code>. 
 * @returns 	{Object}	Returns the created marker object. 
 */
function createMarker(aPosition, aTitle, aLabel, isDraggable, anAnimation) {

	let theLabel = (typeof aLabel != 'undefined' && aLabel != null && aLabel.length === 1 ? aLabel : '');
	let drag = (typeof isDraggable === 'boolean' && isDraggable != null ? isDraggable : false);
	let theAnimation = (typeof anAnimation != 'undefined' && anAnimation != null ? anAnimation : google.maps.Animation.DROP);

	return new google.maps.Marker({
		position: aPosition,
		map: map,
		draggable: drag,
		animation: theAnimation,
		label: theLabel,
		title: aTitle
	});
}

/**
 * @function	reverseGeocodeInfo
 * @description	Receives a location and a marker, and associates to the marker an InfoWindow with all the addresses associated with the position of the given mark. Does reverse geocoding to achieve that.	It is normal for the reverse-geocoding to return several addresses.
 * @param		{Location}	aLocation	The location in object from the event.
 * @param		{Marker}	newMarker	The new marker that was created.
 */
function reverseGeocodeInfo(aLocation, newMarker) {

	let geocoder = new google.maps.Geocoder;

	geocoder.geocode({
		'location': {
			lat: aLocation.lat(),
			lng: aLocation.lng()
		}
	}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {

			let infoWindow = createInfoWindow(results, markerLib.getMarkerId(newMarker), 300);

			//we memorize if the marker is bouncing or not in our object because 
			//when we hide the marker all information about animations is lost!
			//But no problem, our lib can take care of that!
			var infoObj = {
				infoWindow: infoWindow,
				isBouncing: false
			};

			markerLib.setMarkerInfo(newMarker, infoObj);

			markerLib.setMarkerListener(newMarker, 'click', function() {
				clickMarkerEvent(newMarker);
			});

			newMarker.setMap(map);
		}
		else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}

/**
 * @function	calculateRoute
 * @description	Calculates a driving rout from the marker to the street written in the street box.
 */
function calculateRoute() {
	let address = document.getElementById("inputStreetAddress").value;

	let directionsService = new google.maps.DirectionsService;
	let directionsDisplay = new google.maps.DirectionsRenderer;
	directionsDisplay.setMap(map);

	directionsService.route({

		origin: lastMarkerAddress.formatted_address,
		destination: address,

		travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {

		if (status === google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
		}
		else {
			window.alert('Directions request failed due to ' + status);
		}

	});

}
