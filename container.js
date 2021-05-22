class Container {
    constructor(engine, name, x, y, target, info = null) {
        this.engine = engine;
        this.ctx = engine.ctx;
        this.target = target;
        this.x = x;
        this.y = y;
        this.size = 40;
        this.halfSize = this.size / 2;
        this.image = this.engine.image2d(name).image;
        this.speed = 200;
        this.maxSpeed = 650;

        // необязательный объект типа AsteroidInfo
        this.info = info;
    }

    proceed(deltaTime) {
        let vector = this.engine.getNormalizedVector(this.target.x - this.x, this.target.y - this.y);
        this.x += vector.x * this.speed * deltaTime;
        this.y += vector.y * this.speed * deltaTime;

        if (this.speed < this.maxSpeed) {
            this.speed += this.speed * 1.07 * deltaTime;
        }

        if (vector.magnitude < 20) {
            this.target.deleteContainer(this);
        }
    }

    draw(cameraLeftX, cameraLeftY) {
        this.ctx.drawImage(this.image,
            this.x - this.halfSize - cameraLeftX,
            this.y - this.halfSize - cameraLeftY,
            this.size,
            this.size
        );
    }
}
