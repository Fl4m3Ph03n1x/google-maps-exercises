/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    27 June, 2016
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
 * @description The geocoder instance that allows reverse geocoding. 
 */
var geocoder;

/**
 * @global 
 * @description	Service that allows one to know the max zoom level at a given location.
 * @see 		{@link https://developers.google.com/maps/documentation/javascript/maxzoom|Maz Zoom Service Documentation}
 */
var maxZoomService;

/**
 * @const
 * @type		{Number}
 * @default
 * @description	Default zoom level used in satellite imagery, when the maxZoomService fails to return a valid max zoom level.
 */
const DEFAULT_SATELLITE_ZOOM = 10;

/**
 * @function initMap
 * @description Initializes the and the libraries.
 */
function initMap() {

	markerLib = new MarkerTracker();
	markerLabels = new MarkerLabelLib(MarkerLabelLib.GREEK_ALPHABET, true);
	geocoder = new google.maps.Geocoder;
	maxZoomService = new google.maps.MaxZoomService();

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

//single buttons
/**
 * @function	zoomInSatellite
 * @description	Zooms in with the max zoom available to the marker's location and changes to satellite view. If the location has no maxZoom available, it defaults to zoom level 10.
 * @param		{MouseEvent}	event	The mouse 'click' event. 
 */
function zoomInSatellite(event) {
	event = event || window.event;
	let target = event.target || event.srcElement;

	let markerId = target.getAttribute("markerid");
	let marker = markerLib.getMarkerById(markerId);
	let latLng = {
		lat: marker.position.lat(),
		lng: marker.position.lng()
	};
	map.setCenter(latLng);
	map.setMapTypeId(google.maps.MapTypeId.SATELLITE);

	maxZoomService.getMaxZoomAtLatLng(latLng, function(response) {
		if (response.status !== google.maps.MaxZoomStatus.OK)
			map.setZoom(DEFAULT_SATELLITE_ZOOM);
		else 
			map.setZoom(response.zoom);
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

	if (results.length === 0)
		result = '<p><b>No results found</b></p>';
	else {
		results.forEach(function(element, index) {
			result += '<p><b>Place Number:</b>' + index + '</p>' +
				'<p><b>Location Types:</b>' + element.types + '</p>' +
				'<p><b>Formatted Address:</b>' + element.formatted_address + '</p>';
		});
	}

	let infoContent =
		'<div id="content">' +
		'<div id="siteNotice"></div>' +
		'<h1 id="firstHeading" class="firstHeading">Reverse Geocoding Info</h1>' +
		'<div id="bodyContent">' + result + '</div>' +
		'<button onclick="zoomInSatellite()" markerid="' + markerId + '">Zoom In</button> ' +
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