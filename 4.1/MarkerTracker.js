/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    30 May, 2016
 */
 
'use strict';

/*global PrivateNameSpace*/

/**
 * @class MarkerTracker
 * @classdesc Used to manage markers and their properties in Google Maps JavaScript API. This library tracks markers and any additional information you may want to associate with them, such as infoWindows or others. It also allows the user to associate listeners, easing their use.
 * @extends PrivateNameSpace
 */
class MarkerTracker extends PrivateNameSpace{


    /** @constructs MarkerTracker */
    constructor() {
        super();
        super.internal(this).markers = new Map();
        super.internal(this).lastMarkerUsed = null;
        super.internal(this).markerIdCounter = 0;
        super.internal(this).markerIds = new Map();
    }
    
    /**
     * @description Tracks the given marker. 
     * @param {Object} marker  The marker to be tracked.
     * @returns {boolean} <code>true</code> if the given marker was successfully added and is being tracked, or <code>false</code> otherwise.
     */
    trackMarker(marker) {
        if (super.internal(this).markers.has(marker))
            return false;

        marker.lib = this;
        super.internal(this).markerIds.set(super.internal(this).markerIdCounter, marker);
        super.internal(this).markers.set(marker, {
            id: super.internal(this).markerIdCounter,
            info: null
        });
        super.internal(this).markerIdCounter++;

        return true;
    }
    
    /**
     * @description Associates the given information object with the given marker. Information objects can be anything the user wants.
     * @param {Object} marker The marker to associate with the information.
     * @param {Object} newInfo The information to be associated with the marker.
     * @returns {boolean} <code>true</code> if the association was successfl, <code>false</code> otherwise.
     */
    setMarkerInfo(marker, newInfo) {
        if (!super.internal(this).markers.has(marker))
            return false;

        super.internal(this).markers.set(marker, {
            id: this.getMarkerId(marker),
            info: newInfo
        });

        return true;
    }
    
    /**
     * @description Associates a listener with the given marker. 
     * @param {Object} marker The marker object to receive the listener.
     * @param {String} eventType The event type of the listener function. Can be any of the UI events listed in the official documentation.
     * @param {Function} listenerFunction
     * @returns {boolean} <code>true</code> if the association was successfl, <code>false</code> otherwise.
     * @see {@link https://developers.google.com/maps/documentation/javascript/events#EventsOverview|Marker Events (UI Events)}
     */
    setMarkerListener(marker, eventType, listenerFunction) {
        if (!super.internal(this).markers.has(marker))
            return false;

        marker.addListener(eventType, function() {
            this.lib.lastMarkerUsed = this;
            listenerFunction();
        });

        return true;
    }
    
    /**
     * @description Returns the information associated with the given marker.
     * @param {Object} marker The marker whose information we want.
     * @returns {Object} The information associated with the object. 
     */
    getMarkerInfo(marker) {
        return super.internal(this).markers.get(marker).info;
    }

    /**
     * @description Returns the marker with the given TrackerId.
     * @param {Number} id The TrackerId of the marker.
     * @returns {Object} The marker with the given Id or null if it does not exist.
     */
    getMarkerById(id) {
        return super.internal(this).markerIds.get(+id);
    }
    
    /**
     * @description Returns the TrackerId of the given marker.
     * @param {Object} marker The marker we want to get the Id from.
     * @returns {Number} The Tracker Id of the given marker, or null if it does not exist.
     */
    getMarkerId(marker) {
        return +super.internal(this).markers.get(marker).id;
    }
    
    /**
     * @description Removes the given marker from the tracking system. Any information objects associated with it are discarded. Animations and listeners bound to the marker are still kept. 
     * @param {Object} marker The marker to be removed from the system.
     */
    untrackMarker(marker) {
        marker.lib = null;
        let tmpId = super.internal(this).markers.get(marker).id;
        super.internal(this).markers.delete(marker);
        super.internal(this).markerIds.delete(tmpId);
    }
    
    /**
     * @description Removes the marker with the given TrackerId from the system. Any information objects associated with it are discarded. Animations and listeners bound to the marker are still kept. 
     * @param {Number} id The TrackerId of the marker to be removed.
     */
    untrackMarkerById(id) {
        let marker = super.internal(this).markerIds.get(+id);
        super.internal(this).markerIds.delete(+id);
        marker.lib = null;
        super.internal(this).markers.delete(marker);
        marker.setMap(null);
    }
    
    /**
     * @description Resets the system, untracking all currently tracked markers and removing them from the maps they are in. 
     */
    reset() {
        super.internal(this).markers.forEach(function iterate(value, key, map) {
            key.lib = null;
            key.setMap(null);
        });

        super.internal(this).markers.clear();
        super.internal(this).lastMarkerUsed = null;
        super.internal(this).markerIdCounter = 0;
        super.internal(this).markerIds.clear();
    }

    /**
     * @description Returns an iterator with all the markers being tracked by the system. 
     * @returns {Object} An iterator of the markers being tracked.
     */
    getIterator() {
        return super.internal(this).markers.keys();
    }

    /**
     * @description Returns the numbre of markers currently being tracked by the system. 
     * @returns {Number} The number of markers currently being tracked by the system.
     */
    get getMarkersCount() {
        return super.internal(this).markers.size;
    }
    
    /**
     * @description Returns the last marker with which an user has interacted with. Interactions are the UI Events accessible with associating a linstener with a marker. 
     * @returns {Object} The last marker that suffered an interaction (such as a click or a mouse hover) from the user.
     *  @see {@link https://developers.google.com/maps/documentation/javascript/events#EventsOverview|Marker Events (UI Events)}
     */
    get getLastMarkerUsed() {
        return super.internal(this).lastMarkerUsed;
    }
    
    /**
     * @description Returns the last TrackerId used for a marker. TrackerIds are unique and never repeat, even when the markers using them are removed from the system. TrackerIds are no recyclable and thus can also be used as marker global identifiers.
     * @returns {Number} The last TrackerId used for a marker.
     */
    get getIdCounter() {
        return super.internal(this).markerIdCounter;
    }
}
