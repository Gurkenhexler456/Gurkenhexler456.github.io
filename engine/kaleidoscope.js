/** @type {WebGL2RenderingContext} */
let gl;

/**
 * 
 * @param {string} file_path 
 * @returns the contents of the file as text
 */
function loadFile(file_path) {

    let result = '';
    let req = new XMLHttpRequest();
    req.open('GET', file_path, false);
    req.on
    req.send();
    if(req.status == 200) {
        result = req.responseText;
    }
    else {
        console.log(`${req.status} unable to load ${file_path}`);
    }
    return result;
}

function toRadians(angle) {

    return angle * (180 / Math.PI);
}



class Vector3 {

    constructor() {

        this.data = new Float32Array(3);
    }

    get x() { return this.data[0] }
    set x(value) {  this.data[0] = value }

    get y() { return this.data[1] }
    set y(value) {  this.data[1] = value }

    get z() { return this.data[2] }
    set z(value) {  this.data[2] = value }
}

class Vector4 extends Vector3 {

    constructor() {

        super();
        this.data = new Float32Array(4);
    }

    get w() { return this.data[3] }
    set w(value) {  this.data[3] = value }

    set(x, y, z, w) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    }
}



class Matrix4 {

    constructor() {

        this.data = new Float32Array(16);
        this.identity();
    }


    identity() {

        this.data.set([
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            0,  0,  0,  1
        ]);
    }


    /**
     * 
     * @param {number} left
     * @param {number} right  
     * @param {number} bottom 
     * @param {number} top 
     * @param {number} near 
     * @param {number} far 
     */
    ortho(left, right, bottom, top, near, far) {

        let xDiff = right - left;
        let yDiff = top - bottom;
        let zDiff = far - near;

        this.data.set([
            2 / xDiff,                  0,                          0,                          0,
            0,                          2 / yDiff,                  0,                          0,
            0,                          0,                          -2 / zDiff,                 0,
            -(right + left) / xDiff,    -(top + bottom) / yDiff,    -(far + near) / zDiff,      1
        ]);
    }


    perspective(fov, aspect, near, far) {

        let tan_fov = Math.tan(fov / 2);
        let zDiff = far - near;

        this.data.set([
            1 / tan_fov,    0,                          0,                              0,
            0,              aspect * (1 / tan_fov),     0,                              0,
            0,              0,                          (far + near) / zDiff,          -1,
            0,              0,                          (2 * far * near) / zDiff,       0
        ]);
    }

    /**
     * 
     * @param {Vector4} vec4 
     * @returns {Vector4}
     */
    dot(vec4) {

        let result = new Vector4();
        for(let row = 0; row < 4; row++) {

            let product = 0;
            for(let col = 0; col < 4; col++) {

                let index = (row * 4) + col;
                product += this.data[index] * vec4.data[col];
            }

            result.data[row] = product
        }

        return result;
    }

    /**
     * 
     * @param {Vector4} vec4 
     */
    translate(vec4) {


        this.data[12]   = vec4.x;
        this.data[13]   = vec4.y;
        this.data[14]   = vec4.z;
    }
}



class Loader {

    static load(file_path) {


    }
}



class Shader {

    constructor() {

        this.programID = gl.createProgram();
        this.shaders = [];
    }


    /**
     * 
     * @param {number} type 
     * @param {string} source 
     * @returns 
     */
    addShader(type, source) {

        let shaderID = gl.createShader(type);
        gl.shaderSource(shaderID, source);
        gl.compileShader(shaderID);
        if(gl.getShaderParameter(shaderID, gl.COMPILE_STATUS) != true) {

            throw new Error("shader compilation failed:\n" + gl.getShaderInfoLog(shaderID));
        }
        gl.attachShader(this.programID, shaderID);
        this.shaders.push(shaderID);
    }


    linkProgram() {

        gl.linkProgram(this.programID);
        if(gl.getProgramParameter(this.programID, gl.LINK_STATUS) != true) {

            throw new Error("linking shader program failed:\n" + gl.getProgramInfoLog(shaderID));
        }
    }


