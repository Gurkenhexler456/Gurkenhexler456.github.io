#version 300 es

layout (location = 0) in vec3 in_Position;
layout (location = 1) in vec2 in_UV;
layout (location = 2) in vec3 in_Normal;

out vec4 vf_Position;
out vec2 vf_UV;
out vec3 vf_Normal;

uniform mat4 u_Model;
uniform mat4 u_Projection;

void main() {

    vf_Position = u_Model * vec4(in_Position, 1.0);
    vf_UV = in_UV;
    vf_Normal = in_Normal;

    gl_Position = u_Projection * vf_Position;
}