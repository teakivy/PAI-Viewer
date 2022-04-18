/**
 * @author Collin Jones
 * @description Convert a hex string to an rgb object and vice versa
 * @version 2022.3.22
 */

/**
 * Convert a component to a hex string
 * @param c Component
 * @returns Hex String
 */
function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

/**
 * Convert an rgb object to a hex string
 * @param r Red
 * @param g Green
 * @param b Blue
 * @returns Hex String
 */
function rgbToHex(r: number, g: number, b: number) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Convert a hex string to an rgb object
 * @param hex Hex String
 * @returns RGB Object
 */
function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Export methods
export { rgbToHex, hexToRgb };
