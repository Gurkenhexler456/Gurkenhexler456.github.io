#version 300 es

precision highp float;

in vec4 vf_Color;

out vec4 out_Color;

void main() {

    out_Color = vf_Color;
}