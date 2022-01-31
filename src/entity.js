import * as util from "./util.js";
import World from "./world.js";

export default class Entity {
    constructor() {
        this.components = {};
        this.updateListeners = [];
        this.drawListeners = [];
        this.collisionListeners = [];
        this.deathListeners = [];
        this.world = null;
        this.pos = new util.Vec2D();
        this.z = 0;
        this.vel = new util.Vec2D();
        this.velZ = 0;
        this.gravity = 15;
        this.friction = 15;
        this.mass = 1;
        this.collisionEnabled = true;
        this.collisionChangeVel = true;
        this.applyFriction = true;
        this.applyGravity = true;
        this.radius = 0.25;
        this.team = 0;
        this.targetable = true;
    }

    accelerate(vec, multiplier = 1) {
        this.vel.addInPlace(vec.mul(multiplier));
    }

    setWorld(world) {
        this.world = world;
    }

    addComponent(name, component) {
        if (name === "invalid") {
            throw "Invalid component name";
        }
        this.components[name] = component;
    }

    addUpdateListener(component) {
        this.updateListeners.push(component);
        this.updateListeners.sort((a, b) => { return b.priority - a.priority; });
    }

    addDrawListener(component) {
        this.drawListeners.push(component);
        this.drawListeners.sort((a, b) => { return b.priority - a.priority; });
    }

    addCollisionListener(component) {
        this.collisionListeners.push(component);
        this.collisionListeners.sort((a, b) => { return b.priority - a.priority; });
    }

    addDeathListener(component) {
        this.deathListeners.push(component);
        this.deathListeners.sort((a, b) => { return b.priority - a.priority; });
    }

    update(dt) {
        this.z += this.velZ * dt;
        if (this.z <= 0) {
            this.z = 0;
            this.velZ = 0;
        } else if (this.applyGravity) {
            this.velZ -= this.gravity * dt;
        }
        if (this.applyFriction && this.z == 0) {
            let velNorm = this.vel.norm();
            if (velNorm > this.friction * dt) {
                this.vel.subInPlace(this.vel.normalise().mul(this.friction * dt));
            } else {
                this.vel.x = 0;
                this.vel.y = 0;
            }
        }
        this.pos.addInPlace(this.vel.mul(dt));
        for (const listener of this.updateListeners) {
            listener.onUpdate(dt);
        }
    }

    draw(layers) {
        for (const listener of this.drawListeners) {
            listener.onDraw(layers);
        }
    }

    onCollision(entity) {
        for (const listener of this.collisionListeners) {
            listener.onCollision(entity);
        }
    }

    knockBack(force, direction) {
        this.vel = direction.normalise().mul(-force * 0.5);
        if (this.applyGravity) {
            this.velZ = 2 * force / this.mass;
        }
    }

    knockBackFrom(force, origin) {
        const direction = origin.sub(this.pos);
        this.knockBack(force, direction);
    }

    getPixelCoordinates() {
        return new util.Vec2D(
            Math.round(32 + this.pos.x * 256 / 20),
            Math.round(24 + (this.world.height - this.pos.y - this.z * 0.8) * 208 / 20)
        )
    }

    getPixelCoordinatesShadow() {
        return new util.Vec2D(
            Math.round(32 + this.pos.x * 256 / 20),
            Math.round(24 + (this.world.height - this.pos.y) * 208 / 20)
        )
    }

    getEnemies() {
        return this.world.entities[World.getEnemyTeam(this.team)];
    }

    getAllies() {
        return this.world.entities[this.team];
    }

    getClosestEnemy() {
        let target = null;
        let closestTargetDistSqr = 1e308;
        for (const e of this.getEnemies()) {
            if (e.components.damageTaker) {
                const distSqr = this.pos.sub(e.pos).normSqr();
                if (distSqr < closestTargetDistSqr) {
                    closestTargetDistSqr = distSqr;
                    target = e;
                }
            }
        }
        return target;
    }

    getClosestEnemyInRange(range) {
        let target = null;
        let closestTargetDistSqr = 1e308;
        range *= range;
        for (const e of this.getEnemies()) {
            if (e.components.damageTaker) {
                const distSqr = this.pos.sub(e.pos).normSqr();
                if (distSqr < closestTargetDistSqr && distSqr <= range) {
                    closestTargetDistSqr = distSqr;
                    target = e;
                }
            }
        }
        return target;
    }

    destroy() {
        for (const listener of this.deathListeners) {
            listener.onDeath();
        }
        this.world.removeEntity(this);
    }
}