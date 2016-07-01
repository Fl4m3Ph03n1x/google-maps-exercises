/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    1 Jully, 2016
 */

"use strict";

/*global PrivateNameSpace*/
/*global google*/

/**
 * @class PathDrawer
 * @classdesc Responsible for recycling DirectionsRenderer objects, and calculating which routes are the most efficient.
 * @param      {Object}    params  The objetct with the parameters this instance will use. This object can have the following properties:
 * <ul>
 *  <li><code>map</code>, the map where this PathDrawer will draw the routes;</li>
 *  <li><code>pruneLevel</code>, which defines the prunning level of the PathDrawer;</li>
 *  <li><code>polylineOptions</code>, the object with the polyline styles for the routes. This object can contain up to 4 ojects for the four different types of routes supported:
 *      <ul>
 *          <li><code>fastest</code>, google.maps.PolylineOptions for the fastest route. The fastest route is the route that takes less time to complete;</li>
 *          <li><code>shortest</code>, google.maps.PolylineOptions for the shortest route. The shortest route is the smallest in terms of distance;</li>
 *          <li><code>best</code>, google.maps.PolylineOptions for the best route. The best route is both the fastest and the shortest at the same time;</li>
 *          <li><code>alternative</code>, google.maps.PolylineOptions for an alternative route. An alternative route is a route that is not the fastest,shortest or best route. It simply is an extra route one can take.</li>
 *      </ul>
 *      All these four objects belong to the polylneOptions object and are <b>optional</b>. If ay of the objects are not defined, the default value will be used.
 *  </li>
 * </ul>
 * All these parameters are <b>optional</b>. If they are missing, the library will instead use the default parameters. 
 * @extends     PrivateNameSpace
 * 
 * @example     <caption>Creating a new PathDrawer instance</caption>
 *  var pathDrawer = new PathDrawer({
 *      map: map,
 *      pruneLevel: PathDrawer.MODERATE_PRUNNING,
 *      polylineOptions: {
 *  	    fastest: {
 *              strokeColor: "red",
 *              geodesic: true,
 *              strokeOpacity: 0.7,
 *              strokeWeight: 3
 *          },
 *          shortest: {
 *              strokeColor: "green",
 *              geodesic: true,
 *              strokeOpacity: 0.7,
 *              strokeWeight: 3
 *          },
 *          best: {
 *              strokeColor: "violet",
 *              geodesic: true,
 *              strokeOpacity: 0.8,
 *              strokeWeight: 4
 *          },
 *          alternative: {
 *              strokeColor: "blue",
 *              geodesic: true,
 *              strokeOpacity: 0.7,
 *              strokeWeight: 2
 *          }
 *  	}
 *  });
 * 
 * @see         {@link https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions|google.maps.PolylineOptions}
 */
class PathDrawer extends PrivateNameSpace {

    constructor(params) {
        super();

        super.internal(this).map = (typeof params.map == "undefined" ? null : params.map);

        super.internal(this).pruneLevels = new Map();
        super.internal(this).pruneLevels.set(2, "AGGRESSIVE_PRUNNING");
        super.internal(this).pruneLevels.set(1, "MODERATE_PRUNNING");
        super.internal(this).pruneLevels.set(0, "NO_PRUNNING");
        super.internal(this).pruneLevel = (Number.isInteger(params.pruneLevel) && super.internal(this).pruneLevels.has(params.pruneLevel) ? params.pruneLevel : this.AGGRESSIVE_PRUNNING());

        super.internal(this).defaultRoutesPolyOptions = function() {
            return {
                fastest: {
                    strokeColor: "red",
                    geodesic: true,
                    strokeOpacity: 0.7,
                    strokeWeight: 3
                },
                shortest: {
                    strokeColor: "green",
                    geodesic: true,
                    strokeOpacity: 0.7,
                    strokeWeight: 3
                },
                best: {
                    strokeColor: "violet",
                    geodesic: true,
                    strokeOpacity: 0.8,
                    strokeWeight: 4
                },
                alternative: {
                    strokeColor: "blue",
                    geodesic: true,
                    strokeOpacity: 0.7,
                    strokeWeight: 2
                }
            };
        };

        if (typeof params.polylineOptions == undefined || params.polylineOptions == null) {

            super.internal(this).routesPolylineOptions = super.internal(this).defaultRoutesPolyOptions();
        }
        else if (typeof params.polylineOptions.fastest == undefined || params.polylineOptions.fastest == null) {
            super.internal(this).routesPolylineOptions.fastest = super.internal(this).defaultRoutesPolyOptions().fastest;
        }
        else if (typeof params.polylineOptions.shortest == undefined || params.polylineOptions.shortest == null) {
            super.internal(this).routesPolylineOptions.shortest = super.internal(this).defaultRoutesPolyOptions().shortest;
        }
        else if (typeof params.polylineOptions.best == undefined || params.polylineOptions.best == null) {
            super.internal(this).routesPolylineOptions.best = super.internal(this).defaultRoutesPolyOptions().best;
        }
        else if (typeof params.polylineOptions.alternative == undefined || params.polylineOptions.alternative == null) {
            super.internal(this).routesPolylineOptions.alternative = super.internal(this).defaultRoutesPolyOptions().alternative;
        }
        else {
            super.internal(this).routesPolylineOptions = params.polylineOptions;
        }

        super.internal(this).pathsArray = [];

        super.internal(this).findShortestAndFastestRoute = function(routes) {
            let currentDist, currentDur;
            let shortestRouteIndex, fastestRouteIndex;
            let shortest, fastest;

            // //find the fastest and the shortest routes
            for (let i = 0; i < routes.length; i++) {
                currentDist = 0;
                currentDur = 0;

                for (let j = 0; j < routes[i].legs.length; j++) {
                    currentDist += routes[i].legs[j].distance.value;
                    currentDur += routes[i].legs[j].duration.value;
                }

                if (typeof shortestRouteIndex === "undefined" || shortest > currentDist) {
                    shortest = currentDist;
                    shortestRouteIndex = i;
                }

                if (typeof fastest === "undefined" || fastest > currentDur) {
                    fastest = currentDur;
                    fastestRouteIndex = i;
                }
            }

            return {
                shortestRouteIndex: shortestRouteIndex,
                fastestRouteIndex: fastestRouteIndex
            };
        };
    }

