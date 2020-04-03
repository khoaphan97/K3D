import { point4, vec3, mat4 } from './matrix_math.js';
import { WIRE_FRAME_SHADER, BASIC_SHADER, BASIC_LIGHTING_SHADER } from './shaders.js';

export class RenderEngine {
    constructor(canvas) {
        this._gl = canvas.getContext("webgl");
        this.wireFrame_shader = {
            vShader: this._loadAndCompileShaders(this._gl.VERTEX_SHADER, WIRE_FRAME_SHADER.VERT),
            fShader: this._loadAndCompileShaders(this._gl.FRAGMENT_SHADER, WIRE_FRAME_SHADER.FRAG)
        }
        this.basic_shader = {
            vShader: this._loadAndCompileShaders(this._gl.VERTEX_SHADER, BASIC_SHADER.VERT),
            fShader: this._loadAndCompileShaders(this._gl.FRAGMENT_SHADER, BASIC_SHADER.FRAG)
        }
        this.basic_lighting_shader = {
            vShader: this._loadAndCompileShaders(this._gl.VERTEX_SHADER, BASIC_LIGHTING_SHADER.VERT),
            fShader: this._loadAndCompileShaders(this._gl.FRAGMENT_SHADER, BASIC_LIGHTING_SHADER.FRAG)
        }
        this.buffer_id = this._gl.createBuffer();
        this.wireFrame_program = this._createProgram(this.wireFrame_shader.vShader, this.wireFrame_shader.fShader);
        this.basic_program = this._createProgram(this.basic_shader.vShader, this.basic_shader.fShader);
        this.basic_lighting_program = this._createProgram(this.basic_lighting_shader.vShader, this.basic_lighting_shader.fShader);
    }

    /** @_loadAndCompileShaders
    * Load and compile Shader
    * @param type WebGL constant gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    * @param source a string contains GLSL code.
    * @returns A 1D array contains interleaved attribute data.
    * @private
    */
    _loadAndCompileShaders(type, source) {
        let gl = this._gl;
        let shader = null;

        switch (type) {
            case gl.VERTEX_SHADER:
                shader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                break;
            case gl.FRAGMENT_SHADER:
                shader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                break;
            default:
                break;
        }
        return shader;
    }

    /** @_createProgram
    * Load and compile Shader
    * @param vertexShader WebGL vertex shader
    * @param fragmentShader WebGL fragment shader
    * @returns A WebGL program using the 2 shader.
    * @private
    */
    _createProgram(vertexShader, fragmentShader) {
        let gl = this._gl;

        let program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        return program;
    }

    _setProgramAttribute(program, attrib_list, data_length_list) {
        let gl = this._gl;
        let stride = 0;
        let offset = [];

        for (let i = 0; i < data_length_list.length; i++) {
            stride += data_length_list[i] * 4;
        }


        for (let i = 0; i < attrib_list.length; i++) {
            if (i == 0) offset = 0;
            else offset += data_length_list[i - 1] * 4;
            let attrib_name = attrib_list[i];
            let data_length = data_length_list[i];
            program[attrib_name] = gl.getAttribLocation(program, attrib_name);
            gl.enableVertexAttribArray(program[attrib_name]);
            gl.vertexAttribPointer(program[attrib_name], data_length, gl.FLOAT, false, stride, offset);
        }


    }

    _setProgramUniform(program, uniform_name, data, type) {
        let gl = this._gl;
        program[uniform_name] = gl.getUniformLocation(program, uniform_name);

        switch(type) {
            case UNIFORM_FLOAT: gl.uniform1f(program[uniform_name], data); break;
            case UNIFORM_INT: gl.uniform1i(program[uniform_name], data); break;
            case UNIFORM_FVEC1: gl.uniform1fv(program[uniform_name], data); break;
            case UNIFORM_FVEC3: gl.uniform3fv(program[uniform_name], data); break;
            case UNIFORM_FVEC4: gl.uniform4fv(program[uniform_name], data); break;
            case UNIFORM_FMATX4: gl.uniformMatrix4fv(program[uniform_name], false, data); break;
            default: break;
        }
    }

    _transformObject(object) {
        let translate_matrix = mat4.create();
        mat4.translate(translate_matrix, object.translate.x, object.translate.y, object.translate.z);
        let scale_matrix = mat4.create();
        mat4.scale(scale_matrix, object.scale.x, object.scale.y, object.scale.z);
        let rotateX_matrix = mat4.create();
        let rotateY_matrix = mat4.create();
        let rotateZ_matrix = mat4.create();
        mat4.rotate(rotateX_matrix, object.rotate.x, 1, 0, 0);
        mat4.rotate(rotateY_matrix, object.rotate.y, 0, 1, 0);
        mat4.rotate(rotateZ_matrix, object.rotate.z, 0, 0, 1);
        let transform_matrix = mat4.create();
        mat4.multiplySeries(transform_matrix, translate_matrix, scale_matrix, rotateX_matrix, rotateY_matrix, rotateZ_matrix);
        return transform_matrix;
    }

