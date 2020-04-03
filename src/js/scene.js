export class Scene {
    constructor(color) {

        if (color) {
            this.color = color;
        }
        else {
            this.color = [1, 1, 1, 1];
        }

        this.objects = [];
        this.ambient_light = null;
        this.point_lights = [];
        this.spot_lights= [];
        this.area_lights = [];
        this.sun_lights = [];
    }

    add(object) {
        if (object.type == "Mesh") {
            object.vertex_buffer_array =
                this._buildInterleavedAtrribArray(object.Triangles.vertices.length / 3,
                    [object.Triangles.vertices,
                    object.Triangles.colors],
                    [3, 3]
                );


            object.vertex_buffer_array_flat =
                this._buildInterleavedAtrribArray(object.Triangles.vertices.length / 3,
                    [object.Triangles.vertices,
                    object.Triangles.colors,
                    object.Triangles.flat_normals],
                    [3, 3, 3]
                );


            object.vertex_buffer_array_smooth =
                this._buildInterleavedAtrribArray(object.Triangles.vertices.length / 3,
                    [object.Triangles.vertices,
                    object.Triangles.colors,
                    object.Triangles.smooth_normals],
                    [3, 3, 3]
                );

            this.objects.push(object);
        }

        else if (object.type == "PointLight") {
            this.point_lights.push(object);
        }

        else if (object.type == "AmbientLight") {
            this.ambient_light = object;
        }
    };


    /** @_buildInterleavedArray
    * Building a 1D array contains interleaved attribute data: position, color, texture, normals, ....
    * @param num_vertex The number of total vertices of the mesh: length(vertices_buffer) / 3.
    * @param buffer_arrays an array of attribute arrays
    * @param data_length_array an array of the length of attribute arrays - need to set value in the right orders of @buffer_arrays
    * @returns A 1D array contains interleaved attribute data.
    * @private
    */
    _buildInterleavedAtrribArray(num_vertex, buffer_arrays, data_length_array) {

        let total_length = 0;
        let i, j, k;
        let fi = 0;

        for (let i = 0; i < buffer_arrays.length; i++) {
            total_length += buffer_arrays[i].length;
        }

        let interleaved_array = new Float32Array(total_length);

        for (i = 0; i < num_vertex; i++) {
            for (j = 0; j < buffer_arrays.length; j++) {
                for (k = 0; k < data_length_array[j]; k++) {
                    interleaved_array[fi++] = buffer_arrays[j][(i * data_length_array[j]) + k];
                }
            }
        }

        return interleaved_array;
    }
}