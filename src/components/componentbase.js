export default class ComponentBase {
    get componentName() { return "invalid"; }

    constructor() {
        this.entity = null;
        this.priority = 0;
    }

    onUpdate(dt) { }

    onDraw(layers) { }

    onCollision(other) { }

    onDeath() { }

    attach(entity) {
        this.entity = entity;
        entity.addComponent(this.componentName, this);
        if (this.onUpdate != ComponentBase.prototype.onUpdate) {
            entity.addUpdateListener(this);
        }
        if (this.onDraw != ComponentBase.prototype.onDraw) {
            entity.addDrawListener(this);
        }
        if (this.onCollision != ComponentBase.prototype.onCollision) {
            entity.addCollisionListener(this);
        }
        if (this.onDeath != ComponentBase.prototype.onDeath) {
            entity.addDeathListener(this);
        }
    }
}