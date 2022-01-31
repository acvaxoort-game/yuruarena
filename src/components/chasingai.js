import ComponentBase from "./componentbase.js";
import * as util from "./../util.js";

export default class ChasingAIComponent extends ComponentBase {
    get componentName() { return "chasingAI"; }

    constructor() {
        super();
        this.target = null;
        this.targetChangeDelay = 0;
        this.waypoint = null;
        this.waypointChangeDelay = 0;
        this.desiredDistance = 1;
    }

    onUpdate(dt) {
        const entity = this.entity;
        if (this.target && !this.target.world) {
            this.target = null;
            this.targetChangeDelay = 0;
            this.waypoint = null;
        }
        if (this.targetChangeDelay > 0) {
            this.targetChangeDelay -= dt;
        } else {
            this.targetChangeDelay = 1 + Math.random() * 1;
            this.target = entity.getClosestEnemy();
        }
        if (this.waypointChangeDelay > 0) {
            if (this.waypoint) {
                this.waypointChangeDelay -= dt;
            } else {
                this.waypointChangeDelay -= 2 * dt;
            }
        } else {
            this.waypointChangeDelay = 0.15 + Math.random() * 0.15;
            if (this.target) {
                let targetAngle = entity.pos.sub(this.target.pos).angle();
                targetAngle += (Math.random() * 2 - 1) * Math.PI * 0.25;
                this.waypoint = this.target.pos.add(util.Vec2D.fromAngle(targetAngle).mul(this.desiredDistance));            
            }
        }
        if (this.waypoint) {
            const difference = this.waypoint.sub(entity.pos);
            const dist = difference.norm();
            if (dist < 0.25) {
                this.waypoint = null;
            } else {
                entity.components.walking.walkInDirection(difference, dt);
            }
        }
    }

    onDraw(layers) {
        const entity = this.entity;
        if (this.waypoint) {
            let pixelCoordsShadow = entity.world.getPixelCoordinates(this.waypoint);
            let shadows = layers.shadows;
            shadows.strokeStyle = "red";
            shadows.beginPath();
            shadows.ellipse(pixelCoordsShadow.x, pixelCoordsShadow.y, 0.1 * 256 / 20, 0.1 * 208 / 20, 0, 0, Math.PI * 2);
            shadows.closePath();
            shadows.stroke();
        }
    }
}