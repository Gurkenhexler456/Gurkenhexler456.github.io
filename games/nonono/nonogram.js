window.onload = main

let kaleidoscope;
let mousePos = { 
    x: 0.0, 
    y: 0.0,
    x_pixel: 0.0,
    y_pixel: 0.0
};


// quad
let vertices = new Float32Array([
    -0.5,   -0.5,   -2.0,        0.0,    0.0,        0.0,    0.0,    1.0,
     0.5,   -0.5,   -2.0,        1.0,    0.0,        0.0,    0.0,    1.0,
     0.5,    0.5,   -2.0,        1.0,    1.0,        0.0,    0.0,    1.0,
    -0.5,    0.5,   -2.0,        0.0,    1.0,        0.0,    0.0,    1.0
]);

let indices = new Int32Array([
    0, 1, 2,
    2, 3, 0
]);

// field
let tilePositions;
let tileColors;
let colorBuffer;


// cursor
let cursor_indices = new Int32Array([
    0, 1, 
    1, 2,
    2, 3,
    3, 0
]);


// lines
let lineData = new Float32Array([
    0.5,    1,     0,          1,  0,  0,
    0.5,   -1,     0,          1,  0,  0,
    1,      0.5,   0,          0,  1,  0,
   -1,      0.5,   0,          0,  1,  0
]);

let lineIndices = new Int32Array([
   0, 1,
   2, 3
]);


let nonogram = { width: 0, height: 0 }
let selectedTile = -1;

/**
 * @type {InstancedMesh}
 */
let quad;
/**
 * @type {Matrix4}
 */
let model;

/**
 * @type {IndexedMesh}
 */
let cursorMesh;
/**
 * @type {Matrix4}
 */
let cursor_Model;
/**
 * @type {Shader}
 */
let cursorShader;
/**
 * @type {Vector4}
 */
let cursorColor;

/**
 * @type {Shader}
 */
let shader;



/**
 * @type {IndexedMesh}
 */
let lineMesh;

let panel = {

    x_min: -16,
    x_max: 16,

    y_min: -9,
    y_max: 9
};




class Nonogram {
    
    constructor(width, height, data) {

        this.width = width;
        this.height = height;
        this.data = data;
    }
}




function updateCursor() {

    let pos = scaleNDC(panel);
    let x = Math.round(pos.x);
    let y = Math.round(pos.y);
    let tilePos = new Vector4().set(x, y, 0.0, 1.0);

    if(x >= 0 && x < nonogram.width &&
        y >= 0 && y < nonogram.height) {
           
        selectedTile = y * nonogram.width + x;
        cursor_Model.translate(tilePos);  
    }
    else {

        selectedTile = -1;
        cursor_Model.translate(pos);
    }
}




function loop() {

    updateCursor();

    lineData[0]     = mousePos.x;
    lineData[6]     = mousePos.x;
    lineData[13]    = mousePos.y;
    lineData[19]    = mousePos.y;

    lineMesh.bind();
    lineMesh.updateData(lineData);

    quad.bind();
    quad.preparations.push(() => {

        quad.updateInstancedDataOnBuffer(colorBuffer, tileColors);
        shader.use();
        shader.setMatrix4("u_Model", model);
    });

    cursorMesh.bind
    cursorMesh.preparations.push(()  => {

        cursorShader.use();
        cursorShader.setMatrix4("u_Model", cursor_Model);
    });


    kaleidoscope.render();
    requestAnimationFrame(loop)
}




function scaleNDC(rect){

    let result = new Vector4();

    let width = rect.x_max - rect.x_min;
    let height = rect.y_max - rect.y_min;
    result.x = rect.x_min + ((mousePos.x + 1) * 0.5 * width);
    result.y = rect.y_min + ((mousePos.y + 1) * 0.5 * height);

    return result;
}




/**
 * 
 * @param {PointerEvent} event 
 */
function updatePosition(event) {

    /** @type {HTMLCanvasElement} */
    let canvas = event.target;
    let canvasWidth = canvas.clientWidth;
    let canvasHeight = canvas.clientHeight;
    mousePos.x_pixel = event.clientX - canvas.offsetLeft;
    mousePos.y_pixel = event.clientY - canvas.offsetTop;

    //console.log(`${canvasWidth} - ${canvasHeight} | ${event.clientX} - ${event.clientY} | ${canvas.offsetLeft} - ${canvas.offsetTop}`);

    mousePos.x = (mousePos.x_pixel - (canvasWidth * 0.5)) / (canvasWidth * 0.5)
    mousePos.y = -(mousePos.y_pixel - (canvasHeight * 0.5)) / (canvasHeight * 0.5);

    //console.log(`${mousePos.x} - ${mousePos.y}`);
}




/**
 * 
 * @param {PointerEvent} event 
 */
function pointerMove(event) {

    updatePosition(event);
}




/**
 * 
 * @param {PointerEvent} event 
 */
function pointerDown(event) {

    event.preventDefault();

    updatePosition(event);

    if(selectedTile >= 0) {

        console.log(`Tile ${selectedTile} selected`);
        if(event.button == 0) {

            //tileColors[2 * selectedTile] = 1;
            tileColors[2 * selectedTile + 1] = 1;
        }
        else if(event.button == 2) {

            tileColors[2 * selectedTile + 1] = 1;
        }
    }

}




