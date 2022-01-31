import * as util from "./util.js";

export default class Animation {
    constructor(imgs_array, frequency = 1, scale = 1) {
        this.imgs_array = imgs_array;
        this.frequency = frequency;
        this.accumulator = 0;
        this.frame = 0;
        this.scale = scale;
        console.log(imgs_array);
    }

    setFrame(frame_index) {
        this.frame = frame_index;
        this.accumulator = 0;
        if (this.frame >= this.imgs_array.length || this.frame < 0) {
            this.frame = 0;
        }
    }

    update(dt) {
        this.accumulator += dt * this.frequency;
        while (this.accumulator > 1) {
            this.accumulator--;
            this.frame++;
            if (this.frame >= this.imgs_array.length) {
                this.frame = 0;
            }
        }
    }

    getCurrent() {
        return this.imgs_array[this.frame];
    }

    getSize() {
        let current = this.getCurrent();
        return new util.Vec2D(
            current.width * this.scale,
            current.height * this.scale);
    }
}