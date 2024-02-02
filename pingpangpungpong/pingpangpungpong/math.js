export class Vec3 {

    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }


    // vector operations
    add_vector(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    }

    sub_vector(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
    }

    mult_vector(other) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
    }

    div_vector(other) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;
    }


    // scalar operations
    add_scalar(scalar) {
        this.x += scalar;
        this.y += scalar;
        this.z += scalar;
    }

    sub_scalar(scalar) {
        this.x -= scalar;
        this.y -= scalar;
        this.z -= scalar;
    }

    mult_scalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    div_scalar(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
    }

    // other operations
    magnitude_sqr() {
        return this.dot(this);
    }

    magnitude() {
        return Math.sqrt(this.magnitude_sqr());
    }

    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }


    static normalize(v) {
        let n = new Vec3(v.x, v.y, v.z);
        n.div_scalar(v.magnitude());
        return n;
    }

    static from(v) {
        return new Vec3(v.x, v.y, v.z);
    }

    static abs(v) {
        return new Vec3(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
    }
}