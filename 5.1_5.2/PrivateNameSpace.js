/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    30 May, 2016
 */

'use strict';

/**
 * @class PrivateNameSpace
 * @classdesc Class used to simulate private variables in objects in JavaScript. This class must be extended in order to be used. Classes extending this will be able to have private variables and will be tracked.
 * @see {@link https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Contributor_s_Guide/Private_Properties|Private variables in JavaScript MDN}
 */
class PrivateNameSpace {

    /** @constructs PrivateNameSpace */
    constructor() {
        this._namespacemap = new WeakMap();
    }
    
    /**
     * @description Keeps track of each object and its private variables.
     * @param {Object} object The object to track.
     * @returns {Object} The tracked object with its private variables. 
     * @example <caption>Usage of internal from PrivateNameSpace</caption>
     * //class Point extends PrivateNameSpace{
     * //    
     * //   constructor(x, y){
     * //       super();     
     * //       super.internal(this).x = x;
     * //       super.internal(this).y = y;
     * //   }
     * //  
     * //   //Repeat for y
     * //   get getX(){
     * //       return super.internal(this).x; 
     * //   }
     * //
     * //   //Repeat for y
     * //   set setX(newX){
     * //       super.internal(this).x = newX; 
     * //   }
     * //}
     */
    internal(object) {
        if (!this._namespacemap.has(object))
            this._namespacemap.set(object, {});
        return this._namespacemap.get(object);
    }
}