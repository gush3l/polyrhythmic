const htmlCanvas = <HTMLCanvasElement>document.getElementById("canvas");
const context = htmlCanvas.getContext("2d");
const heightRatio = 0.55;
const radian = 0.0174533;
var cachedNumberOfLines = 0;

const circleCenter = {
    x: 1500,
    y: 1500
}
type Settings = {
    [key: string]: any;
}

var settings: Settings = {
    "radius": 0,
    "lineColor": "white",
    "fillColor": "white",
    "strokeColor": "white",
    "lineWidth": 10,
    "numberOfLines": 10,
    "resyncDuration": 1000 * 60
}

var dots: CanvasDot[] = []

class CanvasDot {
    private dotID: number;
    private x: number;
    private y: number;
    private radius: number;
    private goBack: boolean;
    private velocity: number;
    private currentRadians: number;

    constructor(dotID: number, x: number, y: number, radius: number, goBack: boolean, velocity: number, currentRadians: number) {
        this.dotID = dotID;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.goBack = goBack;
        this.velocity = velocity;
        this.currentRadians = currentRadians;
    }

    getDotID(): number {
        return this.dotID;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    getRadius(): number {
        return this.radius;
    }

    isGoBack(): boolean {
        return this.goBack;
    }

    getVelocity(): number {
        return this.velocity;
    }

    getCurrentRadians(): number {
        return this.currentRadians;
    }

    setDotID(dotID: number) {
        this.dotID = dotID;
    }

    setX(x: number) {
        this.x = x;
    }

    setY(y: number) {
        this.y = y;
    }

    setRadius(radius: number) {
        this.radius = radius;
    }

    setGoBack(goBack: boolean) {
        this.goBack = goBack;
    }

    setVelocity(velocity: number) {
        this.velocity = velocity;
    }

    setCurrentRadians(currentRadians: number) {
        this.currentRadians = currentRadians;
    }

    update() {
        if (this.currentRadians < radian * -180) {
            this.goBack = true;
            //console.log("Go back - true",this.dotID)
        }
        if (this.currentRadians > 0) {
            this.goBack = false;
            //console.log("Go back - false",this.dotID)
        }
    }

    draw() {
        this.update()
        if (this.goBack) this.currentRadians += (Math.PI * this.radius * radian) / (settings.resyncDuration / 2);
        else this.currentRadians -= (Math.PI * this.radius * radian) / (settings.resyncDuration / 2);
        this.x = this.radius * Math.cos(this.currentRadians) + circleCenter.x;
        this.y = this.radius * Math.sin(this.currentRadians) + circleCenter.y;
        context.strokeStyle = settings.strokeColor;
        context.lineCap = "round";
        context.fillStyle = settings.fillColor;
        context.lineWidth = settings.lineWidth;
        context.beginPath();
        context.arc(this.x, this.y, settings.lineWidth, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
        context.closePath();
    }
}

function resizeCanvas() {
    htmlCanvas.height = htmlCanvas.width * heightRatio;
    dots.forEach(dot => {
        drawSemicircle(dot.getRadius())
    });
}

function drawSemicircle(radius: number) {
    context.strokeStyle = settings.lineColor;
    context.lineCap = "round";
    context.lineWidth = 0;
    context.beginPath();
    context.arc(circleCenter.x, circleCenter.y, radius, 0, Math.PI, true);
    context.stroke();
}


function getVelocity(radius: number) {
    return (2 * radius * Math.PI * radian) / settings.resyncDuration
}

function calculateSliderResyncDuration(value: number) {
    return (100 * (100 / value)) * 60;
}

const draw = () => {
    if (cachedNumberOfLines != settings.numberOfLines) initialize();
    context.clearRect(0, 0, htmlCanvas.width, htmlCanvas.height);
    dots.forEach(dot => {
        drawSemicircle(dot.getRadius())
        dot.draw()
    });
    requestAnimationFrame(draw);
}

function initialize() {
    cachedNumberOfLines = settings.numberOfLines;
    dots = []
    resizeCanvas();
    settings.radius = (htmlCanvas.width / 2.5) / settings.numberOfLines;
    window.addEventListener('resize', resizeCanvas, false);
    for (let radius = settings.radius; radius <= (settings.radius * settings.numberOfLines); radius += settings.radius) {
        let velocity = getVelocity(radius)
        dots[dots.length] = new CanvasDot(dots.length, 0, 0, radius, false, velocity, 0);
    }

}

function updateLinesColors(color: string) {
    console.log(color)
}

initialize();

draw();

var rangeSliderHandler = function () {
    var sliderContainers = document.getElementsByClassName("range-slider");

    Array.from(sliderContainers).forEach(element => {
        const inputElement = element.getElementsByTagName("input")[0];
        inputElement.addEventListener('input', () => {
            var elID: string = element.id;
            if (elID == "resyncDuration") settings[elID] = calculateSliderResyncDuration(parseInt(inputElement.value));
            else settings[elID] = inputElement.value;
            element.getElementsByTagName("span")[0].textContent = inputElement.value;
        });
    });

}

rangeSliderHandler();

var colorSelecterHandler = function () {
    var colorPickers = document.getElementsByClassName("color-picker");

    Array.from(colorPickers).forEach(element => {
        var colorPickerInput = <HTMLInputElement> element;
        element.addEventListener('input', () => {
            var elID: string = element.id;
            settings[elID] = colorPickerInput.value;
        });
    });
}

colorSelecterHandler();