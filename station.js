/*jshint esversion: 6 */

class Station extends Sprite {
    constructor(engine, name, x, y) {
        super(engine, name, x, y, 400, Math.random() * Math.PI);

        this.objectType = ObjectTypes.STATION;
        this.rotationSpeed = 0.2;
        // для столкновений и прочего
        this.radius = this.halfWidth * 0.8;

        this.radiusMagnet = Math.round(this.radius * 1.9);

        // контейнеры которые летят из корабля к станции
        this.containers = [];
    }

    proceed(deltaTime) {
        this.rotate(this.rotationSpeed * deltaTime);

        // containers
        for (let container of this.containers) {
            container.proceed(deltaTime);
        }
    }

    spawnContainer(obj, item, quantity) {
        //console.log(quantity, item);
        this.containers.push(new Container(this.engine, CONTAINER_NAME, obj.x, obj.y, this, (item.info ? item.info : null)));
        if (this.engine.ship.isMissionsEnabled) {
            this.engine.missionsController.stationReceivedItem(item, quantity);
        }
    }

    deleteContainer(obj) {
        let index = this.containers.indexOf(obj);
        if (index >= 0) {
            this.containers.splice(index, 1);
            //console.log('station container deleted');
        }
    }

    drawContainers(leftX, leftY) {
        for (let container of this.containers) {
            container.draw(leftX, leftY);
        }
    }
}
