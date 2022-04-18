/**
 * @author Collin Jones
 * @description Convert between PAI to string, compressed string, png, etc.
 * @version 2022.3.22
 */

// Import modules
import * as fs from 'fs';
import Jimp from 'jimp/es';
import { compress, decompress } from 'brotli';

// Import rgb <-> hex converters
import { rgbToHex, hexToRgb } from './modules/hexRgb';

// Import Seperator constants
import { Seperator } from './constants';

// Typescript interfaces

// Seperators
interface Seperators {
  pixel: string;
  line: string;
  size: string;
  multiLine: string;
}

// Options for PAI Strings
interface PaiStringOptions {
  seperators: Seperators;
}

// Compression Quality Options
interface PaiCompressOptions {
  quality: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
}
// Options for PAI Conversion
interface PaiOptions extends PaiStringOptions, PaiCompressOptions {
  writeToFile?: boolean;
  fileName?: string;
}

// RGB interface
interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert an image to a PAI string
 * @param image Image location
 * @param options PAI options
 * @returns PAI string
 */
export async function toPaiString(
  image: string,
  options: PaiStringOptions = {
    seperators: {
      pixel: Seperator.PIXEL,
      line: Seperator.LINE,
      size: Seperator.SIZE,
      multiLine: Seperator.MULTI_LINE,
    },
  }
) {
  // Deconstruct seperators from options
  let { seperators } = options;

  // Create lines array
  let lines: string[] = [];
  let imgString = '';
  // Get data from an image using Jimp
  let imageData = await Jimp.read(image);

  // Find width and height of an image
  let width = imageData.getWidth();
  let height = imageData.getHeight();

  // Last pixel object: used for compression
  let lastPixel: RGB | null = null;
  let pixelSize = -1;

  // Loop through each row of the image
  for (let y = 0; y < height; y++) {
    // Create a line object
    let line = '';
    // Loop through each column of the row
    for (let x = 0; x <= width; x++) {
      // Get the pixel at the current x, y, and convert it's int color value to an RGB object
      let pixel = imageData.getPixelColor(x, y);
      let pInfo = intToRGBA(pixel);

      // Add 1 to the pixel size
      pixelSize++;

      // If the pixel is the first pixel of the row, set the current pixel to the last pixel
      if (lastPixel === null) {
        lastPixel = pInfo;
      } else {
        // If the pixel is not the first pixel of the row, check if the pixel is the same as the last pixel
        if (
          lastPixel.r !== pInfo.r ||
          lastPixel.g !== pInfo.g ||
          lastPixel.b !== pInfo.b
        ) {
          // If the pixel is not the same as the last pixel, add the pixel row to the line
          let hexCode = rgbToHex(lastPixel.r, lastPixel.g, lastPixel.b);
          line += `${hexCode}${seperators.size}${pixelSize}${seperators.pixel}`;
          pixelSize = 0;
          lastPixel = pInfo;
        }
      }
    }
    // If there is a lastPixel, add it to the line
    if (lastPixel !== null) {
      let hexCode = rgbToHex(lastPixel.r, lastPixel.g, lastPixel.b);
      line += `${hexCode}${seperators.size}${pixelSize}`;
      // Reset lastPixel & pixelSize
      pixelSize = -1;
      lastPixel = null;
    }

    // Add the current line to the lines array
    lines.push(line);
  }

  // Line compression helpers
  let lastLine = '';
  let lineSize = 1;

  // Loop through each line
  for (let i = 0; i <= lines.length; i++) {
    // If there isnt a lastLine, set it to the current line, and continue
    if (!lines[i - 1]) {
      lastLine = lines[i];
      continue;
    }

    // Otherwise, check if the current line is the same as the last line
    if (lines[i] == lastLine) {
      // If the lines are the same, add 1 to the line size
      lineSize++;
    } else {
      // If the lines are not the same, add the line and lineSize to the imgString
      if (lineSize > 1) {
        imgString += `${lastLine}${seperators.multiLine}${lineSize}${seperators.line}`;
      } else {
        imgString += `${lastLine}${seperators.line}`;
      }
      lineSize = 1;
      lastLine = lines[i];
    }
  }

  // Remove the last character from the imgString as it is useless
  imgString = imgString.substring(0, imgString.length - 1);

  // Return the image as a PAI string
  return imgString;
}

/**
 * Compress a PAI string using brotli
 * @param str PAI string
 * @param options PAI Compression options
 * @returns Compressed PAI string
 */