    /**
     * @description Receives the routes, calculates the shortest, fastest and best (the best route is both the shortest and fastest route at the same time. Prices and other factors are not considered) routes, and draws them in the map, with the recycling principles in mind.
     * @param       {Array}     result          The result array returned from the request.
     * @param       {Boolean}   areDraggable    If the routes drawn should be draggable or not. if <code>true</code> they will be, if <code>false</code> they will not.
     */
    drawPaths(result, areDraggable) {
        let draggable = (!areDraggable ? false : areDraggable);
        let theRoutes = result.routes;

        let efficientRoutes = super.internal(this).findShortestAndFastestRoute(result.routes);

        let routesSize = theRoutes.length;
        let sizeDif = super.internal(this).pathsArray.length - routesSize;
        let currentRenderer;

        if (sizeDif < 0) {

            for (let i = 0; i < routesSize; i++) {

                if (i >= super.internal(this).pathsArray.length) {
                    currentRenderer = new google.maps.DirectionsRenderer();
                    super.internal(this).pathsArray.push(currentRenderer);
                }
                else {
                    currentRenderer = super.internal(this).pathsArray[i];
                }

                currentRenderer.setOptions({
                    directions: result,
                    map: super.internal(this).map,
                    draggable: draggable,
                    routeIndex: i,
                    polylineOptions: super.internal(this).routesPolylineOptions.alternative
                });
            }
        }
        else if (sizeDif > 0) {

            this.prune(routesSize, super.internal(this).pruneLevel);

            for (let i = 0; i < routesSize; i++) {
                super.internal(this).pathsArray[i].setOptions({
                    directions: result,
                    map: super.internal(this).map,
                    draggable: draggable,
                    routeIndex: i,
                    polylineOptions: super.internal(this).routesPolylineOptions.alternative
                });
            }

            for (let j = routesSize; j < super.internal(this).pathsArray.length; j++) {
                super.internal(this).pathsArray[j].setMap(null);
            }
        }
        else {
            for (let k = 0; k < routesSize; k++) {
                super.internal(this).pathsArray[k].setOptions({
                    directions: result,
                    map: super.internal(this).map,
                    draggable: draggable,
                    routeIndex: k,
                    polylineOptions: super.internal(this).routesPolylineOptions.alternative
                });
            }
        }

        if (efficientRoutes.shortestRouteIndex == efficientRoutes.fastestRouteIndex)
            super.internal(this).pathsArray[efficientRoutes.shortestRouteIndex].setOptions({
                polylineOptions: super.internal(this).routesPolylineOptions.best
            });
        else {
            super.internal(this).pathsArray[efficientRoutes.shortestRouteIndex].setOptions({
                polylineOptions: super.internal(this).routesPolylineOptions.shortest
            });
            super.internal(this).pathsArray[efficientRoutes.fastestRouteIndex].setOptions({
                polylineOptions: super.internal(this).routesPolylineOptions.fastest
            });
        }
    }

