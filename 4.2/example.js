/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    22 June, 2016
 */

'use strict';

/*global google*/
/*global MarkerTracker*/
/*global MarkerLabelLib*/

var map;
var markerLib;
var markerLabels;

/**
 * @function initMap
 * @description Initializes the and the libraries.
 */
function initMap() {

	markerLib = new MarkerTracker();
	markerLabels = new MarkerLabelLib(MarkerLabelLib.GREEK_ALPHABET, true);

	var location = {
		lat: -25.363,
		lng: 131.044
	};

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: location
	});

	// Create the search box and link it to the UI element.
	initSearchBox(map);

	// This event listener calls addMarker() when the map is clicked.
	google.maps.event.addListener(map, 'click', function(event) {
	
	
		let newMarker = createMarker(event.latLng, "Marker Number " + markerLib.getIdCounter, markerLabels.nextSymbol(), true);
		markerLib.trackMarker(newMarker);

		let infoWindow = createInfoWindow(newMarker.getPosition(), newMarker.getTitle(), markerLib.getMarkerId(newMarker));
		
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
	});
}

//listeners
/**
 * @function clickMarkerEvent
 * @description Function that runs once a marker is clicked. Given a marker, it will show the object current information and make it jump, or turn these behaviours off in case they are enabled.
 * @param {Object} marker The marker clicked.
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

//searchbox
/**
 * @function initSearchBox
 * @description Function containing the initilization of the searchbox together with the listeners it uses.
 */
function initSearchBox() {
	// Create the search box and link it to the UI element.
	let input = document.getElementById('pac-input');
	let searchBox = new google.maps.places.SearchBox(input);
	// map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	searchBox.addListener('places_changed', function() {

		deleteAllMarkers();

		let places = searchBox.getPlaces();
		if (places.length == 0) {
			return;
		}

		// For each place, get the icon, name and location.
		let bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {

			// // Create a marker for each place.
			let newMarker = createMarker(place.geometry.location, place.name, markerLabels.nextSymbol(), true);
			markerLib.trackMarker(newMarker);

			let infoWindow = createInfoWindow(place.formatted_address, place.name, markerLib.getMarkerId(newMarker));

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

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			}
			else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});
}

//single buttons
/**
 * @function deleteMarkerClickEvent
 * @description Deletes the mark associated with the clicked delete button.
 * @param {MouseEvent} event The mouse 'click' event. 
 */
function deleteMarkerClickEvent(event) {
	event = event || window.event;
	let target = event.target || event.srcElement;

	let markerId = target.getAttribute("markerid");
	let marker = markerLib.getMarkerById(markerId);

	markerLabels.recycleSymbol(marker.label)
	markerLib.untrackMarkerById(markerId);
}

/**
 * @function hideMarkerClickEvent
 * @description Hides the mark associated with the clicked hide button.
 * @param {MouseEvent} event The mouse 'click' event. 
 */
function hideMarkerClickEvent(event) {
	event = event || window.event;
	let target = event.target || event.srcElement;

	let markerId = target.getAttribute("markerid");
	let marker = markerLib.getMarkerById(markerId);
	marker.setMap(null);
}

//global buttons
/**
 * @function hideAllMarkers
 * @description Hides all the markers currently being tracked by MarkerTracker from the maps they are in. Activated once the "Hide Markers" button in the UI is clicked.
 */
function hideAllMarkers() {
	var markers = markerLib.getIterator();
	for (var marker of markers) {
		marker.setMap(null);
	}
}

/**
 * @function showAllMarkers
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
 * @function deleteAllMarkers
 * @description	Deletes all the markers currently being tracked by MarkerTracker from the maps they are in. Activated once the "Delete Markers" button is clicked. 
 */
function deleteAllMarkers() {
	markerLib.reset();
	markerLabels.reset(true);
}

//Auxiliary functions 
/**
 * @function createInfoWindow
 * @description 					Creates and returns an InfoWindow object with the given parameters.
 * @param {String}	location		The location to appear in the location section of the window.
 * @param {String}	title			The title of the infoWindow. 
 * @param {Number}	markerId		The Id of the marker where to which this infoWndow is associated. 
 * @param {Number}	customMaxWidth	<b>OPTIONAL</b>, The width of the Infowindow. If not declared, uses the default value of 200px. 
 * @returns {Object}				The InfoWindow object with the given information. 
 */
function createInfoWindow(location, title, markerId, customMaxWidth) {
	let windowMaxWidth = (Number.isInteger(customMaxWidth) && customMaxWidth != null && customMaxWidth > 0 ? customMaxWidth : 200);

	return new google.maps.InfoWindow({
		content: '<div id="content">' +
			'<div id="siteNotice">' +
			'</div>' +
			'<h1 id="firstHeading" class="firstHeading">Marker Info</h1>' +
			'<div id="bodyContent">' +
			'<b>Locatoin:</b> <p>' + location + '</p>' +
			'<b>Title: </b> <p>' + title + '</p>' +
			'<button onclick="hideMarkerClickEvent()" markerid="' + markerId + '">Hide Marker</button> ' +
			'<button onclick="deleteMarkerClickEvent()" markerid="' + markerId + '">Delete Marker</button>' +
			'</div>' +
			'</div>',
		maxWidth: windowMaxWidth
	});
}

/**
 * @function createMarker
 * @description 						Creates and returns a marker with the given parameters. Depends on the global variable <code>map</code>.
 * @param	{Object}	aPosition		The Position object (containing a <code>lat</code> and <code>lng</code> properties) with the coordinates of the marker.
 * @param	{String}	aTitle			The title of the marker. 
 * @param	{Char}		aLabel			<b>OPTIONAL</b>, The label of the marker. Markers can only have labels with 1 (one) character. If it is not set, defaults to to empty <code>''</code>. 
 * @param	{Boolean}	isDraggable		<b>OPTIONAL</b>, If the marker is draggable or not. If not set, defaults to <code>false</code>. 
 * @param	{Object}	anAnimation		<b>OPTIONAL</b>, The animation of the marker when it is added to the map. If not set, defaults to <code>google.maps.Animation.DROP</code>. 
 * @returns {Object}					Returns the created marker object. 
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