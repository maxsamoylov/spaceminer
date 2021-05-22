const ASTEROID = Object.freeze({
    ROCK: 10,
    WATER: 20,
    IRON: 30,
    COPPER: 40,
    ALUMINIUM: 50,
    NICKEL: 60,
    SILVER: 70,
    GOLD: 80,
    VANADIUM: 90,
    GEMS: 100,
    BONUS1: 200, // бонусные должны быть после обычных, нужно для определения обычный это астероид или бонусный
    BONUS2: 210,
    BONUS3: 220
});

const ObjectTypes = Object.freeze({
    ASTEROID: 10,
    STATION: 20,
    BONUS_ASTEROID: 30,
    ENEMY: 40,
});

const
    // реальный размер мира - WORLD_RADIUS + ASTEROID_FREE_ZONE
    WORLD_RADIUS = 10000,
    ASTEROID_FREE_ZONE = 800,

    SHIP_START_SPEED = 200, // 500,
    SHIP_SIZE = 100,

    ASTEROID_FIELD_RADIUS = 350,
    ASTEROID_FIELD_SPAWN_RADIUS = 300,
    ASTEROID_FIELDS_COUNT = 170,
    ASTEROID_SPAWN_TIME_MIN = 3,    // seconds
    ASTEROID_SPAWN_TIME_MAX = 10,
    FIELD_ASTEROIDS_COUNT_MIN = 8,  // при создании мира минимальное количество астероидов в облаке
    FIELD_ASTEROIDS_COUNT_MAX = 25, // максимальное количество сколько может быть наспавнено

    CONTAINER_NAME = 'container',
    DUMP_CONTAINERS_DELAY = 0.2,

    BONUS_COUNT_MAX = 30,
    BONUS_SPAWN_TIME_MIN = 30,
    BONUS_SPAWN_TIME_MAX = 90,

    MISSION_TIME = 90,
    MISSION_PAUSE_TIME = 6,        // время когда нет миссий, должен быть больше 3

    DEBUG = false;


// возвращает рандомный тип астероидов, обратить внимание, что их 10, а не 13 - остальные бонусные
// при изменении количества здесь надо поменять константу
function getRandomAsteroidType(engine) {
    let index = engine.randomInt(10);
    let result = null;
    for (let a in ASTEROID) {
        if (index === 0) {
            result = a;
            break;
        }
        index--;
    }
    return ASTEROID[result];
}

function getRandomBonusAsteroidType(engine) {
    let index = 10 + engine.randomInt(3);
    let result = null;
    for (let a in ASTEROID) {
        if (index === 0) {
            result = a;
            break;
        }
        index--;
    }
    return ASTEROID[result];
}

function getAsteroidInfo(asteroidType) {
    let result = null;
    for (let info of ASTEROIDINFO) {
        if (info.asteroidType === asteroidType) {
            result = info;
            break;
        }
    }
    return result;
}

class AsteroidInfo {
    constructor(asteroidType, health, name, price, title) {
        this.asteroidType = asteroidType;
        this.health = health;
        this.price = price;
        this.name = name;
        this.title = title;
    }
}

const ASTEROIDINFO = [
    new AsteroidInfo(ASTEROID.ROCK,      100,  'asteroid01', 5,   'Rock'),
    new AsteroidInfo(ASTEROID.WATER,     150,  'asteroid02', 12,  'Water'),
    new AsteroidInfo(ASTEROID.IRON,      200,  'asteroid03', 20,  'Iron'),
    new AsteroidInfo(ASTEROID.COPPER,    300,  'asteroid04', 30,  'Copper'),
    new AsteroidInfo(ASTEROID.ALUMINIUM, 400,  'asteroid05', 40,  'Aluminium'),
    new AsteroidInfo(ASTEROID.NICKEL,    550,  'asteroid06', 55,  'Nickel'),
    new AsteroidInfo(ASTEROID.SILVER,    700,  'asteroid07', 70,  'Silver'),
    new AsteroidInfo(ASTEROID.GOLD,      950,  'asteroid08', 90,  'Gold'),
    new AsteroidInfo(ASTEROID.VANADIUM,  1200, 'asteroid09', 110, 'Vanadium'),
    new AsteroidInfo(ASTEROID.GEMS,      1600, 'asteroid10', 150, 'Gems'),

    // суть в том, что много денег и быстро пилятся
    new AsteroidInfo(ASTEROID.BONUS1,    300, 'asteroid_bonus01', 1000, 'Radioactives'),
    new AsteroidInfo(ASTEROID.BONUS2,    300, 'asteroid_bonus02', 1000, 'Rare elements'),
    new AsteroidInfo(ASTEROID.BONUS3,    300, 'asteroid_bonus03', 1000, 'Rhodium'),
];