    render(scene, camera) {
        let gl = this._gl;
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(scene.color[0], scene.color[1], scene.color[2], scene.color[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (let obj of scene.objects) {
            this._drawTriangles(obj, camera, scene, obj.draw_triangles);
            this._drawWireFrame(obj, camera, obj.draw_points, obj.draw_lines);
        }

    }

    _drawTriangles(obj, camera, scene, draw_triangles) {

        if (draw_triangles == true) {
            let gl = this._gl;
            let gl_program;
            let attrib_list, data_length_list;
            let buffer_array;
            let ambient_color, ambient_intensity;
            let point_lights_position = [];
            let point_lights_color = [];
            let point_lights_intensity = [];

            let pvm_transform = mat4.create();
            let vm_transform = mat4.create();
            let model_matrix = this._transformObject(obj);
            let projection_matrix = camera.projection;
            let view_matrix = camera.transform;
            mat4.multiplySeries(pvm_transform, projection_matrix, view_matrix, model_matrix);
            mat4.multiplySeries(vm_transform, view_matrix, model_matrix);


            for (let point_light of scene.point_lights) {
                point_lights_position.push(point_light.position.x);
                point_lights_position.push(point_light.position.y);
                point_lights_position.push(point_light.position.z);
                point_lights_color.push(point_light.color[0]);
                point_lights_color.push(point_light.color[1]);
                point_lights_color.push(point_light.color[2]);
                point_lights_intensity.push(point_light.intensity);
            }

            if(scene.ambient_light) {
                ambient_color = [scene.ambient_light.color.r, scene.ambient_light.color.g, scene.ambient_light.color.b];
                ambient_intensity = scene.ambient_light.intensity;
            }
            else {
                ambient_color = [0, 0, 0];
                ambient_intensity = 0;
            }
            // If there is light in the scene
            if (scene.point_lights.length > 0 ||
                scene.spot_lights.length > 0 ||
                scene.area_lights.length > 0 ||
                scene.sun_lights.length > 0) {
                // Shade flat mode rendering
                if (obj.shade_mode == SHADE_FLAT) {
                    gl_program = this.basic_lighting_program;
                    buffer_array = obj.vertex_buffer_array_flat;
                    attrib_list = ["a_Vertex_position", "a_Color", "a_Vertex_normal"];
                    data_length_list = [3, 3, 3];

                }
                // Shade smooth mode rendering
                else if (obj.shade_mode == SHADE_SMOOTH) {
                    gl_program = this.basic_lighting_program;
                    buffer_array = obj.vertex_buffer_array_smooth;
                    attrib_list = ["a_Vertex_position", "a_Color", "a_Vertex_normal"];
                    data_length_list = [3, 3, 3];
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_id);
                gl.bufferData(gl.ARRAY_BUFFER, buffer_array, gl.STATIC_DRAW);
                gl.useProgram(gl_program);
                this._setProgramAttribute(gl_program, attrib_list, data_length_list);

                this._setProgramUniform(gl_program, "u_VM_transform", vm_transform, UNIFORM_FMATX4);
                this._setProgramUniform(gl_program, "u_PVM_transform", pvm_transform, UNIFORM_FMATX4);

                this._setProgramUniform(gl_program, "u_Light_position", point_lights_position, UNIFORM_FVEC3);
                this._setProgramUniform(gl_program, "u_Light_color", point_lights_color, UNIFORM_FVEC3);
                this._setProgramUniform(gl_program, "u_Light_intensity", point_lights_intensity, UNIFORM_FVEC1);
                this._setProgramUniform(gl_program, "u_Ambient_color", ambient_color, UNIFORM_FVEC3);
                this._setProgramUniform(gl_program, "u_Ambient_intensity", ambient_intensity, UNIFORM_FLOAT);

            }
            // If there is no light in the scene
            else {
                
                gl_program = this.basic_program;

                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_id);
                gl.bufferData(gl.ARRAY_BUFFER, obj.vertex_buffer_array, gl.STATIC_DRAW);
                gl.useProgram(gl_program);

                let attrib_list = ["a_Vertex_position", "a_Color"];
                let data_length_list = [3, 3];
                this._setProgramAttribute(gl_program, attrib_list, data_length_list);

                this._setProgramUniform(gl_program, "u_VM_transform", vm_transform, UNIFORM_FMATX4);
                this._setProgramUniform(gl_program, "u_PVM_transform", pvm_transform, UNIFORM_FMATX4);
            }

            gl.drawArrays(gl.TRIANGLES, 0, obj.Triangles.vertices.length / 3);
        }
    }

    _drawWireFrame(obj, camera, draw_points, draw_lines) {
        let gl = this._gl;
        let gl_program = this.wireFrame_program;
        let buffer_array, color;

        let pvm_transform = mat4.create();
        let model_matrix = this._transformObject(obj);
        let projection_matrix = camera.projection;
        let view_matrix = camera.transform;
        mat4.multiplySeries(pvm_transform, projection_matrix, view_matrix, model_matrix);

        if (draw_points == true) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_id);
            gl.bufferData(gl.ARRAY_BUFFER, obj.point_buffer_array, gl.STATIC_DRAW);
            gl.useProgram(gl_program);

            this._setProgramAttribute(gl_program, ["a_Vertex_position"], [3]);
            // Set program uniform:
            this._setProgramUniform(gl_program, "u_PVM_transform", pvm_transform, "mat4");
            this._setProgramUniform(gl_program, "u_Color", obj.Points.color, "vec4");

            gl.drawArrays(gl.POINTS, 0, obj.Points.vertices.length / 3);
        }

        if (draw_lines == true) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_id);
            gl.bufferData(gl.ARRAY_BUFFER, obj.line_buffer_array, gl.STATIC_DRAW);
            gl.useProgram(gl_program);

            this._setProgramAttribute(gl_program, ["a_Vertex_position"], [3]);
            // Set program uniform:
            this._setProgramUniform(gl_program, "u_PVM_transform", pvm_transform, "mat4");
            this._setProgramUniform(gl_program, "u_Color", obj.Lines.color, "vec4");

            gl.drawArrays(gl.LINES, 0, obj.Lines.vertices.length / 3);
        }
    }
}