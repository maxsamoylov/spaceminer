/*jshint esversion: 6 */

// загружает изображения
// после загрузки каждого вызывает onLoadProgress(проценты загрузки, количество загруженных, изображений всего)
// после полной загрузки вызывает onLoadComplete(массив с объектами Image)
// если массива нет или он пустой - вызывает onLoadComplete([])
// любые аргументы конструктора могут быть undefined
class ImagesLoader{
    constructor(names, onLoadComplete, onLoadProgress) {

        this.names = names;
        this.onLoadComplete = onLoadComplete;
        this.onLoadProgress = onLoadProgress;

        this.counter = 0;

        this.images = [];
        if (Array.isArray(this.names) && this.names.length > 0) {

            this.names.forEach(name => {
                const image = new Image();
                image.addEventListener('load', this.onImageLoad.bind(this), { once: true });
                this.images.push(image);
                image.src = name;
            });
        } else {
            this.onImageLoad();
        }

    }

    onImageLoad() {
        this.counter++;
        if (typeof this.onLoadProgress === 'function' && this.images.length > 0) {
            // (проценты загрузки, количество загруженных, изображений всего)
            this.onLoadProgress(
                100 / this.images.length * this.counter,
                this.counter,
                this.images.length
            );
        }
        if (this.counter >= this.images.length && typeof this.onLoadComplete === 'function') {
            // (массив с объектами Image)
            this.onLoadComplete(this.images);
        }
    }
}

class Image2d {
    constructor(image, width = 0, height = 0, angle = 0) {
        this.image = image;
        this.angle = angle;
        this.setSize(width, height);
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y);
        //drawImage(image, x, y, width, height) w, h - destination resolution of whole image
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight); s - source region, d - destination region
    }

    drawRotated(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.angle);
        ctx.translate(this.negativeHalfWidth, this.negativeHalfHeight);
        ctx.drawImage(this.image, 0, 0, this.width, this.height);

        ctx.restore();
    }

    // радианы, плюсовой - по часовой
    rotate(angle) {
        this.angle += angle;
    }

    setRotation(angle) {
        this.angle = angle;
    }

    setSize(width, height) {
        this.width = width ? width : this.image.width;
        this.height = height ? height : this.image.height;
        this.negativeHalfWidth = -this.width / 2;
        this.negativeHalfHeight = -this.height / 2;
    }
}

class Mouse
{
    constructor(canvas)
    {
        this._init();

        this.canvas = canvas;

        this.isPressing = false; // для тачей

        this.canvas.addEventListener('mousemove', (event) => {
            this._update(event.clientX, event.clientY);
        });

        this.canvas.addEventListener('touchmove', (event) => {
            if (event.changedTouches.length !== 1 || !this.isPressing) return;
            event.stopPropagation();
            this._update(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        });

        this.canvas.addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            switch (event.button) {
                case 0: this.isButtonLeft = true; break;
                case 2: this.isButtonRight = true; break;
                default: this.isButtonMiddle = true;
            }
        });

        this.canvas.addEventListener('touchstart', (event) => {
            if (event.changedTouches.length !== 1 || this.isPressing) return;
            event.preventDefault();
            event.stopPropagation();
            this.isButtonLeft = true;
            this.isPressing = true;
        });

        this.canvas.addEventListener('mouseup', (event) => {
            event.preventDefault();
            event.stopPropagation();
            switch (event.button) {
                case 0: this.isButtonLeft = false; break;
                case 2: this.isButtonRight = false; break;
                default: this.isButtonMiddle = false;
            }
        });

        this.canvas.addEventListener('touchend', (event) => {
            if (event.changedTouches.length > 1 || !this.isPressing) return;
            event.preventDefault();
            event.stopPropagation();
            this.isButtonLeft = false;
            this.isPressing = false;
        });

        this.canvas.addEventListener('touchcancel', (event) => {
            if (event.changedTouches.length !== 0 || !this.isPressing) return;
            this.isPressing = false;
            this.isButtonLeft = false;
        });

