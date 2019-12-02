var canvas = undefined;
var image = undefined;

function initColorPicker() {
    canvas = document.createElement('canvas');
    image = document.getElementById('CameraStream');
    canvas.width = image.width;
    canvas.height = image.height;
}

function colorPickerClick(event, currentFunction, currentRange) {
    let rect = image.getBoundingClientRect();
    let x = Math.round(event.clientX - rect.left);
    let y = Math.round(event.clientY - rect.top);
    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height);
    let pixelData = context.getImageData(x, y, 1, 1).data;
    if (currentFunction !== undefined) {
        return currentFunction(pixelData, currentRange);
    }
}


function eyeDrop(pixel) {
    let hsv = RGBtoHSV(pixel);
    let range = createRange([hsv]);
    range = widenRange(range);
    return range
}

function expand(pixel, currentRange) {

    let hsv = RGBtoHSV(pixel);
    let widenHSV = widenRange([[].concat(hsv), hsv]);
    return createRange(currentRange.concat(widenHSV));
}

function shrink(pixel, currentRange) {
    let hsv = RGBtoHSV(pixel);
    let widenHSV = widenRange([[].concat(hsv), hsv]);

    if (!shrinkRange(currentRange, widenHSV[0]))
        shrinkRange(currentRange, widenHSV[1]);
    return currentRange
}

function RGBtoHSV(numbers) {
    let r = numbers[0],
        g = numbers[1],
        b = numbers[2];
    r = r / 255;
    g = g / 255;
    b = b / 255;
    let minRGB = Math.min(r, Math.min(g, b));
    let maxRGB = Math.max(r, Math.max(g, b));
    let d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r);
    let h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5);
    let H = 30 * (h - d / (maxRGB - minRGB));
    let S = 255 * (maxRGB - minRGB) / maxRGB;
    let V = 255 * maxRGB;
    if (isNaN(H))
        H = 0;
    if (isNaN(S))
        S = 0;
    if (isNaN(V))
        V = 0;
    return [Math.round(H), Math.round(S), Math.round(V)];
}

function createRange(HSVColors) {
    let range = [[], []];
    for (var i = 0; i < 3; i++) {
        range[0][i] = HSVColors[0][i];
        range[1][i] = HSVColors[0][i];
        for (var j = HSVColors.length - 1; j >= 0; j--) {
            range[0][i] = Math.min(HSVColors[j][i], range[0][i]);
            range[1][i] = Math.max(HSVColors[j][i], range[1][i]);
        }
    }
    return range;//[[Hmin,Smin,Vmin],[Hmax,Smax,Vmax]]
}

function widenRange(range) {
    let expanded = [[], []];
    for (let i = 0; i < 3; i++) {
        //Expanding the range by 10
        expanded[0][i] = Math.max(0, range[0][i] - 10);
        expanded[1][i] = Math.min(255, range[1][i] + 10);
    }
    expanded[1][0] = Math.min(180, expanded[1][0]);//h is up to 180
    return expanded;
}

function shrinkRange(range, color) {
    let inside = true;
    for (let i = 0; i < color.length && inside; i++) {
        if (!(range[0][i] <= color[i] <= range[1][i]))
            inside = false;
    }
    if (inside) {
        for (let j = 0; j < color.length; j++) {
            if (color[j] - range[0][j] < range[1][j] - color[j])
                range[0][j] = Math.min(range[0][j] + 10, range[1][j]);//shrink from min side
            else
                range[1][j] = Math.max(range[1][j] - 10, range[0][j]);//shrink from max side

        }
    }
    return inside;//returns if color is inside or not
}


export default {initColorPicker, colorPickerClick, eyeDrop, expand, shrink}