    /**
     * @description Hides all the paths. Does not delete nor change them.
     */
    hidePaths() {
        super.internal(this).pathsArray.forEach(function(element) {
            element.setMap(null);
        });
    }

    /**
     * @description Shows all the paths on the map the library is tracking.
     */
    showPaths() {
        for (let i = 0; i < super.internal(this).pathsArray.length; i++) {
            super.internal(this).pathsArray[i].setMap(super.internal(this).map);
        }
    }

    /**
     * @description Resets the library, deletes all objects tracked, sets prunning back to AGGRESSIVE_PRUNNING mode and sets the polyline options back to default. The reference to the map <b>is</b> maintained.
     */
    reset() {
        super.internal(this).pathsArray = [];
        super.internal(this).pruneLevel = this.AGGRESSIVE_PRUNNING();
        super.internal(this).routesPolylineOptions = super.internal(this).defaultRoutesPolyOptions();
    }

    /**
     * @description Forces a pruning action. Shoud only be used if you feel that you want to save more memory and if know what you are doing. Advisable when using the NO_PRUNNING level, as this will be the only way to free the system for space. A good indicator to know when to use this method is to call it when we are drawing a small set of routes on the map after drawing a big set of routes. For example, if first you draw 50 routes, and then you draw 10, this is a good indicator that you should probably prune. 
     * @param       {Number}    routesSize  The size of the routes array we received from <code>result</code> object.
     * @param       {Number}    pruneLevel  The prune algorithm we wish to apply when prunning. Can be AGGRESSIVE_PRUNNING or MODERATE_PRUNNING.
     * @throws      {InvalidArgumentError}  The routeSize value is too big, meaning that the value is inconsistent and that the system has to allocate memory instead of freeing it.
     * @see         {@link http://stackoverflow.com/a/6928247/1337392|StackOverflow efficient array trimming}
     */
    prune(routesSize, pruneLevel) {

        if (routesSize >= super.internal(this).pathsArray.length)
            throw new Error("InvalidArgumentError - Impossible to prune, routesSize too big.");

        let sizeDif = super.internal(this).pathsArray.length - routesSize;

        if (pruneLevel == PathDrawer.AGGRESSIVE_PRUNNING)
            super.internal(this).pathsArray.length = routesSize;
        else if (pruneLevel == PathDrawer.MODERATE_PRUNNING)
            super.internal(this).pathsArray.length = routesSize + Math.round(sizeDif / 2);
    }

    /**
     * @description Sets the current prunning level of the library. There are three possible levels to prune: NO_PRUNNING, MODERATE_PRUNNING and AGGRESSIVE_PRUNNING.
     * @params      {Number}    newPruneLvl The new level of prunning.   
     */
    setPruneLevel(newPruneLvl) {
        super.internal(this).pruneLevel = newPruneLvl;
    }

    /**
     * @description Returns and object with the current level of prunning and a description of that level.
     * @returns     {Object}    An object with the properties <code>level</code> (Number) that represents the current prunning level, and <code>description</code> with a text representation of the prunning level.
     */
    getPruneLevel() {
        return {
            level: super.internal(this).pruneLevel,
            description: super.internal(this).pruneLevels.get(super.internal(this).pruneLevel)
        };
    }

    /**
     * @description Sets the map for the library to track.
     * @param       {Map}   map  The new map where the library will draw the routes.
     */
    setMap(newMap) {
        super.internal(this).map = newMap;
    }

    /**
     * @description Returns the current map being tracked.
     * @returns     {Map}   The map being currently tarcked by the library.
     */
    getMap() {
        return super.internal(this).map;
    }

    /**
     * @static
     * @readonly
     * @description Ultimate level of prunning. In this level, the algorithm will always delete all the objects not being used, does not cache nor reuses anything. Only keeps in memory the objects being used.
     */
    static get AGGRESSIVE_PRUNNING() {
        return 2;
    }

    /**
     * @static
     * @readonly
     * @description Moderate level of prunning. In this level the system trims to half the unused space, allowing for a balance between memory and speed. This way, when a bigger requets is made, the system only has to re-create less objects, and when a smaller request is made, it frees 50% of the memory being used to prepare for further requests.
     */
    static get MODERATE_PRUNNING() {
        return 1;
    }

    /**
     * @static
     * @readonly
     * @description Lowest level of prunning. In this level, the system never frees or deletes objects, and will always keep them for future use. One should pay attention because if no prunning is ever done, the space in memory occupied will always be the space of the biggest request.
     */
    static get NO_PRUNNING() {
        return 0;
    }
}