    getAttribLocation(name) {

        let loc = gl.getAttribLocation(this.programID, name);
        return loc;
    }


    /**
     * 
     * @param {string} name 
     * @returns {WebGLUniformLocation}
     */
    getUniformLocation(name) {

        let loc = gl.getUniformLocation(this.programID, name);
        return loc;
    }


    /**
     * 
     * @param {string} name 
     * @param {Matrix4} matrix 
     */
    setMatrix4(name, matrix) {

        let loc = this.getUniformLocation(name);
        gl.uniformMatrix4fv(loc, false, matrix.data);
    }

    /**
     * 
     * @param {string} name 
     * @param {Matrix4} vector 
     */
    setVector4(name, vector) {

        let loc = this.getUniformLocation(name);
        gl.uniform4fv(loc, vector.data);
    }


    setFloat(name, value) {

        let loc = this.getUniformLocation(name);
        gl.uniform1f(loc, value);
    }


    use() {

        gl.useProgram(this.programID);
    }
}

class RenderParams {

    constructor(ebo, primitive) {

        this.ebo = ebo;
        this.primitive = primitive;
    }
}


class GLBuffer {

    constructor(target, usage) {

        this.name = gl.createBuffer();
        this.usage = usage;
        this.target = target;
    }

    initBuffer(data) {

        this.data = data;
        this.bind();
        gl.bufferData(this.target, data, this.usage);
    }

    updateBuffer(data) {

        this.data = data;
        this.bind();
        gl.bufferSubData(this.target, 0, this.data);
    }

    bind() {
        gl.bindBuffer(this.target, this.name);
    }
}

class IndexBuffer extends GLBuffer {

    constructor(usage) {

        super(gl.ELEMENT_ARRAY_BUFFER, usage);
    }

    initBuffer(data) {


    }
}

class Mesh {

    constructor() {

        /** @type {WebGLVertexArrayObject} */
        this.vao = gl.createVertexArray();

        /** @type {Float32Array} */
        this.data = [];

        /** @type {any[]} */
        this.attribs = [];

        /** @type {number} */
        this._primitive = gl.TRIANGLES;

        /** @type {number} */
        this._usage = gl.STATIC_DRAW;

        /** @type {RenderParams[]} */
        this.indexBuffers = [];

        this.preparations = [];
    }

    addIndexBuffer(buffer) {

        this.indexBuffers.push(buffer);
    }


    /**
     * 
     * @param {Float32Array} data 
     * @param {any[]} attribs 
     */
    setData(data, attribs) {

        this.data = data;
        this.attribs = this.attribs.concat(attribs);
        gl.bindVertexArray(this.vao);
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, this.usage);
        attribs.forEach((elem) => {
            gl.vertexAttribPointer(elem.index, elem.size, elem.type, elem.normalized, elem.stride, elem.offset);
        });
    }

    prepare() {

        for(const prepStep of this.preparations) {

            prepStep();
        }

        this.preparations = [];
    }


    /**
     * 
     * @param {Float32Array} data 
     */
    updateData(data) {

        this.data = data;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
    }

    
    set primitive(prim) {
        this._primitive = prim;
    }

    get primitive() {
        return this._primitive;
    }


    set usage(usage) {
        this._usage = usage;
    }

    get usage() {
        return this._usage;
    }

    bind() {

        gl.bindVertexArray(this.vao);
        this.attribs.forEach((elem) => {
            gl.enableVertexAttribArray(elem.index);
        });
    }





    /**
     * 
     * @param {WebGLBuffer} ebo 
     */
    renderIndices(ebo) {
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.drawElements(param.primitive, 6, );
    }
}

class IndexedMesh extends Mesh {

    constructor() {

        super();
        /** @type {int[]} */
        this.indices = [];
    }

    /**
     * 
     * @param {Int32Array} indices 
     */
    setIndices(indices) {

        this.indices = indices;
        this.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, this.usage);
    }

    bind() {

        super.bind();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    }

    render() {

        this.bind();
        this.prepare();
        gl.drawElements(this.primitive, this.getVertexCount(), gl.UNSIGNED_INT, 0);
    }

    /**
     * 
     * @returns the length of the index buffer
     */
    getVertexCount() {

        return this.indices.length;
    }
}



