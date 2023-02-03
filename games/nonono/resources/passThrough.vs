#version 300 es

layout (location = 0) in vec3 in_Position;
layout (location = 1) in vec3 in_Color;

out vec4 vf_Color;

void main() {

    vf_Color = vec4(in_Color, 1);
    gl_Position = vec4(in_Position, 1.0);
}