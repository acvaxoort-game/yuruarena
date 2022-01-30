export default class ComponentBase {
    static get name() { return "invalid"; }

    constructor() {
        this.entity = null;
        this.priority = 0;
    }

    attach(entity) {
        this.entity = entity;
        entity.addComponent(this.constructor.name, this);
        if (typeof this.onUpdate == "function") {
            entity.addUpdateListener(this);
        }
        if (typeof this.onDraw == "function") {
            entity.addDrawListener(this);
        }
        if (typeof this.onCollision == "function") {
            entity.addCollisionListener(this);
        }
        if (typeof this.onDeath == "function") {
            entity.addDeathListener(this);
        }
    }
}