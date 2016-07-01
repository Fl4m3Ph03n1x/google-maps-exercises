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
 * @const
 * @type		{Number}
 * @default
 * @description	Default zoom level used in in the start of the map.
 */
const INITIAL_ZOOM = 4;

/**
 * @const
 * @type		{Location}
 * @default
 * @description	Australia's location in latitude and longitude.
 */
const AUSTRALIA_LOC = {lat: -25.363, lng: 131.044};

/**
 * @function initMap
 * @description Initializes the and the libraries.
 */
function initMap() {

	markerLib = new MarkerTracker();
	markerLabels = new MarkerLabelLib(MarkerLabelLib.GREEK_ALPHABET, true);

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: INITIAL_ZOOM,
		center: AUSTRALIA_LOC
	});
	
	initSearchBox(map);
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

//searchbox
/**
 * @function	initSearchBox
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

//Auxiliary functions 

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

