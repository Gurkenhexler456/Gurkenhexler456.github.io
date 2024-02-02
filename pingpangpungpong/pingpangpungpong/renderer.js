import {FIELD} from "./constants.js";


/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {number} type 
 * @param {string} source 
 */
function loadShader(gl, type, source) {

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(status == false) {
        throw new Error(`compile error: ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
}


export class Renderer {
    
    static MIN_RADIUS = 3;

    constructor(canvas_name) {

        /**
         * @type {HTMLCanvasElement}
         */
        this.canvas = document.getElementById(canvas_name);

        /**
         * @type {WebGL2RenderingContext}
         */
        this.gl = this.canvas.getContext("webgl2");

        this.update_canvas();

        screen.orientation.addEventListener("change", (event) => {
            this.update_canvas();
        });


        this.angle_offset = 0.;
        this.radius = Renderer.MIN_RADIUS;
    }

    init() {

        // Player Shader
        this.player_shader = this.gl.createProgram();

        let player_vertex = loadShader(this.gl, this.gl.VERTEX_SHADER,
        `#version 300 es
        layout (location = 0) in vec2 in_Position;

        uniform mat4 u_Projection;
        uniform mat4 u_Model;
        
        void main() {
            gl_Position = u_Projection * u_Model * vec4(in_Position, 0., 1.);
        }`);
        this.gl.attachShader(this.player_shader, player_vertex);

        let player_fragment = loadShader(this.gl, this.gl.FRAGMENT_SHADER,
        `#version 300 es
        precision highp float;
        
        out vec4 out_Color;

        uniform vec3 u_Color;
        
        void main() {
            vec3 col = u_Color;

            float gamma = 2.2;
            vec3 corrected = pow(col, vec3(1. / gamma));
            out_Color = vec4(corrected, 1.);
        }`);
        this.gl.attachShader(this.player_shader, player_fragment);

        this.gl.linkProgram(this.player_shader);

        // Bby Shader
        this.bby_shader = this.gl.createProgram();

        let bby_vertex = loadShader(this.gl, this.gl.VERTEX_SHADER,
        `#version 300 es
        layout (location = 0) in vec2 in_Position;

        uniform mat4 u_Projection;
        uniform vec2 u_Gustav_Pos;

        uniform float u_angle_offset;
        uniform float u_angle_increment;
        uniform float u_radius;

        vec2 calculate_offset() {
            float a = u_angle_offset + u_angle_increment * float(gl_InstanceID);
            vec2 offset = vec2(cos(a), sin(a)) * u_radius;
            return offset;
        }

        void main() {
            vec2 offset = calculate_offset();
            vec2 bby_position = offset + u_Gustav_Pos;
            bby_position = clamp(bby_position, vec2(-8.5, -17.5), vec2(8.5, 17.5));

            vec2 final_pos = in_Position + bby_position;

            gl_Position = u_Projection * vec4(final_pos, -.5, 1.);
        }`);
        this.gl.attachShader(this.bby_shader, bby_vertex);
        this.gl.attachShader(this.bby_shader, player_fragment);

        this.gl.linkProgram(this.bby_shader);

        // Line Shader
        this.line_shader = this.gl.createProgram();

        let line_vertex = loadShader(this.gl, this.gl.VERTEX_SHADER,
        `#version 300 es
        layout (location = 0) in vec2 in_Position;

        uniform mat4 u_Projection;
        uniform float u_line_length;
        uniform float u_line_y;
        
        void main() {
            vec2 pos = in_Position;
            pos.x *= u_line_length;
            pos.y += u_line_y;

            gl_Position = u_Projection * vec4(pos, 0.5, 1.);
        }`);
        this.gl.attachShader(this.line_shader, line_vertex);
        this.gl.attachShader(this.line_shader, player_fragment);

        this.gl.linkProgram(this.line_shader);

        // Score Shader
        this.score_shader = this.gl.createProgram();

        let score_vertex = loadShader(this.gl, this.gl.VERTEX_SHADER,
        `#version 300 es
        layout (location = 0) in vec2 in_Position;

        uniform mat4 u_Projection;
        uniform float u_Scale;
        uniform float u_Step_X;
        uniform float u_Height;
        
        void main() {
            vec2 pos = in_Position * u_Step_X * u_Scale;
            pos.x += float(gl_InstanceID) * u_Step_X - 8.5;
            pos.y += u_Height;


            gl_Position = u_Projection * vec4(pos, 0.5, 1.);
        }`);
        this.gl.attachShader(this.score_shader, score_vertex);
        this.gl.attachShader(this.score_shader, player_fragment);

        this.gl.linkProgram(this.score_shader);





        // player vao
        this.player_vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.player_vao);

        this.quad_vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quad_vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, QUAD_DATA, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);

        this.quad_ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quad_ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, QUAD_INDICES, this.gl.STATIC_DRAW);


        // player vao
        this.line_vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.line_vao);

        this.line_vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.line_vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, LINE_DATA, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);

        this.line_ebo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.line_ebo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, LINE_INDICES, this.gl.STATIC_DRAW);
    }

    update_projection() {
        this.x_scale = 1. / FIELD.width;
        this.y_scale = 1. / (FIELD.width * this.ratio);

        const w = this.x_scale;
        const h = this.y_scale;

        // matrices
        this.projection = new Float32Array([
            w,  0,  0,  0,
            0,  h,  0,  0,
            0,  0,  1,  0,
            0,  0,  0,  1
        ]);
    }

    update_angle(delta) {
        this.angle_offset += delta;
    }

    update_radius(delta) {
        this.radius -= delta;
        this.radius = this.radius <= 3. ? 3. : this.radius;
    }

    screen_to_world_position(x, y) {

        const ndc = {
            x: (x / this.canvas.width) * 2. - 1.,
            y: (y / this.canvas.height) * 2. - 1.
        }

        return {
            x: ndc.x / this.x_scale,
            y: -ndc.y / this.y_scale
        };
    }

    update_canvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ratio = this.canvas.height / this.canvas.width;

        this.update_projection();
    }


    render_rect(model, color={x: .9, y: .9, z: .9}) {

        // Render Player and Gustav
        this.gl.useProgram(this.player_shader);

        let projection_loc = this.gl.getUniformLocation(this.player_shader, "u_Projection");
        let model_loc = this.gl.getUniformLocation(this.player_shader, "u_Model");
        this.gl.uniformMatrix4fv(projection_loc, false, this.projection);
        this.gl.uniformMatrix4fv(model_loc, false, model);

        let color_loc = this.gl.getUniformLocation(this.player_shader, "u_Color");
        this.gl.uniform3f(color_loc, color.x, color.y, color.z);

        this.gl.bindVertexArray(this.player_vao);
        this.gl.enableVertexAttribArray(0);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quad_ebo);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);
    }

    render_bby(position, color={x: .6, y: .6, z: .6}) {

        // Render Bby Gustavs
        this.gl.useProgram(this.bby_shader);

        let projection_loc = this.gl.getUniformLocation(this.bby_shader, "u_Projection");
        let gustav_pos = this.gl.getUniformLocation(this.bby_shader, "u_Gustav_Pos");
        this.gl.uniformMatrix4fv(projection_loc, false, this.projection);
        this.gl.uniform2f(gustav_pos, position.x, position.y);

        let angle_off_loc = this.gl.getUniformLocation(this.bby_shader, "u_angle_offset");
        let angle_inc_loc = this.gl.getUniformLocation(this.bby_shader, "u_angle_increment");
        let radius_loc = this.gl.getUniformLocation(this.bby_shader, "u_radius");
        this.gl.uniform1f(angle_inc_loc, 2 * Math.PI / 10.);
        this.gl.uniform1f(angle_off_loc, this.angle_offset);
        this.gl.uniform1f(radius_loc, this.radius);


        let color_loc = this.gl.getUniformLocation(this.bby_shader, "u_Color");
        this.gl.uniform3f(color_loc, color.x, color.y, color.z);
        
        this.gl.bindVertexArray(this.player_vao);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quad_ebo);

        this.gl.drawElementsInstanced(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0, 10);
    }


    render_line(height, color={x: .6, y: .6, z: .6}) {

        // Render Bby Gustavs
        this.gl.useProgram(this.line_shader);

        let projection_loc = this.gl.getUniformLocation(this.line_shader, "u_Projection");
        this.gl.uniformMatrix4fv(projection_loc, false, this.projection);

        let line_length = this.gl.getUniformLocation(this.line_shader, "u_line_length");
        this.gl.uniform1f(line_length, FIELD.width);
        let line_y = this.gl.getUniformLocation(this.line_shader, "u_line_y");
        this.gl.uniform1f(line_y, height);


        let color_loc = this.gl.getUniformLocation(this.line_shader, "u_Color");
        this.gl.uniform3f(color_loc, color.x, color.y, color.z);


        this.gl.bindVertexArray(this.line_vao);
        this.gl.enableVertexAttribArray(0);

        this.gl.drawArrays(this.gl.LINES, 0, 2);
    }


    render_score(height, score, color={x: .6, y: .6, z: .6}) {

        // Render Bby Gustavs
        this.gl.useProgram(this.score_shader);

        let projection_loc = this.gl.getUniformLocation(this.score_shader, "u_Projection");
        this.gl.uniformMatrix4fv(projection_loc, false, this.projection);

        let scale = this.gl.getUniformLocation(this.score_shader, "u_Scale");
        this.gl.uniform1f(scale, .5);
        let step_x = this.gl.getUniformLocation(this.score_shader, "u_Step_X");
        this.gl.uniform1f(step_x, 1);
        let height_loc = this.gl.getUniformLocation(this.score_shader, "u_Height");
        this.gl.uniform1f(height_loc, height);


        let color_loc = this.gl.getUniformLocation(this.score_shader, "u_Color");
        this.gl.uniform3f(color_loc, color.x, color.y, color.z);


        this.gl.bindVertexArray(this.player_vao);
        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quad_ebo);

        this.gl.drawElementsInstanced(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0, score);
    }





    clear() {

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.2, 0.2, 0.2, 1.);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    cleanup() {

        this.gl.deleteProgram(this.player_shader);
        this.gl.deleteProgram(this.bby_shader);
        this.gl.deleteProgram(this.line_shader);
        this.gl.deleteProgram(this.score_shader);

        this.gl.deleteBuffer(this.quad_vbo);
        this.gl.deleteBuffer(this.quad_ebo);
        this.gl.deleteBuffer(this.line_vbo);
        this.gl.deleteBuffer(this.line_ebo);

        this.gl.deleteVertexArray(this.player_vao);
        this.gl.deleteVertexArray(this.line_vao);
    }
}


const LINE_DATA = new Float32Array([
     1.,    0.,
    -1.,    0.
]);

const LINE_INDICES = new Float32Array([
    0, 1
]);


const QUAD_DATA = new Float32Array([
    -.5,    -.5,
     .5,    -.5,
     .5,     .5,
    -.5,     .5
]);

const QUAD_INDICES = new Int32Array([
    0, 1, 2,
    2, 3, 0
]);