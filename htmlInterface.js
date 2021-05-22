class HtmlInterface {
    constructor(engine) {
        this.engine = engine;
        this.upgradeButton = document.getElementById('upgradeButton');
        this.fullScreenWindow = document.getElementById('fullscreen');
        this.upgradeMenu = document.getElementById('upgradeMenu');
        this.mainMenu = document.getElementById('mainMenu');
        this.helpMenu = document.getElementById('helpMenu');
        this.okButton = document.getElementById('okButton');
        this.resumeButton = document.getElementById('resumeButton');
        this.helpOkButton = document.getElementById('helpOk');
        this.saveButton = document.getElementById('saveGame');
        this.loadButton = document.getElementById('loadGame');
        this.deleteSaveButton = document.getElementById('deleteSave');
        this.mainMenuButton = document.getElementById('mainMenuButton');
        this.helpButton = document.getElementById('helpButton');

        this.moneyShowDiv = document.getElementById('moneyShow');

        this.buttons = [
            {
                button: document.getElementById('speed'),
                valueDiv: document.getElementById('speed').parentNode.parentNode.children[1],
                price: 70,
                startPrice: 70,
                multiplier: 1.08,
                maxUpgrades: Math.floor((600 - SHIP_START_SPEED) / 10), // 600 max!
                addValue: 10,
                propertyName: 'speedMax',
                upgradeCountPropertyName: 'upgradesSpeed',
            },
            {
                button: document.getElementById('magnetRadius'),
                valueDiv: document.getElementById('magnetRadius').parentNode.parentNode.children[1],
                price: 50,
                startPrice: 50,
                multiplier: 1.35,
                maxUpgrades: 20,    // смотри метод loadGame() - там фикс старого слишком большого значения
                addValue: 10,
                propertyName: 'radiusMagnet',
                upgradeCountPropertyName: 'upgradesMagnetRadius',
            },
            {
                button: document.getElementById('magnetPower'),
                valueDiv: document.getElementById('magnetPower').parentNode.parentNode.children[1],
                price: 80,
                startPrice: 80,
                multiplier: 1.08,
                maxUpgrades: 100,
                addValue: 20,
                propertyName: 'minePower',
                upgradeCountPropertyName: 'upgradesMagnetPower',
            },
            {
                button: document.getElementById('magnetsCount'),
                valueDiv: document.getElementById('magnetsCount').parentNode.parentNode.children[1],
                price: 250,
                startPrice: 250,
                multiplier: 1.2,
                maxUpgrades: 23,
                addValue: 1,
                propertyName: 'miners',
                upgradeCountPropertyName: 'upgradesMagnetsCount',
            },
            {
                button: document.getElementById('inventoryCapacity'),
                valueDiv: document.getElementById('inventoryCapacity').parentNode.parentNode.children[1],
                price: 60,
                startPrice: 60,
                multiplier: 1.12,
                maxUpgrades: 200,
                addValue: 1,
                propertyName: 'inventoryMaxSize',
                upgradeCountPropertyName: 'upgradesInventoryCapacity',
            },
            {
                button: document.getElementById('fastDump'),
                valueDiv: document.getElementById('fastDump').parentNode.parentNode.children[1],
                price: 15000,
                startPrice: 15000,
                multiplier: 1,
                maxUpgrades: 1,
                addValue: 1,
                propertyName: 'isFastDump',
                upgradeCountPropertyName: 'upgradesFastDump',
            },
            {
                button: document.getElementById('missions'),
                valueDiv: document.getElementById('missions').parentNode.parentNode.children[1],
                price: 30000,
                startPrice: 30000,
                multiplier: 1,
                maxUpgrades: 1,
                addValue: 1,
                propertyName: 'isMissionsEnabled',
                upgradeCountPropertyName: 'upgradesMissions',
            },
        ];

        // обработчики нажатия на кнопку апгрейда
        for (let button of this.buttons) {
            button.button.addEventListener('click', (event) => {
                let buttonItem = this.buttons[event.target.dataset['index']];
                this.engine.ship[buttonItem.propertyName] += buttonItem.addValue;
                this.engine.ship.money -= buttonItem.price;
                if (this.engine.ship.money < 0) {
                    this.engine.ship.money = 0;
                }
                this.engine.ship[buttonItem.upgradeCountPropertyName]++;
                //console.log(this.engine.ship[buttonItem.upgradeCountPropertyName], buttonItem.maxUpgrades);
                this.setUpgradeMenuParams();
                this.checkAndSetupUpgradeButton();
                this.saveGame(false);
            });
        }

        // upgrade menu
        this.upgradeButton.addEventListener('click', () => {
            this.showUpgradeMenu();
        });

        // upgrade OK
        this.okButton.addEventListener('click', () => {
            this.hide();
        });

        this.mainMenuButton.addEventListener('click', () => {
            this.loadButton.disabled = (localStorage.getItem('save') === null);
            this.deleteSaveButton.disabled = this.loadButton.disabled;
            this.showMainMenu();
        });

        this.resumeButton.addEventListener('click', () => {
            this.hide();
        });

        this.helpButton.addEventListener('click', () => {
            this.show(this.helpMenu);
        });

        this.helpOkButton.addEventListener('click', () => {
            this.hide();
        });

        this.saveButton.addEventListener('click', () => {
            this.saveGame();
            this.hide();
        });

        this.loadButton.addEventListener('click', () => {
            this.loadGame();
            this.hide();
        });

        this.deleteSaveButton.addEventListener('click', () => {
            this.deleteSave();
            this.loadButton.disabled = true;
            this.deleteSaveButton.disabled = true;
        });

        this.setUpgradeMenuParams();
        this.checkAndSetupUpgradeButton();
    }

    deleteSave() {
        localStorage.removeItem('save');
        this.engine.camera.popups.popup('Save deleted!');
    }

    saveGame(withMessage = true) {
        let saveObject = {
            ship: {},
            missions: {},
            inventory: []
        };

        for (let key in this.engine.ship) {
            if (this.engine.ship.hasOwnProperty(key)
                && typeof this.engine.ship[key] !== 'function'
                && typeof this.engine.ship[key] !== 'object'
            ) {
                saveObject.ship[key] = this.engine.ship[key];
            }
        }

        for (let key in this.engine.missionsController) {
            if (this.engine.missionsController.hasOwnProperty(key)
                && typeof this.engine.missionsController[key] !== 'function'
                && typeof this.engine.missionsController[key] !== 'object'
            ) {
                saveObject.missions[key] = this.engine.missionsController[key];
            }
        }
        if (this.engine.missionsController.asteroidInfo) {
            saveObject.missions['asteroidType'] = this.engine.missionsController.asteroidInfo.asteroidType;
        }

        for (let item of this.engine.ship.inventory) {
            saveObject.inventory.push(item.asteroidType);
        }

        localStorage.setItem('save', JSON.stringify(saveObject));

        if (withMessage) {
            this.engine.camera.popups.popup('Game saved!');
        }
    }

    loadGame() {
        let save = localStorage.getItem('save');

        if (save) {
            save = JSON.parse(save);

            for (let key in save.ship) {
                if (save.ship.hasOwnProperty(key)) {
                    this.engine.ship[key] = save.ship[key];
                }
            }

            if (save.missions) {
                for (let key in save.missions) {
                    if (save.missions.hasOwnProperty(key)) {
                        if (key === 'asteroidType') {
                            this.engine.missionsController.asteroidInfo = getAsteroidInfo(save.missions.asteroidType);
                        } else {
                            this.engine.missionsController[key] = save.missions[key];
                        }
                    }
                }
            }

            this.engine.ship.inventory = [];
            for (let item of save.inventory) {
                this.engine.ship.inventory.push(getAsteroidInfo(item));
            }

            // fix radius magnet
            if (this.engine.ship.radiusMagnet > 305 && this.engine.ship.upgradesMagnetRadius > 20) {
                this.engine.ship.radiusMagnet = 305;
                this.engine.ship.upgradesMagnetRadius = 20;
            }

            this.setUpgradeMenuParams();
            this.checkAndSetupUpgradeButton();
            this.engine.camera.popups.popup('Game loaded!');
        }
    }

    show(menu) {
        this.engine.stop();
        this.fullScreenWindow.style.display = 'flex';
        this.upgradeMenu.style.display = 'none';
        this.mainMenu.style.display = 'none';
        this.helpMenu.style.display = 'none';
        menu.style.display = 'block';
    }

    showMainMenu() {
        this.show(this.mainMenu);
    }

    showUpgradeMenu() {
        this.setUpgradeMenuParams();
        this.show(this.upgradeMenu);
    }

    showHelpMenu() {
        this.show(this.helpMenu);
    }

    hide() {
        this.fullScreenWindow.style.display = 'none';
        this.upgradeMenu.style.display = 'none';
        this.mainMenu.style.display = 'none';
        this.helpMenu.style.display = 'none';
        this.engine.start();
    }

    getPrice(startPrice, multiplyCount, multiplier) {
        let result = startPrice;
        for (let i = 0; i < multiplyCount; i++) {
            result *= multiplier;
        }

        // ограничиваю цену 10к
        if (startPrice < 9999 && result > 9999) {
            result = 9999;
        }

        return Math.floor(result);
    }

    getPriceText(upgradeCount, maxUpgradeCount, price) {
        return (upgradeCount >= maxUpgradeCount ? 'MAX' : price);
    }

    checkAndSetupUpgradeButton() {
        let result = true;
        for (let button of this.buttons) {
            if (button.price <= this.engine.ship.money
                && button.maxUpgrades > this.engine.ship[button.upgradeCountPropertyName]
            ) {
                result = false;
                break;
            }
        }
        if (this.upgradeButton.disabled !== result) {
            this.upgradeButton.disabled = result;
        }
    }

    setUpgradeMenuParams() {
        this.buttons[0].valueDiv.textContent = this.engine.ship.speedMax.toString();
        this.buttons[0].price = this.getPrice(
            this.buttons[0].startPrice,
            this.engine.ship.upgradesSpeed,
            this.buttons[0].multiplier
        );
        this.buttons[0].button.textContent = this.getPriceText(
            this.engine.ship.upgradesSpeed,
            this.buttons[0].maxUpgrades,
            this.buttons[0].price
        );
        this.buttons[0].button.disabled = (this.engine.ship.money < this.buttons[0].price
            || this.engine.ship.upgradesSpeed >= this.buttons[0].maxUpgrades
        );

        this.buttons[1].valueDiv.textContent = this.engine.ship.radiusMagnet.toString();
        this.buttons[1].price = this.getPrice(
            this.buttons[1].startPrice,
            this.engine.ship.upgradesMagnetRadius,
            this.buttons[1].multiplier
        );
        this.buttons[1].button.textContent = this.getPriceText(
            this.engine.ship.upgradesMagnetRadius,
            this.buttons[1].maxUpgrades,
            this.buttons[1].price
        );
        this.buttons[1].button.disabled = (this.engine.ship.money < this.buttons[1].price
            || this.engine.ship.upgradesMagnetRadius >= this.buttons[1].maxUpgrades
        );

        this.buttons[2].valueDiv.textContent = this.engine.ship.minePower.toString();
        this.buttons[2].price = this.getPrice(
            this.buttons[2].startPrice,
            this.engine.ship.upgradesMagnetPower,
            this.buttons[2].multiplier
        );
        this.buttons[2].button.textContent = this.getPriceText(
            this.engine.ship.upgradesMagnetPower,
            this.buttons[2].maxUpgrades,
            this.buttons[2].price
        );
        this.buttons[2].button.disabled = (this.engine.ship.money < this.buttons[2].price
            || this.engine.ship.upgradesMagnetPower >= this.buttons[2].maxUpgrades
        );

        this.buttons[3].valueDiv.textContent = this.engine.ship.miners.toString();
        this.buttons[3].price = this.getPrice(
            this.buttons[3].startPrice,
            this.engine.ship.upgradesMagnetsCount,
            this.buttons[3].multiplier
        );
        this.buttons[3].button.textContent = this.getPriceText(
            this.engine.ship.upgradesMagnetsCount,
            this.buttons[3].maxUpgrades,
            this.buttons[3].price
        );
        this.buttons[3].button.disabled = (this.engine.ship.money < this.buttons[3].price
            || this.engine.ship.upgradesMagnetsCount >= this.buttons[3].maxUpgrades
        );

        this.buttons[4].valueDiv.textContent = this.engine.ship.inventoryMaxSize.toString();
        this.buttons[4].price = this.getPrice(
            this.buttons[4].startPrice,
            this.engine.ship.upgradesInventoryCapacity,
            this.buttons[4].multiplier
        );
        this.buttons[4].button.textContent = this.getPriceText(
            this.engine.ship.upgradesInventoryCapacity,
            this.buttons[4].maxUpgrades,
            this.buttons[4].price
        );
        this.buttons[4].button.disabled = (this.engine.ship.money < this.buttons[4].price
            || this.engine.ship.upgradesInventoryCapacity >= this.buttons[4].maxUpgrades
        );

        this.buttons[5].valueDiv.textContent = this.engine.ship.isFastDump.toString();
        this.buttons[5].price = this.getPrice(
            this.buttons[5].startPrice,
            this.engine.ship.upgradesFastDump,
            this.buttons[5].multiplier
        );
        this.buttons[5].button.textContent = this.getPriceText(
            this.engine.ship.upgradesFastDump,
            this.buttons[5].maxUpgrades,
            this.buttons[5].price
        );
        this.buttons[5].button.disabled = (this.engine.ship.money < this.buttons[5].price
            || this.engine.ship.upgradesFastDump >= this.buttons[5].maxUpgrades
        );

        this.buttons[6].valueDiv.textContent = this.engine.ship.isMissionsEnabled.toString();
        this.buttons[6].price = this.getPrice(
            this.buttons[6].startPrice,
            this.engine.ship.upgradesMissions,
            this.buttons[6].multiplier
        );
        this.buttons[6].button.textContent = this.getPriceText(
            this.engine.ship.upgradesMissions,
            this.buttons[6].maxUpgrades,
            this.buttons[6].price
        );
        this.buttons[6].button.disabled = (this.engine.ship.money < this.buttons[6].price
            || this.engine.ship.upgradesMissions >= this.buttons[6].maxUpgrades
        );

        this.moneyShowDiv.textContent = '$' + this.engine.ship.money;
    }
}
