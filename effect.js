class Effect {
    constructor(engine, name, size, regionSize, frameCount, animationSpeed, isLooped = false) {
        this.engine = engine;
        this.canvas = this.engine.canvas;
        this.ctx = this.engine.ctx;
        this.image2d = engine.getImage2d(name);
        this.image = this.image2d.image;
        // размер эффекта
        this.size = size;
        this.halfSize = size / 2;
        this.regionSize = regionSize;
        this.frameCount = frameCount;

        this.frame = 0;
        this.animationSpeed = animationSpeed;
        this.timeToNextFrame = animationSpeed;
        this.isLooped = isLooped;

        this.isEnded = false;

        this.regionsX = this.image.width / regionSize;
        this.regionsY = this.image.height / regionSize;
    }

    proceed(deltaTime) {
        if (this.isEnded) return;

        this.timeToNextFrame -= deltaTime;
        if (this.timeToNextFrame <= 0) {
            this.frame++;
            if (this.frame === this.frameCount) {
                if (this.isLooped) {
                    this.frame = 0;
                } else {
                    this.isEnded = true;
                }
            }
            this.timeToNextFrame = this.animationSpeed;
        }
    }

    // экранные координаты
    draw(x, y) {
        if (this.isEnded) return;

        this.ctx.drawImage(this.image,
            (this.frame % this.regionsX) * this.regionSize,
            Math.floor(this.frame / this.regionsX) * this.regionSize,
            this.regionSize,
            this.regionSize,
            x - this.halfSize,
            y - this.halfSize,
            this.size,
            this.size
        );
    }
}