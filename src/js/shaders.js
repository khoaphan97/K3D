export const WIRE_FRAME_SHADER = {
    VERT: `
        precision mediump float;

        attribute vec3 a_Vertex_position;
        uniform mat4 u_PVM_transform;

        void main() {
            gl_PointSize = 5.0;
            gl_Position = u_PVM_transform * vec4( a_Vertex_position, 1.0);
        }
    `
    ,
    FRAG: `
        precision mediump float;

        uniform vec4 u_Color;

        void main() {
            gl_FragColor = u_Color;
        }
    `
}

export const BASIC_SHADER = {
    VERT: `
        precision mediump float;
        attribute vec3 a_Vertex_position;
        attribute vec3 a_Color;

        uniform mat4 u_PVM_transform;

        varying vec3 v_Color;
        void main() {
            v_Color = a_Color;
            gl_Position = u_PVM_transform * vec4( a_Vertex_position, 1.0);
        }
    `,
    FRAG: `
        precision mediump float;

        varying vec3 v_Color;

        void main() {
            gl_FragColor = vec4(v_Color, 1.0);
        }
    `
}

export const BASIC_LIGHTING_SHADER = {
    VERT: `
        // Vertex Shader
        precision mediump float;
        
        // Scene transformations
        uniform mat4 u_PVM_transform; // Projection, view, model transform
        uniform mat4 u_VM_transform; // View, model transform
        
        // Original model data
        attribute vec3 a_Vertex_position;
        attribute vec3 a_Color;
        attribute vec3 a_Vertex_normal;
        
        // Data (to be interpolated) that is passed on to the fragment shader
        varying vec3 v_Vertex_position;
        varying vec4 v_Color;
        varying vec3 v_Vertex_normal;
        
        void main() {

            v_Vertex_normal = vec3(u_VM_transform * vec4(a_Vertex_normal, 0.0));
            v_Vertex_position = vec3(u_VM_transform * vec4(a_Vertex_position, 1.0)); //Location of vertices infront the camera
            v_Color = vec4(a_Color, 1.0);

            gl_Position = u_PVM_transform * vec4(a_Vertex_position, 1.0); //Location of vertices project on the screen
        }
    `,
    FRAG: `
        // Fragment shader program
        precision mediump float;

        // Light information
        uniform vec3 u_Light_position; // Position of point light
        uniform vec3 u_Light_color; // Point light color
        uniform float u_Light_intensity;

        uniform vec3 u_Ambient_color;
        uniform float u_Ambient_intensity;

        // Data passed from the vertex shader:
        varying vec4 v_Color;
        varying vec3 v_Vertex_position;
        varying vec3 v_Vertex_normal;
        
        void main() {
            vec3 color;
            vec3 diffuse_color;
            vec3 specular_color;
            vec3 ambient_color;
            vec3 reflection;
            vec3 to_camera;
            vec3 to_light;
            vec3 vertex_normal;
            float cos_angle_diffuse;
            float cos_angle_specular;
            float attenuation;
            float d;

            // =========== CALCULATING AMBIENT LIGHT COLOR ============//
            ambient_color = u_Ambient_color * vec3(v_Color) * u_Ambient_intensity;
            // =========== CALCULATING DIFFUSE LIGHT COLOR ============//
            to_light = normalize(u_Light_position - v_Vertex_position);

            vertex_normal = normalize(v_Vertex_normal); // Normalize after interpolated
            cos_angle_diffuse = dot(to_light, vertex_normal); // Dot product of the 2 above unit vector
            cos_angle_diffuse = clamp(cos_angle_diffuse, 0., 1.); //  Limit the value in positive range

            diffuse_color = vec3(v_Color) * cos_angle_diffuse * u_Light_intensity;
            // =========== CALCULATING SPECULAR REFLECTION COLOR ============//
            reflection = 2.0 * dot(vertex_normal, to_light) * vertex_normal - to_light;

            to_camera = normalize(-1.0 * v_Vertex_position);

            cos_angle_specular = dot(reflection, to_camera); // Dot product of the 2 above unit vector
            cos_angle_specular = clamp(cos_angle_specular, 0., 1.); //  Limit the value in positive range
            cos_angle_specular = pow(cos_angle_specular, 128.); // Power by some shininess

            if (cos_angle_specular > 0.0) {
                specular_color = u_Light_color * cos_angle_specular;
                diffuse_color = diffuse_color * (1.0 - cos_angle_specular);
            } else {
                specular_color = vec3(0.0, 0.0, 0.0);
            }
            // =========== CALCULATING LIGHT ATTENUATION ============//
            d = length(u_Light_position - v_Vertex_position); // Distance from light source to object
            attenuation = 5.0 / (1.0 + 0.1*d + 0.01*d*d);
            attenuation = clamp(attenuation, 0.0, 1.0);
            // =========== ADD COLOR ============//
            color = (diffuse_color + specular_color + ambient_color) * attenuation;            
            gl_FragColor = vec4(color, 1.0);
        }
    `
}