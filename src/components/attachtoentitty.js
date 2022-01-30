import ComponentBase from "./componentbase.js";
import * as util from "./../util.js";

export default class AttachToEntityComponent extends ComponentBase {
    static get name() { return "attachToEntity"; }

    constructor() {
        super();
        this.target = null;
        this.relPos = new util.Vec2D();
    }

    setTarget(target) {
        this.target = target;
        return this;
    }

    setRelativePosition(value) {
        this.relPos = value;
        return this;
    }

    onUpdate(dt) {
        const entity = this.entity;
        entity.pos = this.target.pos.add(this.relPos);
        entity.z = this.target.z;
    }
}