export class Vec2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static fromAngle(angle) {
        return new Vec2D(Math.cos(angle), Math.sin(angle));
    }

    normSqr() {
        return this.x * this.x + this.y * this.y;
    }

    norm() {
        return Math.sqrt(this.normSqr());
    }

    normaliseInPlace() {
        let norm = this.norm();
        if (norm > 0) {
            this.x /= norm;
            this.y /= norm;
        }
    }

    normalise() {
        let norm = this.norm();
        if (norm > 0) {
            return new Vec2D(this.x / norm, this.y / norm);
        } else {
            return new Vec2D(this.x, this.y);
        }
    }

    add(other) {
        return new Vec2D(this.x + other.x, this.y + other.y);
    }

    addInPlace(other) {
        this.x += other.x;
        this.y += other.y;
    }

    sub(other) {
        return new Vec2D(this.x - other.x, this.y - other.y);
    }

    subInPlace(other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    mul(scalar) {
        return new Vec2D(this.x * scalar, this.y * scalar);
    }

    mulInPlace(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    div(scalar) {
        return new Vec2D(this.x / scalar, this.y / scalar);
    }

    divInPlace(scalar) {
        this.x /= scalar;
        this.y /= scalar;
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }
}

export function clone(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj)
}