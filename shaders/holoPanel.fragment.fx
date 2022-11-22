#version 300 es
precision highp float;
 
uniform sampler2D holoTexture;
uniform float offset;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   
   vec4 color = texture(holoTexture, vUv);
   
   if (vPositionW.y - floor(vPositionW.y * 30.) / 30. < 0.01) {
      color = color * 0.9;
   }

   outColor = color;
}