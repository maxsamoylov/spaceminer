/*jshint esversion: 6 */

class Camera {
    constructor(engine, targetObject = null) {
        this.canvas = engine.canvas;
        this.engine = engine;
        this.ctx = engine.ctx;
        engine.camera = this;
        this.targetObject = targetObject;
        this.station = null;

        this.arrow = new Sprite(this.engine, 'arrow', 0, 0, 50);

        this.popups = new Popups(this.engine);
    }

    drawWorld() {
        if (!this.engine.world || !this.engine.ship) return;

        let leftX = this.targetObject.x - this.canvas.halfWidth;
        let leftY = this.targetObject.y - this.canvas.halfHeight;

        // фруструм будет тогда от leftX, leftY до leftX + this.canvas.width, leftY + this.canvas.height11

        // stars
        this.engine.stars.draw(leftX, leftY);

        this.ctx.strokeStyle = '#07edaf';
        this.ctx.shadowColor = '#eee007';
        this.ctx.shadowBlur = 20;
        this.ctx.lineWidth = 3;

        // рисуем лазеры от корабля к астероидам
        for (let target of this.engine.ship.mineTargets) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.halfWidth, this.canvas.halfHeight);
            this.ctx.lineTo(target.x - leftX, target.y - leftY);
            this.ctx.stroke();
        }

        this.ctx.strokeStyle = '#fff';
        this.ctx.shadowBlur = 0;
        this.ctx.lineWidth = 1;

        for (let obj of this.engine.world) {
            if (obj.image2d) {
                if (this.isObjectOnScreen(obj)) {
                    if (!obj.hasOwnProperty('health') || obj.health > 0) {
                        obj.image2d.setRotation(obj.angle);
                        obj.image2d.setSize(obj.width, obj.height);
                        obj.image2d.drawRotated(obj.ctx, obj.x - leftX, obj.y - leftY);
                    } else {
                        // у объекта кончилось здоровье, если у него есть explosion - рисуем
                        if (obj.explosion && !obj.explosion.isEnded) {
                            obj.explosion.draw(obj.x - leftX, obj.y - leftY);
                        }
                    }
                    obj.isOnScreen = true;

                    if (DEBUG) {
                        this.circle(obj.x - leftX, obj.y - leftY, obj.radius);
                        if (obj.radiusMagnet) {
                            this.circle(obj.x - leftX, obj.y - leftY, obj.radiusMagnet);
                        }
                    }
                } else {
                    obj.isOnScreen = false;
                }

            } else if (obj.asteroids) {
                // это поле астероидов
                if (this.isObjectOnScreen(obj)) {
                    obj.isOnScreen = true;
                    for (let asteroid of obj.asteroids) {
                        if (asteroid.health > 0) {
                            asteroid.image2d.setRotation(asteroid.angle);
                            asteroid.image2d.setSize(asteroid.width, asteroid.height);
                            asteroid.image2d.drawRotated(asteroid.ctx, asteroid.x - leftX, asteroid.y - leftY);
                        } else {
                            // астероид уничтожен, но взрыв еще не кончился - рисуем взрыв
                            if (!asteroid.explosion.isEnded) {
                                asteroid.explosion.draw(asteroid.x - leftX, asteroid.y - leftY);
                            }
                        }
                        obj.isOnScreen = true; // не совсем правда, но правда здесь и не нужна

                        if (DEBUG) {
                            this.circle(asteroid.x - leftX, asteroid.y - leftY, asteroid.radius);
                        }
                    }

                    if (DEBUG) {
                        this.circle(obj.x - leftX, obj.y - leftY, obj.radius);
                    }
                } else {
                    if (obj.isOnScreen) {
                        obj.setAsteroidsNotOnScreen();
                    }
                    obj.isOnScreen = false;
                }
            }
        }

        // рисую искры у астероидов на которых попадает лазер
        this.engine.ship.drawMineTargetsSparkles(leftX, leftY);

        // рисую контейнеры станции
        this.engine.station.drawContainers(leftX, leftY);

        // рисую наш корабль
        this.engine.ship.drawContainers(leftX, leftY);
        this.engine.ship.draw();
        if (this.engine.ship.mineTargets.length > 0) {
            this.circle(this.engine.ship.x - leftX, this.engine.ship.y - leftY, this.engine.ship.radiusMagnet);
        }

        if (DEBUG) {
            this.circle(this.engine.ship.x - leftX, this.engine.ship.y - leftY, this.engine.ship.radius);
            this.circle(this.engine.ship.x - leftX, this.engine.ship.y - leftY, this.engine.ship.radiusMagnet);
        }

        // окружность магнита корабля
        if (this.engine.ship.isStationMargetCollided(this.engine.station)) {
            this.circle(this.engine.station.x - leftX, this.engine.station.y - leftY, this.engine.station.radiusMagnet);
        }

        // стрелка, указывающая на станцию
        if (this.station && !this.station.isOnScreen) {
            let vector = this.engine.getNormalizedVector(-this.engine.ship.x, -this.engine.ship.y);
            let x = this.canvas.halfWidth + vector.x * 200;
            let y = this.canvas.halfHeight + vector.y * 200;
            this.arrow.setPosition(x, y);
            let angle = Math.PI - Math.acos(vector.y);
            this.arrow.setRotation(vector.x < 0 ? -angle : angle);
            this.arrow.draw();

            this.engine.textOut(x + 30, y + 4, Math.floor(vector.magnitude).toString());

            if (vector.magnitude > (WORLD_RADIUS + ASTEROID_FREE_ZONE) * 1.05) {
                let align = this.engine.textAlign;
                let fontSize = this.engine.fontSize;
                let textColor = this.engine.textColor;
                this.engine.textAlign = 'center';
                this.engine.textColor = '#ff3a3a';

                this.engine.setFontSize(27);
                this.engine.textOut(this.engine.canvas.halfWidth, this.engine.canvas.halfHeight * 0.6, 'TOO FAR!');

                this.engine.textAlign = align;
                this.engine.setFontSize(fontSize);
                this.engine.textColor = textColor;
            }
        }

        // всплывающие сообщения
        this.popups.draw();

        // mission message
        if (this.engine.ship.isMissionsEnabled) {
            this.engine.missionsController.draw();
        }

        // inventory hud
        this.engine.ship.drawInventoryLoadBar();
    }

    circle(x, y, radius, color = '#fff') {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    line(fromObject, toObject) {

    }

    getObjectScreenCoords(obj) {
        return {
            x: obj.x - (this.targetObject.x - this.canvas.halfWidth),
            y: obj.y - (this.targetObject.y - this.canvas.halfHeight)
        };
    }

    isObjectOnScreen(obj) {
        return !(obj.x + obj.halfWidth < this.targetObject.x - this.canvas.halfWidth ||
            obj.x - obj.halfWidth > this.targetObject.x + this.canvas.halfWidth ||
            obj.y + obj.halfHeight < this.targetObject.y - this.canvas.halfHeight ||
            obj.y - obj.halfHeight > this.targetObject.y + this.canvas.halfHeight
        );
    }

    setTargetObject(targetObject) {
        this.targetObject = targetObject;
    }

    setStation(station) {
        this.station = station;
    }
}
