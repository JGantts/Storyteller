

function getSortedId(idA: string, idB: string) {
    if (idA > idB) {
        return "" + idA + "-" + idB;
    } else {
        return "" + idB + "-" + idA;
    }
}

/**
 * Checks if two points are equal, allowing for floating-point error
 * @param a
 * @param b
 * @param error floating point error tolerance
 */
export function pointsEqual(a: SimplePoint, b: SimplePoint, error: number = 0.001): boolean {
    return Math.abs(a.x - b.x) < error && Math.abs(a.y - b.y) < error;
}

/**
 * Checks that one number is between two other numbers. Check can be inclusive if boolean is set
 * @param a
 * @param min
 * @param max
 * @param inclusive
 */
export function isBetween(a:number, min: number, max: number, inclusive: boolean = false) {
    if (inclusive) {
        return a >= min && a <= max;
    } else {
        return a > min && a < max;
    }
}

/**
 * Convert HSL color values to RGB
 * @param hue
 * @param saturation
 * @param luminosity
 */
function hslToRgb(hue: number, saturation: number, luminosity: number){
    let red, green, blue;
    
    if (saturation == 0) {
        red = green = blue = luminosity; // achromatic
    } else {
        let hue2rgb = (p: number, q: number, t: number) => {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        
        let q = luminosity < 0.5 ? luminosity * (1 + saturation) : luminosity + saturation - luminosity * saturation;
        let p = 2 * luminosity - q;
        red = hue2rgb(p, q, hue + 1/3);
        green = hue2rgb(p, q, hue);
        blue = hue2rgb(p, q, hue - 1/3);
    }
    
    return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
}

/**
 * Get door color based on permeability
 * @param permeability
 * @param maxHue
 * @param minHue
 */
function getDoorPermeabilityColor(permeability: number, maxHue = 120, minHue = 0): string {
    // if (permeability < 0) {
    //     return 'rgb(005, 170, 255)';
    // } else if (permeability === 0) {
    //     return 'rgb(228, 000, 107)';
    // } else if (permeability < 100) {
    //     return 'rgb(207, 140, 003)';
    // } else if (permeability === 100) {
    //     return 'rgb(172, 255, 083)';
    // }
    if (permeability < 0) {
        return 'rgb(005, 170, 255)';
    }
    const hue = (permeability / 100) * (maxHue - minHue) + minHue;
    // const [red, green, blue] = hslToRgb(hue, 100, 50);
    // return `rgb(${red}, ${green}, ${blue})`;
    return `hsl(${hue}, 100%, 50%)`;
}

module.exports = {
    common: {
        getSortedId,
    },
    getDoorPermeabilityColor,
    isBetween,
    pointsEqual
}
