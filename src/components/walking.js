import ComponentBase from "./componentbase.js";

export default class WalkingComponent extends ComponentBase {
    get componentName() { return "walking"; }

    constructor() {
        super();
        this.acceleration = 30;
        this.maxSpeed = 2.5;
    }

    setWalkingParameters(acceleration, maxSpeed) {
        this.acceleration = acceleration;
        this.maxSpeed = maxSpeed;
        return this;
    }

    walkInDirection(directionVec, multiplier = 1) {
        const entity = this.entity;
        if (entity.z > 0) {
            return;
        }
        entity.vel.addInPlace(
            directionVec.normalise().mul(this.acceleration).mul(multiplier));
        let velNorm = entity.vel.norm();
        if (velNorm > this.maxSpeed) {
            entity.vel.mulInPlace(this.maxSpeed / velNorm);
        }
    }
}