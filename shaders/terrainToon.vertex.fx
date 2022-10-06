#version 300 es

in vec3 position;
in vec4 color;
uniform mat4 worldViewProjection;

flat out vec4 VertexColor;

void main()
{
  gl_Position = worldViewProjection * vec4(position, 1.);
  VertexColor = color;
}