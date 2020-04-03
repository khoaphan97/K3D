import { createTriangle, createLine, buildFlatNormal, buildSmoothNormal } from './utils.js';
import {point4, vec3, mat4} from './matrix_math.js';

export const Triangle = (v0, v1, v2) => {
    let v = [];
    let triangles = [];
    let lines = [];

    triangles = [[v0, v1, v2]];
    for (let i = 0; i < triangles.length; i++) {
        let l1 = createTriangle(triangles[i][0], triangles[i][1]);
        let l2 = createLine(triangles[i][1], triangles[i][2]);
        let l3 = createLine(triangles[i][2], triangles[i][0]);

        lines.push(l1);
        lines.push(l2);
        lines.push(l3);
    }

    let smooth_normals = buildSmoothNormal(triangles);// Normal vector array of every vertices in each triangle.
    let flat_normals = buildFlatNormal(triangles); // Normal vector array of each triangle.

    return {
        type: "Triangle",
        points: [v0, v1, v2],
        triangles,
        lines,
        smooth_normals,
        flat_normals
    }
}

export const ConeGeometry = (radius, height, segments) => {
    let v = [];
    let triangles = [];
    let lines = [];
    let angle_step = 2 * Math.PI / segments;
    let x, y, angle;

    for (let i = 0; i <= segments; i++) {
        angle = i * angle_step;
        x = radius * Math.cos(angle);
        y = radius * Math.sin(angle);
        v.push([x, y, 0]);
    }

    for (let i = 0; i < segments; i++) {
        let peak = [0, 0, height];
        let bottom = [0, 0, 0];
        let side_planes = createTriangle(peak, v[i], v[i + 1]);
        let bottom_planes = createTriangle(v[i], bottom, v[i + 1]);
        triangles.push(side_planes);
        triangles.push(bottom_planes);
    }

    for (let i = 0; i < triangles.length; i++) {
        let l1 = createLine(triangles[i][0], triangles[i][1]);
        let l2 = createLine(triangles[i][1], triangles[i][2]);
        let l3 = createLine(triangles[i][2], triangles[i][0]);

        lines.push(l1);
        lines.push(l2);
        lines.push(l3);
    }

    // Merge vertices by distance:
    let count = 0;
    let done = true;
    let i = 0;
    for (i; i < v.length; i++) {
        for (let j = i + 1; j < v.length; j++) {
            let p1 = point4.create(v[i][0], v[i][1], v[i][2]);
            let p2 = point4.create(v[j][0], v[j][1], v[j][2]);
            let distanceBetween = point4.distanceBetween(p1, p2);
            if (distanceBetween < 0.00001) {
                v[i] = v[j];
                v.splice(j, 1);
                i = 0;
                break;
            }
        }
    }

    // Add the peak vertex and origin vertex - no needed order for points rendering:
    v.push([0, 0, 0]);
    v.push([0, 0, height]);

    // Build normal data for flat shading:
    let smooth_normals = buildSmoothNormal(triangles);// Normal vector array of every vertices in each triangle.
    let flat_normals = buildFlatNormal(triangles); // Normal vector array of each triangle.

    return {
        type: "ConeGeometry",
        points: v,
        triangles,
        lines,
        flat_normals,
        smooth_normals
    }
}

