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

    static drawTreePathCreateReverse(
        context : CanvasRenderingContext2D,
        x : number,
        y : number,
        level : number,
        scale1 : number,
        scale2 : number, 
        dir : number
    ) {
        const lSize : number = Math.min(w, h) / lSizeFactor 
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