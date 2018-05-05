const w : number = window.innerWidth, h :number = window.innerHeight

const colors : Array<String> = ["#3F51B5", "#00BCD4", "#f44336", "#7C4DFF", "#7B1FA2"]

class ColorBarFillStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    animator : ColorBarAnimator = new ColorBarAnimator()

    colorBarContainer : ColorBarContainer = new ColorBarContainer()

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
        this.colorBarContainer.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.colorBarContainer.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.colorBarContainer.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }
}

class State {
    scale : number = 0
    dir : number = 0
    deg : number = 0
    prevDeg : number = 0

    update(stopcb : Function) {
        this.deg += this.dir * Math.PI/20
        this.scale = Math.sin(this.deg)
        if (Math.abs(this.deg - this.prevDeg) > Math.PI/2) {
            this.deg = this.prevDeg + Math.PI/2 * this.dir
            this.dir = 0
            this.prevDeg = this.deg
            this.scale = Math.sin(this.deg)
            stopcb()
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.scale
            startcb()
        }
    }
}

class ContainerState {

    j : number = 0

    dir : number = 1

    constructor(private n : number) {

    }

    incrementCounter() {
        this.j += this.dir
        if (this.j == this.n || this.j == -1) {
            this.dir *= -1
            this.j += this.dir
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
        context.save()
        context.translate(w/2 - w/10, h/2 - h/10)
        this.colorBars.forEach((colorBar) => {
            colorBar.draw(context)
        })
        context.restore()
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

const initColorBarContainer : Function = () => {
    const stage : ColorBarFillStage = new ColorBarFillStage()
    stage.render()
    stage.handleTap()
}
