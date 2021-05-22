/*jshint esversion: 6 */
///////////////////////////////////////////////////////////////////////////////

// user init
function init(engine) {

    // она сама добавится к engine, будет engine.camera
    let camera = new Camera(engine, null);

    engine.stars = new Stars(engine);

    // это все объекты мира, которые показывает камера, кроме нашего корабля
    engine.world = [];

    let station = new Station(engine, 'station01', 0, 0);
    engine.world.push(station);
    engine.station = station;

    // let asteroid = new Asteroid(engine, 'asteroid01', ASTEROID.ROCK, -100, 200);
    // engine.world.push(asteroid);

    let field = new AsteroidField(engine, ASTEROID.ROCK, 800, -200);
    engine.world.push(field);

    for (let i = 0; i < ASTEROID_FIELDS_COUNT; i++) {
        let radius = ASTEROID_FREE_ZONE + WORLD_RADIUS * Math.sqrt(Math.random());
        let angle = 2 * Math.PI * Math.random();
        let field = new AsteroidField(engine,
            getRandomAsteroidType(engine),
            radius * Math.cos(angle),
            radius * Math.sin(angle)
        );
        engine.world.push(field);
    }

    engine.bonusController = new BonusController(engine);

    engine.ship = new Ship(engine, 'ship', 'fire', 400, 130);
    camera.setTargetObject(engine.ship);
    camera.setStation(station);

    engine.htmlInterface = new HtmlInterface(engine);

    engine.missionsController = new MissionsController(engine);

    // auto load game!
    engine.htmlInterface.loadGame();

    // engine.test = new PopupMessage(engine);
    // engine.test.popup('Hello this is message');
    //engine.test = new Effect(engine, 'explosion', 50, 128, 12, 0.3, false);
}

// user logic
function logic(engine, deltaTime) {
    engine.ship.proceed(deltaTime);
    //engine.test.proceed(deltaTime);

    for (let obj of engine.world) {
        obj.proceed(deltaTime);

        if (obj.isOnScreen) {
            if (obj.asteroids) {
                // это поле астероидов и оно на экране - проверяем коллизии с его астероидами
                for (let asteroid of obj.asteroids) {
                    if (engine.ship.isCollided(asteroid)) {
                        // коллизия с астероидом астероидного поля

                    }
                    if (engine.ship.isMagnetCollided(asteroid)) {
                        // астероид в магнитном поле корабля
                        engine.ship.catchObject(asteroid);
                    }
                }
            } else {
                if (engine.ship.isCollided(obj)) {
                    // коллизия с обычным объектом (что угодно кроме поля астероидов)
                    //console.log('collision');
                }
                if (engine.ship.isMagnetCollided(obj)) {
                    // обычный объект в магнитном поле корабля (что угодно кроме поля астероидов)
                    engine.ship.catchObject(obj);
                }
            }
        }
    }

    // разгрузка корабля в станцию
    if (engine.ship.isStationMargetCollided(engine.station)) {
        engine.ship.dumpContainersToStation(deltaTime);
    }

    // контроль спавна бонусов
    engine.bonusController.proceed(deltaTime);

    // missions
    if (engine.ship.isMissionsEnabled) {
        engine.missionsController.proceed(deltaTime);
    }

    // proceed popup messages
    engine.camera.popups.proceed(deltaTime);
}

// user render
function render(engine, deltaTime) {

    engine.camera.drawWorld();

    //engine.textOut(10, 80, engine.ship.money);
    // engine.textOut(10, 100, engine.camera.isObjectOnScreen(engine.world[0]).toString());
}

///////////////////////////////////////////////////////////////////////////////

window.onload = () => {

    const engine = new Engine2d(
        document.getElementById('canvas1'),
        [
            'images/banana.png',
            'images/star.png',
            'images/ship.png',
            'images/station01.png',
            'images/station02.png',
            'images/asteroid01.png',
            'images/asteroid02.png',
            'images/asteroid03.png',
            'images/asteroid04.png',
            'images/asteroid05.png',
            'images/asteroid06.png',
            'images/asteroid07.png',
            'images/asteroid08.png',
            'images/asteroid09.png',
            'images/asteroid10.png',
            'images/asteroid_bonus01.png',
            'images/asteroid_bonus02.png',
            'images/asteroid_bonus03.png',
            'images/fire.png',
            'images/arrow.png',
            'images/arrowBlue.png',
            'images/sparkles.png',
            'images/explosion.png',
            'images/container.png',
            'images/container1.png',
            'images/container2.png',
            'images/alien.png',
        ],
        {
            wholeWindow: true,
        },
        init,
        logic,
        render
    );

    // for debug
    e = engine;
};
