const w : number = window.innerWidth, h :number = window.innerHeight

const colors : Array<String> = ["#3F51B5", "#00BCD4", "#f44336", "#7C4DFF", "#7B1FA2"]

class ColorBarFillStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(stopcb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            stopcb(this.prevScale)
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class ContainerState {

    j : number = 0

    dir : number = 0

    constructor(private n : number) {

    }

    incrementCounter() {
        this.j += this.dir
        if (this.j == this.n || this.j == -1) {
            this.dir *= -1
        }
    }

    execute(cb : Function) {
        if (this.j < this.n) {
            cb(this.j)
        }
    }
}

class ColorBar {

    state : State = new State()

    constructor(private i : number) {

    }

    draw(context : CanvasRenderingContext2D) {
        const w_size : number = w/5
        const h_size : number = Math.min(w, h)/(2 * colors.length)
        context.fillStyle = colors[this.i]
        context.fillRect(0, this.i * h_size, w_size * this.state.scale, h_size)
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }
}

class ColorBarContainer {

    state : ContainerState = new ContainerState(colors.length)

    colorBars : Array<ColorBar> = []

    constructor() {
        this.initColorBars()
    }

    initColorBars() {
        for (var i = 0; i < colors.length; i++) {
            this.colorBars.push(new ColorBar(i))
        }
    }

    update(stopcb : Function) {
        this.state.execute((j) => {
            this.colorBars[j].update(()=>{
                this.state.incrementCounter()
                stopcb()
            })
        })
    }

    startUpdating(startcb : Function) {
      this.state.execute((j) => {
          this.colorBars[j].startUpdating(startcb)
      })
    }

    draw(context : CanvasRenderingContext2D) {
        this.colorBars.forEach((colorBar) => {
            colorBar.draw(context)
        })
    }
}

class ColorBarAnimator {

    animated : Boolean = false

    interval : number

    start(updatecb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                updatecb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}
