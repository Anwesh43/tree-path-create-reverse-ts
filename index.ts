const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 2 
const scGap : number = 0.02 / parts  
const delay : number = 20 
const backColor : string = "#BDBDBD"
const color : string = "0091EA"
const levels : number = 4 
const strokeFactor : number = 90 
const lSizeFactor : number = 4.9 
const rSizeFactor : number = 28.9 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number,  y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static getLSize() {
        return Math.min(w, h) / lSizeFactor 
    }

    static getRSize() {
        return Math.min(w, h) / rSizeFactor 
    }

    static drawTreePathCreateReverse(
        context : CanvasRenderingContext2D,
        x : number,
        y : number,
        level : number,
        scale1 : number,
        scale2 : number, 
        dir : number
    ) {
        const lSize : number = DrawingUtil.getLSize()
        const rSize : number = Math.min(w, h) / rSizeFactor 
        const sc11 : number = ScaleUtil.divideScale(scale1, 0, parts)
        const sc12 : number = ScaleUtil.divideScale(scale1, 1, parts)
        const sc21 : number = ScaleUtil.divideScale(scale2, 0, parts)
        const sc22 : number = ScaleUtil.divideScale(scale2, 1, parts)
        const sc1 : number = level === 0 ? scale1 : sc12
        const sc2 : number = level === 0 ? scale2 : sc22 
        if (level !== 0 && sc11 >= 0) {
            context.save()
            context.translate(x - lSize, y - dir * lSize)
            DrawingUtil.drawLine(context, lSize * sc21, lSize * sc21, lSize * sc11, lSize * dir * sc11)
            context.restore()
        }
        DrawingUtil.drawCircle(context, x, y + (h + rSize - y) * sc2, rSize * sc1)
    }

    static drawNode(
        context : CanvasRenderingContext2D,
        x : number,
        y : number,
        level : number,
        scale1 : number,
        scale2 : number, 
        dir : number
    ) {
        context.lineCap = 'round'
        context.strokeStyle = color 
        context.fillStyle = color 
        context.lineWidth = Math.min(w, h) / strokeFactor 
        DrawingUtil.drawTreePathCreateReverse(
            context, 
            x,
            y, 
            level, 
            scale1, 
            scale2, 
            dir
        )
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    udpate(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {
    
    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class TPNode {

    right : TPNode 
    left : TPNode 
    state1 : State = new State()
    state2 : State = new State()
    constructor(private x : number, private y : number, private level : number, private dir : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.level < levels - 1) {
            this.right = new TPNode(
                this.x + DrawingUtil.getLSize(), 
                this.y + DrawingUtil.getLSize(), 
                this.level + 1, 
                1   
            )    
            this.left = new TPNode(
                this.x - DrawingUtil.getLSize(), 
                this.y + DrawingUtil.getLSize(), 
                this.level + 1, 
                -1 
            )       
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawNode(context, this.x, this.y, this.level, this.state1.scale, this.state2.scale, this.dir)
    }

    update(cb : Function, dir : number) {
        if (dir == 1) {
            this.state1.udpate(cb)
        }
        if (dir == -1) {
            this.state2.udpate(cb)
        }
    }

    startUpdating(cb : Function, dir : number) {
        if (dir == 1) {
            this.state1.startUpdating(cb)    
        }
        if (dir == -1) {
            this.state2.startUpdating(cb)
        }
    }

    consumeChildren(cb : Function, stopCb : Function) {
        if (this.right) {
            cb(this.right)
        }
        if (this.left) {
            cb(this.left)
        }
        if (!this.right && !this.left) {
            stopCb()
        }
    }
}

class TreePathCreateReverse {

    root : TPNode = new TPNode(w / 2 + DrawingUtil.getRSize(), DrawingUtil.getRSize(), 0, 0)
    stack : Array<Array<TPNode>> = []
    queue : Array<TPNode> = []
    dir : number = 1

    constructor() {
        this.queue.push(this.root)
    }

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        if (this.dir == 1) {
            let n : number = this.queue.length 
            let k : number = 0
            for (let i = 0; i < n; i++) {
                this.queue[i].update(() => {
                    k++
                    if (k === n) {
                        this.removeQueueItems(cb)
                        
                    }
                }, this.dir)
            }
        } else {
            if (this.stack.length > 0) {
               const nodes : Array<TPNode> = this.stack[this.stack.length - 1]
               const n : number = nodes.length 
               let k = 0 
               for (let i = 0; i < n; i++) {
                    nodes[i].update(() => {
                        k++
                        if (k == n) {
                            this.flushStack(cb)
                        }
                    }, this.dir)
               }
            }
        }
    }

    removeQueueItems(cb : Function) {
        let n = this.queue.length 
        let k = 0 
        if (n > 0) {
            const items : Array<TPNode> =  this.queue.splice(0, n)
            cb()
            items.forEach((item : TPNode) => {
                item.consumeChildren((node : TPNode) => {
                    this.queue.push(node)
                }, () => {
                    k++
                    if (k == n) {
                        this.dir *= -1
                    }
                })
            })
            this.stack.push([...items])
        }
    }

    flushStack(cb : Function) {
        if (this.stack.length > 1) {
            this.stack.splice(this.stack.length - 1, 1)
            cb()
        }
    }
}