export const BoxGeometry = (width, height, depth) => {
    let w, h, d;
    let v = null;
    let triangles = [];
    let lines = [];

    w = width;
    if (height != null) {
        h = height;
    }
    else {
        h = w;
    }
    if (depth != null) {
        d = depth;
    }
    else {
        d = w;
    }

    v = [
        [-w / 2, h / 2, d / 2],
        [-w / 2, -h / 2, d / 2],
        [w / 2, h / 2, d / 2],
        [w / 2, -h / 2, d / 2],
        [w / 2, h / 2, -d / 2],
        [w / 2, -h / 2, -d / 2],
        [-w / 2, h / 2, -d / 2],
        [-w / 2, -h / 2, -d / 2],
    ];

    triangles = [
        createTriangle(v[0], v[1], v[2]), createTriangle(v[2], v[1], v[3]),
        createTriangle(v[2], v[3], v[4]), createTriangle(v[4], v[3], v[5]),
        createTriangle(v[4], v[5], v[6]), createTriangle(v[6], v[5], v[7]),
        createTriangle(v[6], v[7], v[0]), createTriangle(v[0], v[7], v[1]),
        createTriangle(v[0], v[2], v[6]), createTriangle(v[6], v[2], v[4]),
        createTriangle(v[1], v[7], v[3]), createTriangle(v[3], v[7], v[5])
    ];

    for (let i = 0; i < triangles.length; i++) {
        let l1 = createLine(triangles[i][0], triangles[i][1]);
        let l2 = createLine(triangles[i][1], triangles[i][2]);
        let l3 = createLine(triangles[i][2], triangles[i][0]);

        lines.push(l1);
        lines.push(l2);
        lines.push(l3);
    }

    // Build normal data for flat shading:
    let smooth_normals = buildSmoothNormal(triangles);// Normal vector array of every vertices in each triangle.
    let flat_normals = buildFlatNormal(triangles); // Normal vector array of each triangle.


    return {
        type: "BoxGeometry",
        points: v,
        triangles,
        lines,
        flat_normals,
        smooth_normals
    }
}

export const UVSphereGeometry = (size, rings, segments) => {
    let vertices = [];
    let triangles = [];
    let lines = [];
    let x, y, z, xy;
    let lat, lon;
    let lat_step = Math.PI / rings;
    let lon_step = 2 * Math.PI / segments;
    // Build spherical geometry vertices:
    for (let i = 0; i <= rings; i++) {
        lat = Math.PI / 2 - i * lat_step;
        xy = size * Math.cos(lat);
        z = size * Math.sin(lat);

        for (let j = 0; j < segments; j++) {
            lon = j * lon_step;
            x = xy * Math.cos(lon);
            y = xy * Math.sin(lon);
            vertices.push([x, y, z]);
        }
    }
    // Build triangles from vertices:
    let k1, k2;
    for (let i = 0; i < rings; i++) {
        k1 = i * segments;
        k2 = k1 + segments;
        for (let j = 0; j < segments; j++, k1++, k2++) {
            if (i != 0) {
                let t = createTriangle(vertices[k1], vertices[k2], vertices[k1 + 1]);
                triangles.push(t);
            }
            if (i != rings - 1) {
                let t = createTriangle(vertices[k1 + 1], vertices[k2], vertices[k2 + 1]);
                triangles.push(t);
            }
        }
    }
    // Build lines from triangles:
    for (let i = 0; i < triangles.length; i++) {
        let l1 = createLine(triangles[i][0], triangles[i][1]);
        let l2 = createLine(triangles[i][1], triangles[i][2]);
        let l3 = createLine(triangles[i][2], triangles[i][0]);

        lines.push(l1);
        lines.push(l2);
        lines.push(l3);
    }
    // Merge vertices by distance:
    let count = 0;
    let done = true;
    let i = 0;
    for (i; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            let p1 = point4.create(vertices[i][0], vertices[i][1], vertices[i][2]);
            let p2 = point4.create(vertices[j][0], vertices[j][1], vertices[j][2]);
            let distanceBetween = point4.distanceBetween(p1, p2);
            if (distanceBetween < 0.00001) {
                vertices[i] = vertices[j];
                vertices.splice(j, 1);
                i = 0;
                break;
            }
        }
    }
    vertices.splice(0, 1);

    // Build normal data for flat shading:
    let smooth_normals = buildSmoothNormal(triangles);// Normal vector array of every vertices in each triangle.
    let flat_normals = buildFlatNormal(triangles); // Normal vector array of each triangle.

    return {
        type: "SphereGeometry",
        points: vertices,
        triangles,
        lines,
        origin: [0, 0, 0],
        smooth_normals,
        flat_normals
    }
}