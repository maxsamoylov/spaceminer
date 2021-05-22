class BonusController {
    constructor(engine) {
        this.engine = engine;
        this.spawnRadius = WORLD_RADIUS;
        this.spawnTimer = this.getSpawnTimer();

        // бонусные астероиды, раскиданные по миру
        this.asteroids = [];
        for (let i = 0; i < BONUS_COUNT_MAX; i++) {
            this.spawnAsteroid();
        }
    }

    proceed(deltaTime) {
        if (this.spawnTimer > 0) {
            this.spawnTimer -= deltaTime;
        } else if (this.asteroids.length < BONUS_COUNT_MAX) {
            this.spawnAsteroid();
            this.spawnTimer = this.getSpawnTimer();
        }
    }

    spawnAsteroid() {
        let asteroidInfo = getAsteroidInfo(getRandomBonusAsteroidType(this.engine));
        let radius = ASTEROID_FREE_ZONE + this.spawnRadius * Math.sqrt(Math.random());
        let angle = 2 * Math.PI * Math.random();
        let asteroid = new Asteroid(
            this.engine,
            asteroidInfo.name,
            asteroidInfo.asteroidType,
            radius * Math.cos(angle),
            radius * Math.sin(angle)
        );
        this.asteroids.push(asteroid);
        this.engine.world.push(asteroid);
    }

    deleteAsteroid(obj) {
        let index = this.asteroids.indexOf(obj);
        if (index >= 0) {
            this.asteroids.splice(index, 1);
            return true;
        }
        return true;
    }

    getSpawnTimer() {
        return BONUS_SPAWN_TIME_MIN + Math.random() * (BONUS_SPAWN_TIME_MAX - BONUS_SPAWN_TIME_MIN);
    }
}