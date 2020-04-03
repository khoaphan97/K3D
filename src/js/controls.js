import { vec3 } from './matrix_math.js';

let x = 0;
let y = 0;
let is_press = false;
let deltaX, deltaY;

export class EasyCam {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
    }


    initEvent() {
        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            this.camera.dolly(event.deltaY * 0.005);
        });

        this.canvas.addEventListener("mousedown", e => {
            e.preventDefault();
            x = e.clientX;
            y = e.clientY;
            is_press = true;
        });

        this.canvas.addEventListener("mousemove", e => {
            e.preventDefault();

            if (is_press == true) {
                deltaX = e.clientX - x;
                deltaY = e.clientY - y;

                this.camera.pan(deltaX * 0.05);
                this.camera.tilt(deltaY * 0.05);

                x = e.clientX;
                y = e.clientY;

            }
        });

        this.canvas.addEventListener("mouseup", e => {
            e.preventDefault();
            is_press = false;
        });
    }
}

export class OrbitControl {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;

        this.theta = 0;
        this.phi = 0;
        this.center = { x: 0, y: 0, z: 0 };

        this.radius = 0;

        this.updateCoordinate();
    }

    initEvent() {

        this.canvas.addEventListener("mousedown", e => {
            e.preventDefault();
            is_press = true;
            x = e.clientX;
            y = e.clientY;
        }, false);

        this.canvas.addEventListener("mousemove", e => {
            e.preventDefault();
            if (is_press === true) {
                let deltaX = (e.clientX - x) * 0.005;
                let deltaY = (e.clientY - y) * 0.005;

                this.phi += deltaY;
                this.theta += deltaX;

                this.camera.eye.x = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
                this.camera.eye.y = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
                this.camera.eye.z = this.radius * Math.cos(this.phi);
                
                this.camera.lookAt(this.center.x, this.center.y, this.center.z);

                x = e.clientX;
                y = e.clientY;
            }
        }, false);

        this.canvas.addEventListener("mouseup", e => {
            is_press = false;
        }, false);

        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            this.camera.dolly(event.deltaY * 0.005);
            this.updateCoordinate();
        }, false);
    }

    updateCoordinate() {
        let eye = vec3.create(this.camera.eye.x, this.camera.eye.x, this.camera.eye.z);
        let center = vec3.create(this.center.x, this.center.y, this.center.z);
        
        let r = vec3.create();
        vec3.subtract(r, eye, center);
        this.radius = vec3.length(r);

        this.theta = Math.acos(eye[2] / this.radius);
        this.phi = Math.asin(eye[0] / this.radius * Math.cos(this.theta));
    }
}


