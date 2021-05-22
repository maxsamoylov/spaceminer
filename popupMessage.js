class PopupMessage {
    constructor(engine) {
        this.engine = engine;
        this.y = 0;
        this.lifeTime = 0;
        this.isActive = false;
        this.speed = 120;
        this.message = null;
    }

    draw() {
        let align = this.engine.textAlign;
        this.engine.ctx.globalAlpha = this.lifeTime + 0.3;
        let fontSize = this.engine.fontSize;
        this.engine.textAlign = 'center';

        this.engine.setFontSize(19);
        this.engine.textOut(this.engine.canvas.halfWidth, this.y, this.message);

        this.engine.textAlign = align;
        this.engine.ctx.globalAlpha = 1;
        this.engine.setFontSize(fontSize);
    }

    proceed(deltaTime) {
        if (this.isActive) {
            this.lifeTime -= deltaTime;
            this.y -= this.speed * deltaTime;
            if (this.lifeTime <= 0) {
                this.isActive = false;
            }
        }
    }

    popup(message) {
        this.message = message;
        this.y = this.engine.canvas.halfHeight - this.engine.ship.radius * 1.8;
        this.lifeTime = 1;
        this.isActive = true;
    }
}