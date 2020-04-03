import {randomInt} from './utils.js';

export class Mesh {
    constructor(geometry, material, shade_mode) {
        this.type = "Mesh";
        this.material = material;
        this.shade_mode = shade_mode;
        this.draw_points = false;
        this.draw_lines = false;
        this.draw_triangles = true;

        // SubObjects of a mesh:
        this.Points = {
            vertices: this._buidVertexAttributeArray(geometry.points, 1),
            color: [0, 0, 0, 1],
            size: 2
        }
        this.Lines = {
            vertices: this._buidVertexAttributeArray(geometry.lines, 2),
            color: [1, 1, 1, 1]
        }
        this.Triangles = {
            vertices: this._buidVertexAttributeArray(geometry.triangles, 3),
            colors: this._buidColorAttributeArray(geometry.triangles, material.base_color),
            flat_normals: this._buidVertexAttributeArray(geometry.flat_normals, 1),
            smooth_normals: this._buidVertexAttributeArray(geometry.smooth_normals, 1)
        };

        // Vertex buffer array is interleaved array of attributes data and use when render triangles
        this.vertex_buffer_array = null; // Bind when draw triangles
        this.vertex_buffer_array_flat = null;
        this.vertex_buffer_array_smooth = null;
        // Point buffer array is 1D array of position attribute, don't need to be interleaved since
        // points is render with uniform
        this.point_buffer_array = this.Points.vertices; // Bind when draw points
        // Line buffer array is 1D array of position attribute, don't need to be interleaved since
        // lines is render with uniform
        this.line_buffer_array = this.Lines.vertices; // Bind when draw lines

        // Basic transformmation:
        this.scale = { x: 1, y: 1, z: 1 };
        this.translate = { x: 0, y: 0, z: 0 };
        this.rotate = { x: 0, y: 0, z: 0 };
    }

    /** @_buidVertexAttributeArray
    * Building a 1D array of vertices position base on primitives data: TRIANGLES, LINES, ....
    * @param primitives The primitives data of the mesh, can be triangles or lines.
    * @param n number vertices of each primitive, 2 with lines 3 with triangles, 4 with quad ,.....
    * @returns A 1D array contains vertex position data.
    * @private
    */
    _buidVertexAttributeArray(primitives, n) {
        let vertices = new Float32Array(primitives.length * n * 3);

        let nv = 0;

        if (n == 1) {
            for (let i = 0; i < primitives.length; i++) {
                let point = primitives[i];
                for (let j = 0; j < point.length; j++, nv++) {
                    vertices[nv] = point[j];
                }
            }
        }
        else {
            for (let i = 0; i < primitives.length; i++) {
                let primitive = primitives[i];
                for (let j = 0; j < primitive.length; j++) {
                    let vertex = primitive[j];
                    for (let k = 0; k < vertex.length; k++, nv++) {
                        vertices[nv] = vertex[k];
                    }
                }
            }
        }

        return vertices;
    }
    /** @_buidColorAttributeArray
    * Building a 1D array of color data position base on triangles data.
    * @param triangles The triangles data of the mesh.
    * @param base_color Array of color define by the material.
    * @returns A 1D array contains color data for each vertex.
    * @private
    */
    _buidColorAttributeArray(triangles, base_color) {
        let colors_array = new Float32Array(triangles.length * 9);
        let cc = 0;
        for (let i = 0; i < triangles.length; i++) {
            let triangle = triangles[i];
            for (let j = 0; j < triangle.length; j++) {
                let color = base_color;
                for (let k = 0; k < color.length; k++, cc++) {
                    colors_array[cc] = color[k];
                }
            }
        }
        return colors_array;
    }
}