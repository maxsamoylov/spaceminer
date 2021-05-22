class Stars {
    constructor(engine) {
        this.engine = engine;
        this.ctx = this.engine.ctx;
        this.canvas = this.engine.canvas;
        this.canvasData = null;
        this.buffer32 = null;
        this.fillColor = 0xff000000; // в методе generate определяем какой именно цвет нужен

        this.stars = null;

        this.timeOutHandler = null;

        window.addEventListener('resize', () => {
            if (this.timeOutHandler) {
                clearTimeout(this.timeOutHandler);
            }
            this.timeOutHandler = setTimeout(() => {
                this.generate();
            }, 100);
        });

        this.generate();
    }

    draw(cameraLeftX, cameraLeftY) {

        // this.buffer32.fill(this.fillColor);
        //
        // for (let star of this.stars) {
        //     this.buffer32[star.x + star.y * this.canvas.width] = 0xffffffff;
        // }

        this.canvasData.data.set(this.buffer8);
        this.ctx.putImageData(this.canvasData, 0, 0);
    }

    generate() {
        this.canvasData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let buffer = new ArrayBuffer(this.canvasData.data.length);
        this.buffer8 = new Uint8ClampedArray(buffer);
        this.buffer32 = new Uint32Array(buffer);

        // здесь не все поймут, поэтому. на разных операционках порядок байтов в памяти для многобайтных
        // типов может быть разным. здесь я определеяю какой порядок байтов в данном случае
        // если этим пренебречь, то можно будет наблюдать интересные эффекты на каком-нибудь андроиде или линухе или винде
        // javascript кроссплатформенный язык, но здесь мы опускаемся в удивительно низкий уровень, поэтому так
        this.buffer32[0] = 0x0a0b0c0d;
        this.fillColor = (this.buffer8[0] === 0x0d ? 0xff000000 : 0x000000ff);

        this.buffer32.fill(this.fillColor);

        // количество звёзд вычисляю от размеров канваса
        let count = Math.floor(this.canvas.width * this.canvas.height * 0.0005); // 0.00015
        this.stars = [];

        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: this.engine.randomInt(this.canvas.width),
                y: this.engine.randomInt(this.canvas.height)
            })
        }

        // рисуем их единожды и потом просто буфер перекидываем на экран
        // массив со звездами пока сохраню, пусть будет
        for (let star of this.stars) {
            this.buffer32[star.x + star.y * this.canvas.width] = 0xffffffff;
        }
    }
}