export async function compressPaiString(
  str: string,
  options: PaiCompressOptions = {
    quality: 11,
  }
) {
  // Deconstruct quality from options
  let { quality } = options;

  // Convert the string to a buffer then compress it
  let compressed = compress(Buffer.from(str), {
    quality,
  });

  // Return the compressed string
  return compressed;
}

/**
 *
 * @param image Image location
 * @param options PAI options
 * @returns the compressed PAI String if writeToFile is false
 */
export async function toPaiImage(
  image: string,
  options: PaiOptions = {
    seperators: {
      pixel: Seperator.PIXEL,
      line: Seperator.LINE,
      size: Seperator.SIZE,
      multiLine: Seperator.MULTI_LINE,
    },
    quality: 11,
    writeToFile: false,
  },
  onStart?: () => void,
  onEnd?: () => void
): Promise<Uint8Array | null> {
  if (onStart) {
    onStart();
  }

  // Convert the image to a PAI string
  let paiString = await toPaiString(image, options);

  // Compress the PAI string
  let compressed = await compressPaiString(paiString, options);

  // If writeToFile is true, write the compressed PAI string to a file
  if (options.writeToFile) {
    // Check if a file name was provided
    if (!options.fileName) {
      throw new Error('No file name specified');
    }

    // Write the compressed PAI string to a file
    fs.writeFileSync(options.fileName, compressed);

    // Stop, do not return anything
    if (onEnd) {
      onEnd();
    }
    return null;
  }

  if (onEnd) {
    onEnd();
  }
  // Otherwise, return the compressed PAI string
  return compressed;
}

// Save a PAI String to a file (this is not used anymore, was previously used for testing)
export function savePaiImage(str: string, fileName: string) {
  fs.writeFileSync(fileName, str);
}

/**
 * Convert a PAI string to a png image
 * @param paiImage PAI image location
 * @param dir Output directory
 * @param onStart method for when the conversion starts
 * @param onEnd method for when the conversion ends
 * @returns Nothing
 */
export async function paiToImage(
  paiImage: string,
  dir: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (onStart) {
    onStart();
  }

  let imgString = '';

  // Decompress and decode the PAI Image
  imgString = new TextDecoder().decode(decompress(fs.readFileSync(paiImage)));

  // Split the imgString into lines
  let tlines: string[] | any = imgString.split(Seperator.LINE);

  let lines: string[] | any = [];

  // Loop through each line
  for (let i = 0; i < tlines.length; i++) {
    // Split duplicate lines with 'x'
    let tline = tlines[i].split('x');
    // Split pixels
    let pixels = tline[0].split(Seperator.PIXEL);

    // Loop pixels
    for (let j = 0; j < pixels.length; j++) {
      // Reconstruct pixels
      let pixel = pixels[j].split(Seperator.SIZE);
      let color = hexToRgb(pixel[0]);

      if (color) {
        let nPixel = {
          hex: Jimp.rgbaToInt(color.r, color.g, color.b, 255),
          size: parseInt(pixel[1]),
        };

        pixels[j] = nPixel;
      }
    }

    // tlines[i] = pixels;
    if (tline.length > 1) {
      for (let j = 0; j < parseInt(tline[1]); j++) {
        lines.push(pixels);
      }
    } else {
      lines.push(pixels);
    }
  }
  let height = lines.length;
  let width = 0;
  for (let i of lines[0]) {
    width += i.size;
  }

  let image = await new Jimp(width, height, async function (
    err: any,
    image: {
      setPixelColor: (arg0: any, arg1: any, arg2: any) => void;
      write: (arg0: string, arg1: (err: any) => void) => void;
    }
  ) {
    if (err) throw err;

    let x = 0;
    let y = 0;
    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < lines[i].length; j++) {
        let pixel = lines[i][j];

        for (let k = 0; k < pixel.size; k++) {
          image.setPixelColor(pixel.hex, x, y);
          x++;
        }
      }
      x = 0;
      y++;
    }

    await image.write(dir, (err: any) => {
      if (err) throw err;
    });
  });

  if (onEnd) {
    onEnd();
  }
  return;
}

function intToRGBA(i: number) {
  var rgba = {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  };
  rgba.r = Math.floor(i / Math.pow(256, 3));
  rgba.g = Math.floor((i - rgba.r * Math.pow(256, 3)) / Math.pow(256, 2));
  rgba.b = Math.floor(
    (i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2)) /
      Math.pow(256, 1)
  );
  rgba.a = Math.floor(
    (i -
      rgba.r * Math.pow(256, 3) -
      rgba.g * Math.pow(256, 2) -
      rgba.b * Math.pow(256, 1)) /
      Math.pow(256, 0)
  );

  return rgba;
}
