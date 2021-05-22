/*jshint esversion: 6 */

class Asteroid extends Sprite {
    constructor(engine, name, asteroidType, x, y,
                parentObject = null,
                centralAngle = 0,
                centralRadius = 0
    ) {
        super(engine, name, x, y, 30 + engine.randomInt(30), Math.random() * Math.PI);

        this.asteroidType = asteroidType;
        this.objectType = ObjectTypes.ASTEROID;
        if (this.asteroidType >= ASTEROID.BONUS1) {
            this.objectType = ObjectTypes.BONUS_ASTEROID;
        }
        this.radius = this.halfWidth * 0.9;
        this.parentObject = parentObject;
        this.rotationSpeed = 1.8 - Math.random() * 3.6;

        // параметры связанные с центральным объектом - угловая скорость, расстояние до центра, текущий угол оборота
        this.centralSpeed = 0;
        this.centralRadius = centralRadius;
        this.centralAngle = centralAngle;

        if (this.parentObject) {
            this.centralSpeed = 0.8 - (Math.random() * 1.6);
        }

        this.info = getAsteroidInfo(this.asteroidType);
        this.health = 0;
        this.maxHealth = 0;
        if (this.info) {
            this.health = this.info.health;
            this.maxHealth = this.health;
        }

        // врзыв который будет показываться после смерти астероида
        // и удалять астероид из мира я буду когда explosion.isEnded = true
        // или когда у него здоровья нет и он скрылся с экрана
        this.explosion = new Effect(engine, 'explosion', this.width * 3, 128, 12, 0.05, false);

        // искры на границе астероида, когда по нему бьет лазер
        this.sparkle = new Effect(engine, 'sparkles', 64, 64, 2, 0.07, true);
    }

    proceed(deltaTime) {
        if (this.health > 0) {
            this.rotate(this.rotationSpeed * deltaTime);
            if (this.parentObject) {
                this.centralAngle += this.centralSpeed * deltaTime;
                this.x = this.parentObject.x + this.centralRadius * Math.cos(this.centralAngle);
                this.y = this.parentObject.y + this.centralRadius * Math.sin(this.centralAngle);
            }
        } else {
            if (!this.explosion.isEnded) {
                this.explosion.proceed(deltaTime);
            } else {
                if (this.parentObject) {
                    this.parentObject.deleteAsteroid(this);
                } else {
                    this.engine.deleteWorldObject(this);
                }
            }
        }
    }

    drawSparkle(asteroidScreenX, asteroidScreenY) {
        let vector = this.engine.getNormalizedVector(this.engine.ship.x - this.x, this.engine.ship.y - this.y);
        this.sparkle.draw(asteroidScreenX + vector.x * this.radius, asteroidScreenY + vector.y * this.radius);

        // логично, что если у астероида есть искры, то его пилят и у него уменьшается здоровье
        // поэтому рисую здоровье
        let lineCap = this.ctx.lineCap;
        let color = this.ctx.strokeStyle;
        this.ctx.fillStyle = '#05c00e';
        this.ctx.lineCap = 'square';

        this.ctx.fillRect(asteroidScreenX - 25, asteroidScreenY - this.radius * 2,
            50 * (this.health / this.maxHealth), 8
        );

        this.ctx.lineCap = lineCap;
        this.ctx.fillStyle = color;
    }

    restoreHealth() {
        this.health = this.maxHealth;
    }

    mine(minePower, deltaTime) {
        this.health -= minePower * deltaTime;
        if (this.health <= 0) {
            // mined
            return this.info;
            // после этого камера будет показывать взрыв
        }
        return false;
    }
}
