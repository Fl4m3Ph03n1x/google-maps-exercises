/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    30 June, 2016
 */

'use strict';

/*global google*/
/*global MarkerTracker*/
/*global MarkerLabelLib*/
/*global PathDrawer*/

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
 * @description Instance of the PathDrawerLib, needed to keep track of the drawned paths in order to keep recycling them.
 */
var pathDrawer;

/**
 * @const
 * @type		{Number}
 * @default
 * @description	Default zoom level used in in the start of the map.
 */
const INITIAL_ZOOM = 7;

/**
 * @const
 * @type		{Location}
 * @default
 * @description	Portugal's location in latitude and longitude.
 */
const PORTUGAL_LOC = {
	lat: 39.39987199999999,
	lng: -8.224454
};

/**
 * @function initMap
 * @description Initializes the and the libraries.
 */
function initMap() {
	markerLib = new MarkerTracker();
	markerLabels = new MarkerLabelLib(MarkerLabelLib.GREEK_ALPHABET, true);

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: INITIAL_ZOOM,
		center: PORTUGAL_LOC
	});

	pathDrawer = new PathDrawer({
		map: map,
		pruneLevel: PathDrawer.MODERATE_PRUNNING
	});

	initSearchBoxes(map);
}

//searchbox
/**
 * @function	initSearchBox
 * @description Function containing the initilization of the searchbox together with the listeners it uses.
 */
function initSearchBoxes() {
	// Create the search box and link it to the UI element.
	let startInput = document.getElementById('start-input');
	let startSearchBox = new google.maps.places.SearchBox(startInput);

	let endInput = document.getElementById('end-input');
	let endSearchBox = new google.maps.places.SearchBox(endInput);

	let directionsService = new google.maps.DirectionsService();

	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		startSearchBox.setBounds(map.getBounds());
		endSearchBox.setBounds(map.getBounds());
	});

	startSearchBox.addListener('places_changed', function() {
		pathDrawer.hidePaths();
		deleteAllMarkers();

		let places = startSearchBox.getPlaces();
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

	endSearchBox.addListener('places_changed', function() {
		pathDrawer.hidePaths();
		deleteAllMarkers();

		let request = {
			origin: startInput.value,
			destination: endInput.value,
			travelMode: google.maps.TravelMode.DRIVING,
			unitSystem: google.maps.UnitSystem.METRIC,
			provideRouteAlternatives: true,
			avoidHighways: false,
			avoidTolls: false
		};

		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK)
				pathDrawer.drawPaths(result);
		});
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

/**
 * @function	deleteAllMarkers
 * @description	Deletes all the markers currently being tracked by MarkerTracker from the maps they are in. Activated once the "Delete Markers" button is clicked. 
 */
function deleteAllMarkers() {
	markerLib.reset();
	markerLabels.reset(true);
}