function main () {

    nonogram = { width: 8, height: 8};

    let clearColor = new Vector4();
    clearColor.set(0.0, 0.5, 0.75, 1.0);

    let tileCount = nonogram.width * nonogram.height;
    tilePositions = new Float32Array(tileCount * 3);
    tileColors = new Int32Array(tileCount * 2);
    for(let y = 0; y < nonogram.height; y++) {

        for(let x = 0; x < nonogram.width; x++) {

            let index = y * nonogram.width + x;
            tilePositions[3 * index]        = x;
            tilePositions[3 * index + 1]    = y;
            tilePositions[3 * index + 2]    = 0;

            tileColors[2 * index] = (x + y) % 8;
            tileColors[2 * index + 1] = 0;
        }
    }

    kaleidoscope = new Kaleidoscope("game-canvas", true);

    // camera?
    let projection = new Matrix4();
    projection.ortho(panel.x_min, panel.x_max, panel.y_min, panel.y_max, 0.1, 10);


    // field
    model = new Matrix4();

    quad = new InstancedMesh(tileCount);
    quad.setData(vertices, [
        {index: 0, size: 3, type: gl.FLOAT, normalized: false, stride: 32, offset: 0},
        {index: 1, size: 2, type: gl.FLOAT, normalized: false, stride: 32, offset: 12},
        {index: 2, size: 3, type: gl.FLOAT, normalized: false, stride: 32, offset: 20},
    ]);
    quad.setInstanceData(tilePositions, [
        {index: 3, size: 3, type: gl.FLOAT, normalized: false, stride: 0, offset: 0, divisor: 1}
    ]);
    colorBuffer = quad.addInstanceData(tileColors, [
        {index: 4, size: 1, type: gl.UNSIGNED_INT, normalized: false, stride: 8, offset: 0, divisor: 1},
        {index: 5, size: 1, type: gl.INT, normalized: false, stride: 8, offset: 4, divisor: 1}
    ]);
    quad.setIndices(indices);

    // field shader
    shader = new Shader();
    shader.addShader(gl.VERTEX_SHADER, loadFile("resources/field.vs"));
    shader.addShader(gl.FRAGMENT_SHADER, loadFile("resources/field.fs"));
    shader.linkProgram();

    shader.use();
    shader.setMatrix4("u_Model", model);
    shader.setMatrix4("u_Projection", projection);
    shader.setVector4("u_ColorMap[0]" , new Vector4().set(0, 0, 0, 0));
    shader.setVector4("u_ColorMap[1]" , new Vector4().set(0, 0, 1, 0));
    shader.setVector4("u_ColorMap[2]" , new Vector4().set(0, 1, 0, 0));
    shader.setVector4("u_ColorMap[3]" , new Vector4().set(0, 1, 1, 0));

    shader.setVector4("u_ColorMap[4]" , new Vector4().set(1, 0, 0, 1));
    shader.setVector4("u_ColorMap[5]" , new Vector4().set(1, 0, 1, 1));
    shader.setVector4("u_ColorMap[6]" , new Vector4().set(1, 1, 0, 1));
    shader.setVector4("u_ColorMap[7]" , new Vector4().set(1, 1, 1, 1));



    // cursor
    cursor_Model = new Matrix4();
    cursorColor = new Vector4();

    cursorMesh = new IndexedMesh(tileCount);
    cursorMesh._primitive = gl.LINES;
    cursorMesh.setData(vertices, [
        {index: 0, size: 3, type: gl.FLOAT, normalized: false, stride: 32, offset: 0},
        {index: 1, size: 2, type: gl.FLOAT, normalized: false, stride: 32, offset: 12},
        {index: 2, size: 3, type: gl.FLOAT, normalized: false, stride: 32, offset: 20},
    ]);
    cursorMesh.setIndices(cursor_indices);

    // cursor shader
    cursorShader = new Shader();
    cursorShader.addShader(gl.VERTEX_SHADER, loadFile("resources/cursor.vs"));
    cursorShader.addShader(gl.FRAGMENT_SHADER, loadFile("resources/cursor.fs"));
    cursorShader.linkProgram();

    cursorShader.use();
    cursorShader.setVector4("u_Color", cursorColor);
    cursorShader.setMatrix4("u_Model", cursor_Model);
    cursorShader.setMatrix4("u_Projection", projection);



    // cursor line
    lineMesh = new IndexedMesh();
    lineMesh.primitive = gl.LINES;
    lineMesh.usage = gl.DYNAMIC_DRAW;
    lineMesh.setData(lineData, [
        {index: 0, size: 3, type: gl.FLOAT, normalized: false, stride: 24, offset: 0},
        {index: 1, size: 3, type: gl.FLOAT, normalized: false, stride: 24, offset: 12},
    ]);
    lineMesh.setIndices(lineIndices);

    // line shader
    let lineShader = new Shader();
    lineShader.addShader(gl.VERTEX_SHADER, loadFile("resources/passThrough.vs"));
    lineShader.addShader(gl.FRAGMENT_SHADER, loadFile("resources/passThrough.fs"));
    lineShader.linkProgram();



    kaleidoscope.setClearColor(clearColor);
    kaleidoscope.scene.push(new ShaderGroup(shader, [quad]));
    kaleidoscope.scene.push(new ShaderGroup(cursorShader, [cursorMesh]));
    kaleidoscope.scene.push(new ShaderGroup(lineShader, [lineMesh]));

    kaleidoscope.canvas.contextmenu
    kaleidoscope.canvas.onpointermove = pointerMove;
    kaleidoscope.canvas.onpointerdown = pointerDown;

    requestAnimationFrame(loop);
}