class InstancedMesh extends IndexedMesh {

    constructor(instanceCount) {

        super();
        /** @type {int[]} */
        this.instanceData = [];
        this.instanceCount = instanceCount;
        /** @type {GLBuffer[]} */
        this.buffers = [];
    }

    /**
     * 
     * @param {Float32Array} indices 
     */
    setInstanceData(instanceData, attribs) {

        this.instanceData = instanceData;
        this.attribs = this.attribs.concat(attribs);
        gl.bindVertexArray(this.vao);
        this.instance_vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instance_vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.instanceData, this.usage);
        attribs.forEach((elem) => {
            gl.vertexAttribPointer(elem.index, elem.size, elem.type, elem.normalized, elem.stride, elem.offset);
            if('divisor' in elem){
                gl.vertexAttribDivisor(elem.index, elem.divisor);
            }
        });
    }


    /**
     * 
     * @param {Float32Array} indices 
     */
    addInstanceData(instanceData, attribs) {

        this.attribs = this.attribs.concat(attribs);
        gl.bindVertexArray(this.vao);
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, instanceData, this.usage);
        attribs.forEach((elem) => {
            if(elem.type == gl.UNSIGNED_INT || elem.type == gl.INT) {
                gl.vertexAttribIPointer(elem.index, elem.size, elem.type, elem.stride, elem.offset);
            }
            else {
                gl.vertexAttribPointer(elem.index, elem.size, elem.type, elem.normalized, elem.stride, elem.offset);
            }
            if('divisor' in elem){
                gl.vertexAttribDivisor(elem.index, elem.divisor);
            }
        });

        this.buffers.push(vbo);
        return vbo;
    }


    /**
     * 
     * @param {Float32Array} indices 
     */
    updateInstancedData(instanceData) {

        this.instanceData = instanceData;
        gl.bindVertexArray(this.vao);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instance_vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.instanceData);
    }


    /**
     * 
     * @param {WebGLBuffer} buffer
     * @param {Float32Array} indices 
     */
    updateInstancedDataOnBuffer(buffer, instanceData) {

        gl.bindVertexArray(this.vao);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceData);
    }




    bind() {

        super.bind();
        this.attribs.forEach((elem) => {
            gl.enableVertexAttribArray(elem.index);
        });
    }

    render() {

        this.bind();
        this.prepare();
        gl.drawElementsInstanced(this.primitive, this.getVertexCount(), gl.UNSIGNED_INT, 0, this.instanceCount);
    }
}


class ShaderGroup {

    /**
     * 
     * @param {Shader} shader 
     */
    constructor(shader, models) {

        this.shader = shader;
        this.models = models;
    }

    addModel(model) {

        this.models.push(model);
    }
}


class Kaleidoscope {

    /**
     * 
     * @param {string} element_name 
     * @param {boolean} fullscreen
     */
    constructor(element_name, fullscreen) {

        /** @type {HTMLCanvasElement} */
        this.canvas = this.createContext(element_name);
        
        if(fullscreen) {
        
            this.resizeCanvas(this.canvas);
        }

        /** @type {ShaderGroup[]} */
        this.scene = [];
        /** @type {Vector4} */
        this.clearColor = new Vector4();
    }

    /**
     * 
     * @param {Shader} shader 
     * @param {IndexedMesh} mesh 
     */
    render() {

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(this.clearColor.x, this.clearColor.y, this.clearColor.z, this.clearColor.w);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for(const currentGroup of this.scene) {

            currentGroup.shader.use();
            for(const mesh of currentGroup.models) {

                mesh.render();
            }
        }
    }

    resizeCanvas(canvas) {

        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if(canvas.width != displayWidth || canvas.height != displayHeight) {

            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
    }

    createContext(element_name) {

        let canvas = document.querySelector(`#${element_name}`);
        gl = canvas.getContext('webgl2');
        return canvas;
    }

    setClearColor(color) {

        this.clearColor = color;
    }
}