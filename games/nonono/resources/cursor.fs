#version 300 es

precision highp float;

in vec4 vf_Position;
in vec2 vf_UV;
in vec3 vf_Normal;

out vec4 out_Color;

uniform vec4 u_Color;

void main() {

    out_Color = u_Color;
}