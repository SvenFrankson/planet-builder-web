#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 terrainColors[7];

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
/*
   None = 0,
   Grass,
   Dirt,
   Sand,
   Rock,
   Wood,
   Leaf
*/
 
void main() {
   float ndl = dot(vNormalW, lightInvDirW);
   ndl = round(ndl * 5.) / 5.;
   ndl = ndl * 0.5 + 0.5;

   float d0 = vColor.a + 0.125 / 2.;
   float d1 = vUv.x + 0.125 / 2.;
   float d2 = vUv.y + 0.125 / 2.;

   vec3 color = vec3(0., 0., 0.);
   if (vColor.r >= vColor.g && vColor.r >= vColor.b) {
      if (d0 < 0.125) {
         color = terrainColors[0]; // none
      }
      else if (d0 < 0.250) {
         color = terrainColors[1];
      }
      else if (d0 < 0.375) {
         color = terrainColors[2];
      }
      else if (d0 < 0.5) {
         color = terrainColors[3];
      }
      else if (d0 < 0.625) {
         color = terrainColors[4];
      }
      else if (d0 < 0.750) {
         color = terrainColors[5];
      }
      else if (d0 < 0.875) {
         color = terrainColors[6];
      }
   }
   else if (vColor.g >= vColor.r && vColor.g >= vColor.b) {
      if (d1 < 0.125) {
         color = terrainColors[0]; // none
      }
      else if (d1 < 0.250) {
         color = terrainColors[1];
      }
      else if (d1 < 0.375) {
         color = terrainColors[2];
      }
      else if (d1 < 0.5) {
         color = terrainColors[3];
      }
      else if (d1 < 0.625) {
         color = terrainColors[4];
      }
      else if (d1 < 0.750) {
         color = terrainColors[5];
      }
      else if (d1 < 0.875) {
         color = terrainColors[6];
      }
   }
   else if (vColor.b >= vColor.r && vColor.b >= vColor.g) {
      if (d2 < 0.125) {
         color = terrainColors[0]; // none
      }
      else if (d2 < 0.250) {
         color = terrainColors[1];
      }
      else if (d2 < 0.375) {
         color = terrainColors[2];
      }
      else if (d2 < 0.5) {
         color = terrainColors[3];
      }
      else if (d2 < 0.625) {
         color = terrainColors[4];
      }
      else if (d2 < 0.750) {
         color = terrainColors[5];
      }
      else if (d2 < 0.875) {
         color = terrainColors[6];
      }
   }

   outColor = vec4(color * ndl, 1.);
}