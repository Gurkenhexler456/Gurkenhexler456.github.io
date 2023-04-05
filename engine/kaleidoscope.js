import { gl, createContext, Shader } from './gl_util.js'
import { Vector4 } from './vec_math.js'


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




//////////////////////////////////////////////////////////////////////////////////////////////////
//                                          UTIL                                                //
//////////////////////////////////////////////////////////////////////////////////////////////////
export { Loader }

class Loader {

    static load(file_path) {


    }
}




//////////////////////////////////////////////////////////////////////////////////////////////////
//                                          MESH                                                //
//////////////////////////////////////////////////////////////////////////////////////////////////
export { Mesh, IndexedMesh, InstancedMesh }

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



//////////////////////////////////////////////////////////////////////////////////////////////////
//                                         PROGRAM                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
export { Kaleidoscope, ShaderGroup, RenderParams }

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

class RenderParams {

    constructor(ebo, primitive) {

        this.ebo = ebo;
        this.primitive = primitive;
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
        this.canvas = document.querySelector(`#${element_name}`);
        createContext(this.canvas);
        
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

    
    setClearColor(color) {

        this.clearColor = color;
    }
}




export { loadFile, gl }