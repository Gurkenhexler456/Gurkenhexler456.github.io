/**
 * @type {WebGL2RenderingContext}
 */
let gl;

/**
 * @param {HTMLCanvasElement} canvas the canvas element
 * @returns {WebGL2RenderingContext} the gl context
 */
function createContext(canvas) {

    gl = canvas.getContext('webgl2');
    return gl;
}


/**
 * Shader class
 */
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


export { gl, createContext, GLBuffer, IndexBuffer, Shader }