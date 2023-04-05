export { Vector3, Vector4, Matrix4, toRadians }

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