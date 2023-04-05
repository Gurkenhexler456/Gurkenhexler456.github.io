window.onload = main;

/** @type {Kaleidoscope} */
let kaleidoscope;

let baseRectIndices = new Int32Array([
    0, 1, 2,
    2, 3, 0
]);

let baseRectData = new Float32Array([

    -1, -1,  1,
     1, -1,  1,
     1,  1,  1,
    -1,  1,  1

]);

/** @type {Shader} */
let baseShader;


function loop() {


    kaleidoscope.render();
    requestAnimationFrame(loop);
}

function main() {


    let clearColor = new Vector4();
    clearColor.set(0.0, 0.5, 0.75, 1.0);


    kaleidoscope = new Kaleidoscope('game-canvas', true);
    kaleidoscope.setClearColor(clearColor);

    shader = new Shader();
    shader.addShader(gl.VERTEX_SHADER, loadFile(''));

    requestAnimationFrame(loop);
}