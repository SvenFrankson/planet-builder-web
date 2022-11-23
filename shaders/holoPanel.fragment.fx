#version 300 es
precision highp float;
 
uniform sampler2D holoTexture;
uniform float offset;
uniform float alpha;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   
   vec4 color = texture(holoTexture, vUv);
   
   //if (vPositionW.y - floor(vPositionW.y * 30.) / 30. < 0.01) {
   //   color = color * 0.9;
   //}

   float f = (cos((vPositionW.y + offset) * 500.0) + 1.);
   f = min(f, 1.) * 0.25 + 0.75;
   if (color.a < 0.99) {
      color.a *= f;
   }

   color.a *= alpha;

   outColor = color;
}