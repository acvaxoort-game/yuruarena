import * as util from "./util.js";

export default class World {
    static playerCharacters = 0;
    static enemyCharacters = 1;
    static playerProjectiles = 2;
    static enemyProjectiles = 3;

    static getProjectileTeam(characterTeam) {
        return characterTeam + 2;
    }

    static getEnemyTeam(characterTeam) {
        if (characterTeam == 0) {
            return 1;
        } else {
            return 0;
        }
    }

    constructor() {
        this.entities = [[], [], [], []];
        this.deletionQueues = [[], [], [], []];
        this.width = 20;
        this.height = 20;
    }

    checkEntityCollision(e1, e2) {
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
                    let mul = 0.1 / distNorm;
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
            }
            return;
        }
        fy21 = 1.0e-12 * Math.abs(y21);
        if (Math.abs(x21) < fy21) {
            if (x21 < 0) { sign = -1; } else { sign = 1; }
            x21 = fy21 * sign;
        }
        a = y21 / x21;
        dvx2 = -2 * (vx21 + a * vy21) / ((1 + a * a) * (1 + m21));
        if (e2.collisionChangeVel) {
            e2.vel.x += dvx2;
            e2.vel.y += a * dvx2;
        }
        if (e1.collisionChangeVel) {
            e1.vel.x -= m21 * dvx2;
            e1.vel.y -= a * m21 * dvx2;
        }
        /*l
        x21 = e2.pos.x - e1.pos.x;
        et norm = Math.sqrt(x21 * x21 + y21 * y21);
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
        }*/
        e1.onCollision(e2);
        e2.onCollision(e1);
    }

    collideArrays(arr1, arr2) {
        for (let i = 0; i < arr1.length; ++i) {
            let e1 = arr1[i];
            if (e1.z > 1 || !e1.collisionEnabled) {
                continue;
            }
            for (let j = 0; j < arr2.length; ++j) {
                let e2 = arr2[j];
                if (e2.z > 1 || !e2.collisionEnabled) {
                    continue;
                }
                this.checkEntityCollision(e1, e2);
            }
        }
    }

    collideArrayWithItself(arr) {
        for (let i = 0; i < arr.length; ++i) {
            let e1 = arr[i];
            if (e1.z > 1 || !e1.collisionEnabled) {
                continue;
            }
            for (let j = i + 1; j < arr.length; ++j) {
                let e2 = arr[j];
                if (e2.z > 1 || !e2.collisionEnabled) {
                    continue;
                }
                this.checkEntityCollision(e1, e2);
            }
        }
    }

    update(dt) {
        // entity update
        for (let arr of this.entities) {
            for (let e of arr) {
                e.update(dt);
            }
        }
        // entity collision
        this.collideArrayWithItself(this.entities[0]);
        this.collideArrayWithItself(this.entities[1]);
        this.collideArrays(this.entities[0], this.entities[1]);
        this.collideArrays(this.entities[0], this.entities[3]);
        this.collideArrays(this.entities[1], this.entities[2]);
        // world border collision
        for (let arr of this.entities) {
            for (let e of arr) {
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
        }
        // entity deletion
        for (let i = 0; i < this.deletionQueues.length; ++i) {
            const queue = this.deletionQueues[i];
            //console.log(this.deletionQueues)
            //console.log(queue);
            for (let e of queue) {
                const entityArray = this.entities[i];
                let index = entityArray.indexOf(e);
                entityArray.splice(index, 1);
                e.setWorld(null);
            }
            this.deletionQueues[i] = [];
        }
    }

    draw(layers) {
        const tempEntityArray = this.entities.flat();
        tempEntityArray.sort((a, b) => {
            return b.pos.y - a.pos.y;
        })
        for (let e of tempEntityArray) {
            e.draw(layers);
        }
    }

    addEntity(entity, team) {
        entity.team = team;
        this.entities[team].push(entity);
        entity.setWorld(this);
    }

    removeEntity(entity) {
        this.deletionQueues[entity.team].push(entity);
    }

    getPixelCoordinates(pos, z = 0) {
        return new util.Vec2D(
            Math.round(32 + pos.x * 256 / 20),
            Math.round(24 + (this.height - pos.y - z * 0.8) * 208 / 20)
        )
    }
}