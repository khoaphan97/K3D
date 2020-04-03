import { point4, vec3, mat4 } from './matrix_math.js';

export class PerspectiveCamera {
    constructor(fov, asp, near, far) {
        this.eye = { x: 0, y: 0, z: 0 };

        this.u = vec3.create(1, 0, 0);
        this.v = vec3.create(0, 1, 0);
        this.n = vec3.create(0, 0, 1);
        this.t = vec3.create();

        this.transform = mat4.create();
        this.projection = mat4.createPerspective(fov, asp, near, far);

        this.lookAt(0, 0, 0);
    }

    lookAt(center_x, center_y, center_z) {

        var center = vec3.create(center_x, center_y, center_z);
        let eye = vec3.create(this.eye.x, this.eye.y, this.eye.z);
        let up = vec3.create(0, 1, 0);

        vec3.subtract(this.n, eye, center);
        vec3.normalize(this.n);

        vec3.crossProduct(this.u, up, this.n);
        vec3.normalize(this.u);

        vec3.crossProduct(this.v, this.n, this.u);
        vec3.normalize(this.v);

        this.t[0] = - vec3.dotProduct(this.u, eye);
        this.t[1] = - vec3.dotProduct(this.v, eye);
        this.t[2] = - vec3.dotProduct(this.n, eye);
        // Set the camera matrix:
        this.updateTransform();
    }

    /** @truck
    * Move the camera along the u-axis:
    * @param distance the distance to move
    * @private
    */
    truck(distance) {
        let eye = vec3.create(this.eye.x, this.eye.y, this.eye.z);
        let u_scale = vec3.create();
        vec3.scale(u_scale, this.u, distance);
        vec3.add(eye, eye, u_scale);

        this.eye.x = eye[0];
        this.eye.y = eye[1];
        this.eye.z = eye[2];

        this.t[0] = -vec3.dotProduct(this.u, eye);
        this.t[1] = -vec3.dotProduct(this.v, eye);
        this.t[2] = -vec3.dotProduct(this.n, eye);

        this.updateTransform();
    }
    /** @pan
    * Rotate the camera around the v-axis:
    * @param angle the distance to move
    * @private
    */
    pan(angle) {
        let eye = vec3.create(this.eye.x, this.eye.y, this.eye.z);
        let rotate = mat4.create();
        mat4.rotate(rotate, angle, this.v[0], this.v[1], this.v[2]);
        mat4.multiplyV3(this.u, rotate, this.u);
        mat4.multiplyV3(this.n, rotate, this.n);

        // Update the translate values of ty and tz
        this.t[0] = -vec3.dotProduct(this.u, eye);
        this.t[2] = -vec3.dotProduct(this.n, eye);

        this.updateTransform();
    }
    /** @tilt
    * Rotate the camera around the u-axis:
    * @param angle the distance to move
    * @private
    */
    tilt(angle) {
        let eye = vec3.create(this.eye.x, this.eye.y, this.eye.z);
        let rotate = mat4.create();
        mat4.rotate(rotate, angle, this.u[0], this.u[1], this.u[2]);
        mat4.multiplyV3(this.v, rotate, this.v);
        mat4.multiplyV3(this.n, rotate, this.n);

        // Update the translate values of ty and tz
        this.t[1] = -vec3.dotProduct(this.v, eye);
        this.t[2] = -vec3.dotProduct(this.n, eye);

        this.updateTransform();
    }

    dolly(distance) {
        let eye = vec3.create(this.eye.x, this.eye.y, this.eye.z);
        let n_scale = vec3.create();
        vec3.scale(n_scale, this.n, distance);
        vec3.add(eye, eye, n_scale);

        this.eye.x = eye[0];
        this.eye.y = eye[1];
        this.eye.z = eye[2];

        this.t[0] = -vec3.dotProduct(this.u, eye);
        this.t[1] = -vec3.dotProduct(this.v, eye);
        this.t[2] = -vec3.dotProduct(this.n, eye);

        this.updateTransform();
    }

    updateTransform() {
        this.transform[0] = this.u[0]; this.transform[4] = this.u[1]; this.transform[8] = this.u[2]; this.transform[12] = this.t[0];
        this.transform[1] = this.v[0]; this.transform[5] = this.v[1]; this.transform[9] = this.v[2]; this.transform[13] = this.t[1];
        this.transform[2] = this.n[0]; this.transform[6] = this.n[1]; this.transform[10] = this.n[2]; this.transform[14] = this.t[2];
        this.transform[3] = 0; this.transform[7] = 0; this.transform[11] = 0; this.transform[15] = 1;
    }
}