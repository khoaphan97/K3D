import {point4, vec3, mat4} from './matrix_math.js';

export const createTriangle = (a, b, c) => {
    let T = [a, b, c];
    return T;
};

export const createLine = (a, b) => {
    let L = [a, b];
    return L;
};

export const buildFlatNormal = (triangles) => {
    let flat_normals = [];
    let normal = vec3.create();
    for (let i = 0; i < triangles.length; i++) {
        let triangle = triangles[i];
        let a = point4.create(triangle[0][0], triangle[0][1], triangle[0][2]);
        let b = point4.create(triangle[1][0], triangle[1][1], triangle[1][2]);
        let c = point4.create(triangle[2][0], triangle[2][1], triangle[2][2]);
        let v0 = vec3.createFrom2Points(a, b);
        let v1 = vec3.createFrom2Points(b, c);


        vec3.crossProduct(normal, v0, v1);
        vec3.normalize(normal);
        for (let j = 0; j < 3; j++) {
            flat_normals.push([normal[0], normal[1], normal[2]]); // Every vertices in one triangle has the triangle normal
        }
    }
    return flat_normals;
};

export const buildSmoothNormal = (triangles) => {
    let smooth_normals = [];
    let normal = vec3.create();
    for (let i = 0; i < triangles.length; i++) {
        let triangle = triangles[i];
        for (let j = 0; j < triangle.length; j++) {
            vec3.set(normal, triangle[j][0], triangle[j][1], triangle[j][2]);
            vec3.normalize(normal);
            smooth_normals.push([normal[0], normal[1], normal[2]]);
        }
    }
    return smooth_normals;
}

export const randomInt = (min, max) => {
    return min + Math.floor((max - min) * Math.random());
}