import { Kaleidoscope } from '../../engine/kaleidoscope.js'
import { Vector4 } from '../../engine/vec_math.js';

/**
 * @type {Kaleidoscope}
 */
let kaleidoscope;

const update = () => {

    kaleidoscope.render();

    requestAnimationFrame(update);
}


window.onload = () => {

    kaleidoscope = new Kaleidoscope('app-canvas', false);

    let clearColor = new Vector4();
    clearColor.x = 0.0;
    clearColor.y = 0.5;
    clearColor.z = 0.75;
    clearColor.w = 1.0;

    kaleidoscope.setClearColor(clearColor);


    requestAnimationFrame(update);
}