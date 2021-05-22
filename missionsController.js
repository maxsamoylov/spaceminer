class MissionsController {
    constructor(engine) {
        this.engine = engine;
        this.ctx = engine.ctx;
        this.canvas = engine.canvas;

        this.missionTimer = 0;
        this.noMissionTimer = MISSION_PAUSE_TIME - 3;
        this.asteroidInfo = null;
        this.quantity = 0;
        this.reward = 0;

        this.missionMessage = '';
        this.timeString = '';
        this.lastTime = 0;

        this.lastMissionResult = null;
    }

    proceed(deltaTime) {
        if (this.noMissionTimer > 0) {
            this.noMissionTimer -= deltaTime;
            if (this.noMissionTimer <= 0) {
                this.generateMission();
            }
        } else {
            this.missionTimer -= deltaTime;
            if (Math.floor(this.missionTimer) < this.lastTime) {
                this.lastTime = Math.floor(this.missionTimer);
                this.timeString = this.getMissionTimerString();
            }
            if (this.missionTimer <= 0) {
                this.noMissionTimer = MISSION_PAUSE_TIME;
                this.lastMissionResult = false;
                this.engine.ship.missionFailed();
            }
        }
    }

    draw() {
        if (this.noMissionTimer <= 0 && this.missionTimer >= 0) {
            let align = this.engine.textAlign;
            let fontSize = this.engine.fontSize;
            let textColor = this.engine.textColor;
            this.engine.textAlign = 'center';
            this.engine.textColor = '#fff';

            if (this.engine.ship.getSameInventoryItemsCount(this.asteroidInfo) >= this.quantity) {
                this.engine.textColor = '#84e766';
            }

            this.engine.setFontSize(21);
            this.engine.textOut(this.engine.canvas.halfWidth,
                70,
                this.missionMessage
            );

            this.engine.textColor = '#fff';
            this.engine.textOut(this.engine.canvas.halfWidth,
                100,
                this.timeString
            );

            this.engine.textAlign = align;
            this.engine.setFontSize(fontSize);
            this.engine.textColor = textColor;
        }
        if (this.noMissionTimer > MISSION_PAUSE_TIME - 2) {
            let align = this.engine.textAlign;
            let fontSize = this.engine.fontSize;
            let textColor = this.engine.textColor;
            this.engine.textAlign = 'center';

            this.engine.setFontSize(21);

            if (this.lastMissionResult) {
                this.engine.textColor = '#84e766';
                this.engine.textOut(this.engine.canvas.halfWidth,
                    70,
                    'Mission success! +$' + this.reward.toString()
                );
            } else {
                this.engine.textColor = '#ff3a3a';
                this.engine.textOut(this.engine.canvas.halfWidth,
                    70,
                    'Mission failed!'
                );
            }

            this.engine.textAlign = align;
            this.engine.setFontSize(fontSize);
            this.engine.textColor = textColor;
        }
    }

    stationReceivedItem(item, quantity) {
        if (this.noMissionTimer <= 0 && this.missionTimer >= 0) {
            if (item.asteroidType === this.asteroidInfo.asteroidType) {
                this.quantity -= quantity;
                if (this.quantity <= 0) {
                    // mission success
                    this.engine.ship.missionSuccess(this.reward);
                    this.noMissionTimer = MISSION_PAUSE_TIME;
                    this.lastMissionResult = true;
                } else {
                    // change mission message
                    this.missionMessage = this.getMissionMessage();
                }
            }
        }
    }

    generateMission() {
        this.asteroidInfo = getAsteroidInfo(getRandomAsteroidType(this.engine));
        this.quantity = 10 + this.engine.randomInt(10);
        this.noMissionTimer = 0;
        this.missionTimer = MISSION_TIME;
        this.lastTime = this.missionTimer;
        this.reward = 3000 + this.engine.randomInt(3001);

        this.missionMessage = this.getMissionMessage();
        this.timeString = this.getMissionTimerString();
    }

    getMissionMessage() {
        return 'Mission: deliver ' + this.quantity + ' ' + this.asteroidInfo.title + ' for $' + this.reward;
    }

    getMissionTimerString() {
        return Math.floor(this.missionTimer / 60).toString() + ':' +
            Math.floor(this.missionTimer % 60).toString().padStart(2, '0');
    }
}
