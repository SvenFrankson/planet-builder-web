#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 terrainColors[7];

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   float ndl = dot(vNormalW, lightInvDirW);
   ndl = round(ndl * 5.) / 5.;
   ndl = ndl * 0.5 + 0.5;

   int d0 = int(vColor.a * 32. + 0.03125);
   int d1 = int(vUv.x * 32. + 0.03125);
   int d2 = int(vUv.y * 32. + 0.03125);

   vec3 color = vec3(0., 0., 0.);
   if (vColor.r >= vColor.g && vColor.r >= vColor.b) {
         color = terrainColors[d0];
   }
   else if (vColor.g >= vColor.r && vColor.g >= vColor.b) {
         color = terrainColors[d1];
   }
   else if (vColor.b >= vColor.r && vColor.b >= vColor.g) {
         color = terrainColors[d2];
   }

   outColor = vec4(color * ndl, 1.);
}