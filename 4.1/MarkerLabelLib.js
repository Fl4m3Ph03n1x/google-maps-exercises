/**
 * @author  Pedro Miguel Pereira Serrano Martins
 * @version 1.0.0
 * @date    30 May, 2016
 */

'use strict';

/*global PrivateNameSpace*/

/**
 * @clas MarkerLabelLib
 * @classdesc Used to represent and manage labels for the markers in Google Maps JavaScript API. This library has a set of common alphabets you can use, stored in UTF-8 format, so it is advised that if you use this script to have proper UTF-8 support in your code.
 * @extends PrivateNameSpace
 */
class MarkerLabelLib extends PrivateNameSpace{
    
    /**
     * @constructs MarkerLabelLib
     * @description Creates a MarkerLabelLib object with the given alphabet and a boolean to decide if the library should reuse deleted labels or not. The user can either provide one the alphabets present in this library, or something else, as long as it is an array of charaters.
     * @param {Array} alphabet Array containing the alphabet to be used. 
     * @param {boolean} recycleSymbols Defines if the library should reuse deleted labels or not.
     */
    constructor(alphabet, recycleSymbols) {
        super();
        super.internal(this).alphabet = alphabet;
        super.internal(this).index = 0;
        super.internal(this).recyclingEnabled = recycleSymbols;
        super.internal(this).recycleBin = [];
    }

    /**
     * @description Frees the given symbol (aka label), putting it in the reusable list of symbols. If you opted by not recycling the symbols you should not need to use this method, but if you use it be aware that the library will always track the symbols you free in case later on you change your mind and decide to enable the symbol recycling feature.
     * @param symbol The symbol to be recycled.
     */
    recycleSymbol(symbol) {
        super.internal(this).recycleBin.push(symbol);
    }

    /**
     * @description Returns the next symbol available in the collection. If symbol recycling is enabled, it will priotize the last symbol put in the recycling bin instead, until all deleted symbols are reused. Once it empties the recycle bin, it starts using the collection again where it left it the last time.
     * @returns {String} The next character (aka, symbol, label) of the collection, or from the recycle bin if the recycling feature is enabled.
     */
    nextSymbol() {
        if (super.internal(this).recyclingEnabled && super.internal(this).recycleBin.length != 0)
            return super.internal(this).recycleBin.pop() + "";
        else
            return super.internal(this).alphabet[super.internal(this).index++ % super.internal(this).alphabet.length] + "";
    }

    /**
     * @description Resets the collection to the first symbol and if <code>emptyRecycleBin</code> is set to <code>true</code> it empties the recycle bin, othwerwise it does not affect it.
     * @param {boolean} emptyRecycleBin If <code>true</code>, empties the recycle bin, otherwise keeps it intact.
     * @see nextSymbol
     */
    reset(emptyRecycleBin) {
        super.internal(this).index = 0;

        if (emptyRecycleBin)
            this.emptyRecycleBin();
    }

    /**
     * @description Empties the list of recorded deleted symbols.
     */
    emptyRecycleBin() {
        super.internal(this).recycleBin = [];
    }

    /**
     * @description Enables or disables the recycling of symbols depending on the given value of <code>state</code>. Note that disabling the recycling of symbols will not empty the recycle bin.
     * @param {boolean} state If <code>true</code>, enables recycling, if <code>false</code>, disables it.
     */
    set setRecycling(state) {
        super.internal(this).recyclingEnabled = state;
    }

    /**
     * @description Returns the current state of the recycling feature.
     * @returns {boolean} The current state of the recycling feature.
     */
    get isRecyclingOn() {
        return super.internal(this).recyclingEnabled;
    }

    /**
     * @static
     * @readonly
     * @description Characters of the basic latin alphabet in upper case, enconded in UTF-8.
     * @see {@link http://www.utf8-chartable.de/unicode-utf8-table.pl|chartable}
     */
    static get LATIN_ALPHABET() {
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    }

    /**
     * @static
     * @readonly
     * @description Characters of the arabic numeric alphabet enconded in UTF-8.
     * @see {@link http://www.utf8-chartable.de/unicode-utf8-table.pl|chartable}
     */
    static get NUMERIC_ALPHABET() {
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }

    /**
     * @static
     * @readonly
     * @description Characters of the basic arabic alphabet enconded in UTF-8.
     * @see {@link http://www.utf8-chartable.de/unicode-utf8-table.pl|chartable}
     */
    static get ARABIC_ALPHABET() {
        return ['ؠ', 'ء', 'آ', 'أ', 'ؤ', 'إ', 'ئ', 'ا', 'ب', 'ة', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ػ', 'ؼ', 'ؽ', 'ؾ', 'ؿ', 'ـ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ى', 'ي'];
    }

    /**
     * @static
     * @readonly
     * @description Characters of the basic greek alphabet enconded in UTF-8.
     * @see {@link http://www.utf8-chartable.de/unicode-utf8-table.pl|chartable}
     */
    static get GREEK_ALPHABET() {
        return ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', '΢', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'];
    }
}