        // отключаю контекстное меню
        this.canvas.oncontextmenu = () => { return false; }
    }

    getCenterX() {
        return Math.round(this.x - this.canvas.width / 2);
    }

    getCenterY() {
        return Math.round(this.y - this.canvas.height / 2);
    }

    _update(newX, newY)
    {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x = Math.floor(newX);
        this.y = Math.floor(newY);
        this.deltaX = this.x - this.prevX;
        this.deltaY = this.y - this.prevY;
    }

    _init()
    {
        this.isButtonLeft = false;
        this.isButtonMiddle = false;
        this.isButtonRight = false;
        this.x = 0;
        this.y = 0;
        this.prevX = 0;
        this.prevY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
    }
}

// простой 2d движок
// canvas: элемент canvas,
// imageNames: массив имён изображений,
// options: опции движка
// initCallback(engine2d): юзерская инициализация (вызывается когда все изображения загружены, прямо перед запуском рендера),
// logicCallback(engine2d, deltaTime): юзерская логика
// renderCallback(engine2d, deltaTime): юзерский рендер
class Engine2d {
    constructor(canvas, imageNames, options, initCallback, logicCallback, renderCallback) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.initCallback = initCallback;
        this.logicCallback = logicCallback;
        this.renderCallback = renderCallback;

        this.wholeWindow = false;
        this.autoStart = true;
        this.fillColor = 'black';
        this.brushColor = 'white';
        this.showFps = true;

        this.world = [];
        this.ship = null;
        this.station = null;
        this.camera = null;
        this.bonusController = null;
        this.htmlInterface = null;
        this.stars = null;
        this.missionsController = null;

        this.mouse = new Mouse(this.canvas);

        if (typeof options === 'object') {
            // если всё пространство окна - вешаем обработчик onResize
            if (options.wholeWindow) {
                this.wholeWindow = options.wholeWindow;
                if (this.wholeWindow) {
                    window.addEventListener('resize', () => {
                        this.onResize_();
                    });
                    this.onResize_();
                }
            }

            // если стартуем автоматически после загрузки изображений
            if (options.autoStart) {
                this.autoStart = options.autoStart;
            }

            // цвет заливки канваса при очистке на каждом кадре
            if (options.fillColor) {
                this.fillColor = options.fillColor;
            }

            if (options.brushColor) {
                this.brushColor = options.brushColor;
            }

            if (options.showFps) {
                this.showFps = options.showFps;
            }
        }

        this.deltaTime = 0.01;
        this.previousTimestamp = performance.now();

        // if true - continuous rendering
        this.active = false;

        // true when images loading finished
        this.ready = false;

        // animation frame request
        this.raf = null;

        // set text params defaults
        this.setTextParams();

        this.images = new Map();

