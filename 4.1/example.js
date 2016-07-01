/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    30 May, 2016
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

	// This event listener calls addMarker() when the map is clicked.
	google.maps.event.addListener(map, 'click', function(event) {

		var newMarker = new google.maps.Marker({
			position: event.latLng,
			map: map,
			draggable: true,
			animation: google.maps.Animation.DROP,
			label: markerLabels.nextSymbol(),
			title: "Marker Number " + markerLib.getIdCounter
		});

		markerLib.trackMarker(newMarker);


		var infoWindow = new google.maps.InfoWindow({
			content: '<div id="content">' +
				'<div id="siteNotice">' +
				'</div>' +
				'<h1 id="firstHeading" class="firstHeading">Marker Info</h1>' +
				'<div id="bodyContent">' +
				'<b>Locatoin:</b> <p>' + newMarker.getPosition() + '</p>' +
				'<b>Title: </b> <p>' + newMarker.getTitle() + '</p>' +
				'<button onclick="hideMarkerClickEvent()" markerid="' + markerLib.getMarkerId(newMarker) + '">Hide Marker</button> ' +
				'<button onclick="deleteMarkerClickEvent()" markerid="' + markerLib.getMarkerId(newMarker) + '">Delete Marker</button>' +
				'</div>' +
				'</div>',
			maxWidth: 200
		});
		
		//we memorize if the marker is bouncing or not in our object because 
		//when we hide the marker all information about animations is lost!
		//But no problem, our lib can take care of that!
		var infoObj = {infoWindow: infoWindow, isBouncing: false}
		
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
function hideAllMarkers(){
	var markers = markerLib.getIterator();
	for(var marker of markers){
		marker.setMap(null);
	}
}

/**
 * @function showAllMarkers
 * @description Shows all the markers currently tracked by MarkerTracker that are hidden and restores their animations. Activated once the "Show all Markers" button in the UI is clicked.
 */
function showAllMarkers(){
	var markers = markerLib.getIterator();
	for(var marker of markers){
		marker.setMap(map);
		
		if(markerLib.getMarkerInfo(marker).isBouncing)
			marker.setAnimation(google.maps.Animation.BOUNCE);
	}
		
}

/**
 * @function deleteAllMarkers
 * @description Deletes all the markers currently being tracked by MarkerTracker from the maps they are in. Activated once the "Delete Markers" button is clicked. 
 */
function deleteAllMarkers(){
	markerLib.reset();
	markerLabels.reset(true);
}