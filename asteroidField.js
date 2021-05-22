/*jshint esversion: 6 */

class AsteroidField {
    constructor(engine, asteroidType, x, y) {
        this.engine = engine;
        this.asteroidType = asteroidType;
        this.x = x;
        this.y = y;
        this.asteroidInfo = this.getAsteroidInfoByType(this.asteroidType);
        // для прочего
        this.radius = ASTEROID_FIELD_RADIUS;
        // для определения видимости
        this.halfWidth = this.radius;
        this.halfHeight = this.radius;
        // для спавнов
        this.spawnRadius = ASTEROID_FIELD_SPAWN_RADIUS;
        this.isOnScreen = false;

        this.asteroids = [];
        for (let i = 0;
             i < FIELD_ASTEROIDS_COUNT_MIN + this.engine.randomInt(FIELD_ASTEROIDS_COUNT_MAX - FIELD_ASTEROIDS_COUNT_MIN);
             i++
        ) {
            this.spawnAsteroid();
        }

        this.spawnTimer = this.getSpawnTimer();
    }


    proceed(deltaTime) {

        // спавн астероидов делать здесь, а вот вертеть не надо, если мы невидимы (камера устанавливает свойство)
        if (this.spawnTimer > 0) {
            this.spawnTimer -= deltaTime;
        } else if (this.asteroids.length < FIELD_ASTEROIDS_COUNT_MAX) {
            this.spawnAsteroid();
            this.spawnTimer = this.getSpawnTimer();
        }

        if (!this.isOnScreen) return;

        for (let asteroid of this.asteroids) {
            asteroid.proceed(deltaTime);
        }
    }

    setAsteroidsNotOnScreen() {
        for (let asteroid of this.asteroids) {
            asteroid.isOnScreen = false;
        }
    }

    // свой спин и скорость он определяет самостоятельно
    spawnAsteroid() {
        let radius = this.spawnRadius * Math.sqrt(Math.random());
        let angle = 2 * Math.PI * Math.random();
        let asteroid = new Asteroid(
            this.engine,
            this.asteroidInfo.name,
            this.asteroidInfo.asteroidType,
            this.x + radius * Math.cos(angle),
            this.y + radius * Math.sin(angle),
            this,
            angle,
            radius
        );
        this.asteroids.push(asteroid);
    }

    // по типу ASTEROID.IRON и подобному, возвращает инфу астероида из константы ASTEROIDINFO
    getAsteroidInfoByType(asteroidType) {
        let result = null;
        for (let info of ASTEROIDINFO) {
            if (asteroidType === info.asteroidType) {
                result = info;
                break;
            }
        }
        return result;
    }

    deleteAsteroid(asteroid) {
        let index = this.asteroids.indexOf(asteroid);
        if (index >= 0) {
            this.asteroids.splice(index, 1);
            //console.log('asteroid deleted');
        }
    }

    getSpawnTimer() {
        return ASTEROID_SPAWN_TIME_MIN + Math.random() * (ASTEROID_SPAWN_TIME_MAX - ASTEROID_SPAWN_TIME_MIN);
    }
}
