class Popups {
    constructor(engine) {
        this.engine = engine;

        this.popups = [];
        for (let i = 0; i < 16; i++) {
            this.popups.push(new PopupMessage(this.engine));
        }
    }

    draw() {
        for (let p of this.popups) {
            if (p.isActive) {
                p.draw();
            }
        }
    }

    proceed(deltaTime) {
        for (let p of this.popups) {
            if (p.isActive) {
                p.proceed(deltaTime);
            }
        }
    }

    popup(message) {
        for (let p of this.popups) {
            if (!p.isActive) {
                p.popup(message);
                break;
            }
        }
    }
}