        this.imagesLoader = new ImagesLoader(
            imageNames,
            this.onLoadComplete_.bind(this),
            this.onLoadProgress_.bind(this)
        );

    }

    render(timestamp) {

        // deltatime calculations
        this.deltaTime = timestamp - this.previousTimestamp;
        if (this.deltaTime < 1) this.deltaTime = 1;
        if (this.deltaTime > 50) this.deltaTime = 50;
        this.deltaTime /= 1000.0;
        this.previousTimestamp = timestamp;

        // clear ctx
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.strokeStyle = this.brushColor;
        //this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // user callbacks
        if (this.logicCallback) this.logicCallback(this, this.deltaTime);
        if (this.renderCallback) this.renderCallback(this, this.deltaTime);

        // fps
        if (this.showFps) {
            this.setTextParams();
            this.textOut(10, 20, Math.round(1.0 / this.deltaTime) + ' fps');
            //this.textOut(10, 40, this.mouse.x + ', ' + this.mouse.y);
            //this.textOut(10, 60, this.mouse.getCenterX() + ', ' + this.mouse.getCenterY() + ' ' + this.mouse.isButtonLeft.toString());
        }

        // request next frame
        if (this.active) this.raf = requestAnimationFrame(this.render.bind(this));

    }

    start() {
        this.previousTimestamp = performance.now() - 100;
        this.active = true;
        this.raf = requestAnimationFrame(this.render.bind(this));
    }

    stop() {
        this.active = false;
    }

    // возвращает объект Image2d по имени (без раширения файла)
    image2d(name) {
        return this.images.get(name);
    }

    // возвращает объект Image2d по имени (без раширения файла)
    getImage2d(name) {
        return this.images.get(name);
    }

    getCtx() {
        return this.ctx;
    }

    drawImage(name, x, y) {
        const image2d = this.images.get(name);
        if (image2d) image2d.draw(this.ctx, x, y);
    }

    deleteWorldObject(obj) {
        let index = this.world.indexOf(obj);
        if (index >= 0) {
            this.world.splice(index, 1);
            // оно там само разберется астероид ли это и есть ли он у него
            this.bonusController.deleteAsteroid(obj);
            //console.log('world object deleted');
        }
    }

    drawImageRotated(name, x, y) {
        const image2d = this.images.get(name);
        if (image2d) image2d.drawRotated(this.ctx, x, y);
    }

    getCanvasWidth() {
        return this.canvas.width;
    }

    getCanvasHeight() {
        return this.canvas.height;
    }

    textOut(x, y, text)
    {
        this.ctx.font = this.fontString;
        this.ctx.fillStyle = this.textColor;
        this.ctx.textBaseLine = this.textBaseline;
        this.ctx.textAlign = this.textAlign;
        this.ctx.fillText(text, x, y);
    }

    setTextParams(size = 16, textColor = 'white', textAlign = 'left', textBaseline = 'middle', font = 'Roboto') {
        this.setFontString(font, size);
        this.textColor = textColor;
        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
    }

    setTextParamsObject(options) {
        if (options.font) { this.setFontString(options.font, this.fontSize); }
        if (options.size) { this.setFontSize(this.font, options.size); }
        if (options.color) { this.textColor = options.color; }
        if (options.align) { this.textAlign = options.align; }
        if (options.baseLine) { this.textBaseline = options.baseLine; }
    }

    setFontString(font = 'Roboto', size = 16) {
        this.font = font;
        this.fontSize = size;
        this.fontString = size + 'px ' + font;
    }

    setFont(font) {
        this.font = font;
        this.setFontString(font, this.fontSize);
    }

    setFontSize(size) {
        this.fontSize = size;
        this.setFontString(this.font, size);
    }

    setTextColor(color) {
        this.color = color;
    }

    setTextAlign(align) {
        this.textAlign = align;
    }

    setTextBaseline(baseLine) {
        this.textBaseline = baseLine;
    }

    // 0 .. (n - 1)
    randomInt(n) {
        return Math.floor(Math.random() * n);
    }

    getNormalizedVector(x, y) {
        let magnitude = Math.sqrt(x * x + y * y);
        return { x: x / magnitude, y: y / magnitude, magnitude: magnitude };
    }

    getRandomVector() {
        return this.getNormalizedVector(1 - Math.random() * 2, 1 - Math.random() * 2);
    }

    // добавляет объекты Image2d в Map this.images под именами файлов без раширения
    onLoadComplete_(images) {
        for (const image of images) {
            const image2d = new Image2d(image);
            let name = image.src.split('/').pop();
            name = name.split('.').shift();
            this.images.set(name, image2d);
        }

        this.ready = true;

        if (this.initCallback) this.initCallback(this);

        if (this.autoStart) this.start();
    }

    onLoadProgress_(percent, loaded, total) {
        console.log('progress', percent, loaded, total);
    }

    onResize_() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.canvas.halfWidth = this.canvas.width / 2;
        this.canvas.halfHeight = this.canvas.height / 2;
    }
}
