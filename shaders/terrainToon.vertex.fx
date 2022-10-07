#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 color;

uniform mat4 worldViewProjection;
uniform mat4 world;
uniform vec3 lightInvDirW;

out vec3 vPositionW;
out vec3 vNormalW;
out vec2 vUv;
out vec4 vColor;

void main()
{
  gl_Position = worldViewProjection * vec4(position, 1.);

  vPositionW = vec3(world * vec4(position, 1.0));
  vNormalW = normalize(vec3(world * vec4(normal, 0.0)));

  vUv = uv;
  vColor = color;
}