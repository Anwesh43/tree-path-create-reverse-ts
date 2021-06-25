const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 2 
const scGap : number = 0.02 / parts  
const delay : number = 20 
const backColor : string = "#BDBDBD"
const color : string = "0091EA"
const levels : number = 4 
const strokeFactor : number = 90 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }
}