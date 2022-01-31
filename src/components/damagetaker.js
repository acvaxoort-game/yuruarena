import ComponentBase from "./componentbase.js";

export default class DamageTakerComponent extends ComponentBase {
    get componentName() { return "damageTaker"; }

    constructor() {
        super();
        this.hp = 1;
        this.hpMax = 1;
    }

    setHpMax(value) {
        this.hpMax = value;
        this.hp = value;
        return this;
    }

    damage(value) {
        this.hp -= value;
    }

    onUpdate(dt) {
        const entity = this.entity;
        if (this.hp <= 0) {
            entity.destroy();
        }
    }
}