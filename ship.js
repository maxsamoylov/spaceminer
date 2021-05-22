/*jshint esversion: 6 */

class Ship extends Sprite {
    constructor(engine, name, fireName, x, y) {
        super(engine, name, x, y, SHIP_SIZE);

        this.image2d.setSize(this.width, this.height);

        this.fireSprite = new Sprite(this.engine, fireName, 0, 0, 50);

        this.inventoryMaxSize = 4;
        // здесь лежат объекты типа AsteroidInfo
        this.inventory = [];

        this.speedMax = SHIP_START_SPEED;

        this.healthMax = 10;
        this.health = 10;

        this.radius = this.halfWidth * 0.7;
        // радиус и скорость (дамаг) майнинга
        this.radiusMagnet = Math.round(this.radius * 3);
        this.minePower = 100;

        // пушки-копалки
        this.miners = 1;
        // текущие цели майнинга
        this.mineTargets = [];

        // текущее направление носа
        this.vector = { x: 0, y: 0, magnitude: 0 };

        // это контейнеры, которые летят к кораблю от взорванного астероида. когда полетят к станции - у нее свои
        this.containers = [];
        this.dumpContainersTimer = 0;

        this.money = 0;

        // если 1 - груз сбрасывается быстро
        this.isFastDump = 0;

        // разрешены ли миссии
        this.isMissionsEnabled = 0;

        // сколько сделано апгрейдов каждого параметра (для вычисления текущей цены апгрейда)
        this.upgradesSpeed = 0;
        this.upgradesMagnetRadius = 0;
        this.upgradesMagnetPower = 0;
        this.upgradesMagnetsCount = 0;
        this.upgradesInventoryCapacity = 0;
        this.upgradesFastDump = 0;
        this.upgradesMissions = 0;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(this.canvas.halfWidth, this.canvas.halfHeight);
        this.ctx.rotate(this.angle);
        this.ctx.translate(this.image2d.negativeHalfWidth, this.image2d.negativeHalfHeight);
        // огонь из дюз
        if (this.engine.mouse.isButtonLeft) {
            this.ctx.drawImage(this.fireSprite.image2d.image, 25, 80, 50, 50 + this.engine.randomInt(10));
        }
        this.ctx.drawImage(this.image2d.image, 0, 0, this.image2d.width, this.image2d.height);

        this.ctx.restore();
    }

    proceed(deltaTime) {
        this.lookAtMouse();

        // движение за мышкой
        if (this.engine.mouse.isButtonLeft) {
            this.x += this.vector.x * this.speedMax * deltaTime;
            this.y += this.vector.y * this.speedMax * deltaTime;
        }

        // containers
        for (let container of this.containers) {
            container.proceed(deltaTime);
        }

        this.dumpContainersTimer -= deltaTime;
        if (this.dumpContainersTimer < 0) {
            this.dumpContainersTimer = 0;
        }

        // чтобы не пилить вечно таргеты, захваченные ранее, если инвентарь заполнился
        if (this.inventory.length >= this.inventoryMaxSize && this.mineTargets.length > 0) {
            this.mineTargets = [];
        }

        if (this.mineTargets.length === 0) return;

        // перебираю текущие таргеты
        for (let i = this.mineTargets.length - 1; i >= 0; i--) {
            if (!this.isMagnetCollided(this.mineTargets[i])) {
                // восстановим здоровье астероиду, если его не допилили, чтобы жизнь мёдом не казалась
                this.mineTargets[i].restoreHealth();
                this.mineTargets.splice(i, 1);
            } else {
                // майнинг цели
                if (this.inventory.length < this.inventoryMaxSize) {
                    let mineResult = this.mineTargets[i].mine(this.minePower, deltaTime);
                    if (mineResult) {
                        // замайнили, нужно удалить
                        this.putInInventory(mineResult);
                        this.spawnContainer(this.mineTargets[i]);
                        this.mineTargets.splice(i, 1);
                        // совсем удалять его будем после взрыва
                        //console.log('mining target deleted!');
                    } else {
                        // иначе proceed у искр астероида
                        this.mineTargets[i].sparkle.proceed(deltaTime);
                    }
                }
            }
        }
    }

    drawMineTargetsSparkles(leftX, leftY) {
        for (let asteroid of this.mineTargets) {
            asteroid.drawSparkle(asteroid.x - leftX, asteroid.y - leftY);
        }
    }

    spawnContainer(obj) {
        this.containers.push(new Container(this.engine, CONTAINER_NAME, obj.x, obj.y, this, (obj.info ? obj.info : null)));
    }

    deleteContainer(obj) {
        let index = this.containers.indexOf(obj);
        if (index >= 0) {
            this.containers.splice(index, 1);
            //console.log('container deleted');
        }
    }

    drawContainers(leftX, leftY) {
        for (let container of this.containers) {
            container.draw(leftX, leftY);
        }
    }

    putInInventory(info) {
        if (this.inventory.length < this.inventoryMaxSize) {
            this.inventory.push(info);
            this.engine.camera.popups.popup(info.title);
        }
    }

    lookAtMouse() {
        this.vector.x = this.engine.mouse.x - this.canvas.halfWidth;
        this.vector.y = this.engine.mouse.y - this.canvas.halfHeight;
        this.vector.magnitude = Math.sqrt(this.vector.x * this.vector.x + this.vector.y * this.vector.y);
        this.vector.x = this.vector.x / this.vector.magnitude;
        this.vector.y = this.vector.y / this.vector.magnitude;

        let angle = Math.PI - Math.acos(this.vector.y);

        this.setRotation(this.vector.x < 0 ? -angle : angle);
    }

