import * as util from "./util.js";

export default class World {
    constructor() {
        this.entities = [];
        this.deletionQueue = [];
        this.width = 20;
        this.height = 20;
    }

    update(dt) {
        // entity update
        for (let e of this.entities) {
            e.update(dt);
        }
        // entity collision
        for (let i = 0; i < this.entities.length; ++i) {
            let e1 = this.entities[i];
            if (e1.z > 1 || !e1.collisionEnabled) {
                continue;
            }
            for (let j = i + 1; j < this.entities.length; ++j) {
                let e2 = this.entities[j];
                if (e2.z > 1 || !e2.collisionEnabled) {
                    continue;
                }
                let m21, dvx2, a, x21, y21, vx21, vy21, fy21, sign;
                m21 = e2.mass / e1.mass;
                x21 = e2.pos.x - e1.pos.x;
                y21 = e2.pos.y - e1.pos.y;
                vx21 = e2.vel.x - e1.vel.x;
                vy21 = e2.vel.y - e1.vel.y;
                let distNorm = Math.sqrt(x21 * x21 + y21 * y21);
                let intersecting = distNorm <= e2.radius + e2.radius;
                if (!intersecting || vx21 * x21 + vy21 * y21 >= 0) {
                    if (intersecting) {
                        if (distNorm > 0) {
                            let mul = 1 / distNorm;
                            let massSum = e1.mass + e2.mass
                            if (e2.collisionChangeVel) {
                                let mul2 = mul * e1.mass / massSum;
                                e2.vel.x += x21 * mul2;
                                e2.vel.y += y21 * mul2;
                            } 
                            if (e1.collisionChangeVel) {
                                let mul1 = mul * e2.mass / massSum;
                                e1.vel.x -= x21 * mul1;
                                e1.vel.y -= y21 * mul1;
                            }
                        }
                        e1.onCollision(e2);
                        e2.onCollision(e1);
                        console.log("collision2");
                    }
                    continue;
                }
                fy21 = 1.0e-12 * Math.abs(y21);
                if (Math.abs(x21) < fy21) {
                    if (x21 < 0) { sign = -1; } else { sign = 1; }
                    x21 = fy21 * sign;
                }
                a = y21 / x21;
                dvx2 = -2 * (vx21 + a * vy21) / ((1 + a * a) * (1 + m21));
                if (e2.collisionChangeVel) {
                    e2.vel.x += 3 * dvx2;
                    e2.vel.y += 3 * a * dvx2;
                }
                if (e1.collisionChangeVel) {
                    e1.vel.x -= 3 * m21 * dvx2;
                    e1.vel.y -= 3 * a * m21 * dvx2;
                }
                x21 = e2.pos.x - e1.pos.x;
                let norm = Math.sqrt(x21 * x21 + y21 * y21);
                let mul = 0.002 / norm;
                x21 *= mul;
                y21 *= mul;
                if (e2.collisionChangeVel) {
                    e2.vel.x += x21;
                    e2.vel.y += y21;
                }
                if (e1.collisionChangeVel) {
                    e1.vel.x -= x21;
                    e1.vel.y -= y21;
                }
                e1.onCollision(e2);
                e2.onCollision(e1);
                console.log("collision");
            }
        }
        // world border collision
        for (let e of this.entities) {
            if (e.pos.x - e.radius < 0) {
                e.pos.x = e.radius;
            } else if (e.pos.x + e.radius > this.width) {
                e.pos.x = this.width - e.radius;
            }
            if (e.pos.y - e.radius < 0) {
                e.pos.y = e.radius;
            } else if (e.pos.y + e.radius > this.height) {
                e.pos.y = this.height - e.radius;
            }
        }
        // entity deletion
        for (let e of this.deletionQueue) {
            let index = this.entities.indexOf(e);
            this.entities.splice(index, 1);
        }
        this.deletionQueue = [];
    }

    draw(layers) {
        this.entities.sort((a, b) => {
            return b.pos.y - a.pos.y;
        })
        for (let e of this.entities) {
            e.draw(layers);
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
        entity.setWorld(this);
    }

    removeEntity(entity) {
        this.deletionQueue.push(entity);
    }
}