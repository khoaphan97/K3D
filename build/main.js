let point_light, point_light2;
let ambient;
let renderer, scene, camera;
let box, box_geometry, material, material2;
let sphere, sphere_geometry;
let cone, cone_geometry;
let canvas;
let control;



let init = () => {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    box_geometry = K3D.BoxGeometry(1.5);
    material = K3D.BasicMaterial(0.9, 0.1, 0.9);
    material2 = K3D.BasicMaterial(0.9, 0.1, 0.1);
    box = new K3D.Mesh(box_geometry, material, SHADE_SMOOTH);
    box.draw_lines = false;
    box.draw_points = false;

    sphere_geometry = K3D.UVSphereGeometry(0.5, 30, 30);
    sphere = new K3D.Mesh(sphere_geometry, material2, SHADE_SMOOTH);
    sphere.translate.x = 2;

    cone_geometry = K3D.ConeGeometry(1, 1.75, 30);
    cone = new K3D.Mesh(cone_geometry, material2, SHADE_SMOOTH);
    cone.rotate.x = -90;

    point_light = K3D.PointLight(0, 0, 5, [1, 1, 1]);
    point_light2 = K3D.PointLight(150, 0, 0, [0, 0.5, 1]);
    ambient = K3D.AmbientLight(1, 1, 1);

    scene = new K3D.Scene([0, 0, 0, 0.8]);
    scene.add(cone);
    scene.add(sphere);
    scene.add(point_light);
    // scene.add(point_light2);
    scene.add(ambient);

    camera = new K3D.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);
    camera.eye.z = 5;
    camera.lookAt(0, 0, 0);

    control = new K3D.EasyCam(canvas, camera);
    control.initEvent();

    renderer = new K3D.RenderEngine(canvas);
}

let animate = () => {
    requestAnimationFrame(animate);

    box.rotate.y -= 0.5;
    box.rotate.z += 0.5;

    renderer.render(scene, camera);
}

init();
animate();