    // начинаю пилить объект лазером
    catchObject(obj) {
        if (this.inventory.length >= this.inventoryMaxSize) return;

        if (obj.objectType === ObjectTypes.ASTEROID || obj.objectType === ObjectTypes.BONUS_ASTEROID) {
            if (this.mineTargets.length >= this.miners || this.mineTargets.includes(obj)) return; // он уже есть среди целей
            this.mineTargets.push(obj);
            // console.log('catched', this.mineTargets.length);
        }
    }

    getNormalizedVector(x, y) {
        let magnitude = Math.sqrt(x * x + y * y);
        return { x: x / magnitude, y: y / magnitude, magnitude: magnitude };
    }

    getSquareDistance(x, y) {
        return (this.x - x) * (this.x - x) + (this.y - y) * (this.y - y);
    }

    drawInventoryLoadBar() {
        let lineCap = this.ctx.lineCap;
        let color = this.ctx.strokeStyle;
        this.ctx.fillStyle = '#05c00e';
        this.ctx.lineCap = 'square';

        this.ctx.fillStyle = '#464646';
        this.ctx.fillRect(this.canvas.halfWidth - 120, 10,
            240, 24
        );
        this.ctx.fillStyle = '#1c7e6f';
        this.ctx.fillRect(this.canvas.halfWidth - 120, 10,
            240 * (this.inventory.length / this.inventoryMaxSize), 24
        );

        this.ctx.lineCap = lineCap;
        this.ctx.fillStyle = color;

        let align = this.engine.textAlign;
        let fontSize = this.engine.fontSize;
        this.engine.textAlign = 'center';

        this.engine.setFontSize(19);
        this.engine.textOut(this.engine.canvas.halfWidth, 29, this.inventory.length + ' / ' + this.inventoryMaxSize);
        // money show!
        this.engine.textOut(this.engine.canvas.halfWidth, this.engine.canvas.height - 64, '$' + this.engine.ship.money);

        this.engine.textAlign = align;
        this.engine.setFontSize(fontSize);
    }

    isMagnetCollided(obj) {
        if (!obj.health || obj.health <= 0) return false;

        return ((this.x - obj.x) * (this.x - obj.x) + (this.y - obj.y) * (this.y - obj.y) <
            (this.radiusMagnet + obj.radius) * (this.radiusMagnet + obj.radius)
        );
    }

    isStationMargetCollided(station) {
        return ((this.x - station.x) * (this.x - station.x) + (this.y - station.y) * (this.y - station.y) <
            (this.radius + station.radiusMagnet) * (this.radius + station.radiusMagnet)
        );
    }

    getSameInventoryItems(item) {
        let result = [];
        for (let inventoryItem of this.inventory) {
            if (inventoryItem.asteroidType === item.asteroidType) {
                result.push(inventoryItem);
            }
        }
        return result;
    }

    getSameInventoryItemsCount(item) {
        let result = 0;
        for (let inventoryItem of this.inventory) {
            if (inventoryItem.asteroidType === item.asteroidType) {
                result++;
            }
        }
        return result;
    }

    // по итему (AsteroidInfo) возвращает количество летящих к кораблю контейнеров такого типа
    getContainersCountByType(item) {
        let result = 0;
        for (let container of this.containers) {
            if (container.info.asteroidType === item.asteroidType) {
                result++;
            }
        }
        return result;
    }

    missionSuccess(reward) {
        this.money += reward;
        //this.engine.camera.popups.popup('Mission reward: $' + reward);
    }

    missionFailed() {
        this.engine.camera.popups.popup('Mission failed!');
    }

    dumpContainersToStation() {
        // разгрузка контейнеров в станцию. у нас в инвентаре уже могут быть предметы, но визуально они летят
        // поэтому смотрим на количество this.containers
        if (this.inventory.length - this.containers.length > 0 && this.dumpContainersTimer <= 0) {
            // сброс
            let item = this.inventory[this.inventory.length - 1]; //this.inventory.shift();

            this.dumpContainersTimer = DUMP_CONTAINERS_DELAY;

            let realCount = 1;

            if (!this.isFastDump) {
                // обычный сброс
                this.engine.camera.popups.popup(item.title + ' +$' + item.price);
                this.money += item.price;
                this.inventory.pop(); // splice(this.inventory.length - 1, 1);
                this.engine.htmlInterface.checkAndSetupUpgradeButton();
            } else {
                // быстрый сброс
                let sameItems = this.getSameInventoryItems(item);

                realCount = sameItems.length - this.getContainersCountByType(item);

                if (realCount > 0) {
                    let price = 0;
                    for (let i = 0; i < realCount; i++) {
                        price += sameItems[i].price;
                    }

                    this.engine.camera.popups.popup(item.title + ' +$' + item.price + ' x ' + realCount + ' = $' + price);
                    this.money += price;

                    for (let i = realCount - 1; i >= 0; i--) {
                        let index = this.inventory.indexOf(sameItems[i]);
                        if (index >= 0) {
                            this.inventory.splice(index, 1);
                        }
                    }

                    this.engine.htmlInterface.checkAndSetupUpgradeButton();
                }
            }

            this.engine.station.spawnContainer(this, item, realCount);
            // auto save when inventory is empty
            if (this.inventory.length === 0) {
                this.engine.htmlInterface.saveGame(false);
            }
        }
    }
}
