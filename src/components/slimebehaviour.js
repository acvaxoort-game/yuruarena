import ComponentBase from "./componentbase.js";

export default class SlimeBehaviourComponent extends ComponentBase {
    static get name() { return "slimeBehaviour"; }

    constructor() {
        super();
        this.attack = 5;
        this.verticalLaunch = 10;
        this.horizontalLaunch = 2.5;
        this.jumpCooldown = 3;
        this.jumpDelay = this.jumpCooldown;
        this.attackCooldown = 0.5;
        this.attackDelay = this.attackCooldown;
    }

    setVerticalLaunch(value) {
        this.verticalLaunch = value;
        return this;
    }

    setHorizontalLaunch(value) {
        this.horizontalLaunch = value;
        return this;
    }

    setJumpCooldown(value) {
        this.jumpCooldown = value;
        this.jumpDelay = this.jumpCooldown;
        return this;
    }

    setAttackCooldown(value) {
        this.attackCooldown = value;
        this.attackDelay = this.attackCooldown;
        return this;
    }

    onUpdate(dt) {
        const entity = this.entity;
        const simpleAnimation = entity.components.simpleAnimation;
        if (this.attackDelay > 0) {
            this.attackDelay -= dt;
        }
        if (this.jumpDelay > 0) {
            this.jumpDelay -= dt;
            if (entity.z == 0) {
                //simpleAnimation.animation.setFrame(0);
                //entity.applyFriction = true;
            }
        } else {
            let target = entity.getClosestEnemy();
            if (entity.z == 0 && target) {
                //entity.applyFriction = false;
                const jumpDuration = 2 * this.verticalLaunch / entity.gravity;
                const jumpDistance = jumpDuration * this.horizontalLaunch;
                const targetVector = target.pos.sub(entity.pos);
                let targetDistance = targetVector.norm();
                if (Math.random() < 0.5) {
                    targetVector.addInPlace(target.vel.mul(jumpDuration * 0.5));
                    targetDistance = targetVector.norm();
                }
                if (targetDistance > jumpDistance) {
                    this.jumpDelay = this.jumpCooldown;
                    entity.velZ = this.verticalLaunch;
                    entity.vel = targetVector.normalise().mul(this.horizontalLaunch);
                } else {
                    if (jumpDistance > 0) {
                        this.jumpDelay = this.jumpCooldown * (0.4 + 0.6 * targetDistance / jumpDistance) * (0.8 + 0.4 * Math.random());
                        entity.velZ = this.verticalLaunch * targetDistance / jumpDistance;
                        entity.vel = targetVector.normalise().mul(this.horizontalLaunch);
                    }
                }
                //simpleAnimation.animation.setFrame(1);
            }
        }
    }

    onCollision(otherEntity) {
        const entity = this.entity;
        if (otherEntity.team != entity.team) {
            if (this.attackDelay <= 0) {
                this.attackDelay = this.attackCooldown;
                otherEntity.knockBackFrom(2, entity.pos);
                console.log("dealt damage");
                if (otherEntity.components.damageTaker) {
                    otherEntity.components.damageTaker.damage(this.attack);
                }
            }
        }
    }
}