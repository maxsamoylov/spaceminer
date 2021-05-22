/*jshint esversion: 6 */

class Sprite {

    constructor(engine, name, x, y, size = 0, rotation = 0) {
        this.engine = engine;
        this.canvas = this.engine.canvas;
        this.image2d = engine.getImage2d(name);
        this.ctx = this.engine.getCtx();
        this.name = name;
        this.x = x;
        this.y = y;
        this.setSize(size);
        this.angle = rotation;
        // видим ли он сейчас, рисуется ли
        this.isOnScreen = false;

        // определяется у наследников, я натупил нимношк, не сделал class Entity
        this.radius = 0;
    }

    draw() {
        this.image2d.setRotation(this.angle);
        this.image2d.setSize(this.width, this.height);
        this.image2d.drawRotated(this.ctx, this.x, this.y);
    }

    rotate(angle) {
        this.angle += angle;
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    setRotation(angle) {
        this.angle = angle;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(size) {
        this.width = size;
        this.height = size;
        this.halfWidth = Math.floor(size / 2);
        this.halfHeight = Math.floor(size / 2);
    }

    normalizeVector(x, y) {
        let magnitude = Math.sqrt(x * x + y * y);
        return {
            x: x / magnitude,
            y: y / magnitude,
            magnitude: magnitude
        };
    }

    getSquareDist(x, y) {
        return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y);
    }

    isCollided(obj){
        if (!obj.health || obj.health <= 0) return false;

        return ((this.x - obj.x) * (this.x - obj.x) + (this.y - obj.y) * (this.y - obj.y) <
            (this.radius + obj.radius) * (this.radius + obj.radius)
        );
    }

    proceed(deltaTime) {
        console.log('virtual method proceed!');
    }
}
