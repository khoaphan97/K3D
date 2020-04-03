import * as geometry from './js/geometry.js';
import * as material from './js/material.js';
import * as light from './js/light.js';
import * as camera from './js/camera.js';
import {Mesh} from './js/mesh.js';
import {Scene} from './js/scene.js';
import {RenderEngine} from './js/renderer.js';
import * as control from './js/controls.js';

window.K3D = {
    Triangle: geometry.Triangle,
    ConeGeometry: geometry.ConeGeometry,
    BoxGeometry: geometry.BoxGeometry,
    UVSphereGeometry: geometry.UVSphereGeometry,
    BasicMaterial: material.BasicMaterial,

    PointLight: light.PointLight,
    AmbientLight: light.AmbientLight,

    PerspectiveCamera: camera.PerspectiveCamera,
    Mesh: Mesh,
    Scene: Scene,
    RenderEngine: RenderEngine,

    EasyCam: control.EasyCam,
    OrbitControl: control.OrbitControl
}

window.SHADE_FLAT = 74567;
window.SHADE_SMOOTH = 36474;
// Uniform types:
window.UNIFORM_FVEC1 = 25483;
window.UNIFORM_FVEC2 = 26323;
window.UNIFORM_FVEC3 = 25123; // Vector 3 float
window.UNIFORM_FVEC4 = 15113; // Vector 4 float
window.UNIFORM_FMATX4 = 65103; //
window.UNIFORM_INT = 55793;
window.UNIFORM_FLOAT = 25383;



