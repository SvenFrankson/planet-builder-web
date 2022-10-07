#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;

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
         color = vec3(0., 0., 0.); // none
      }
      else if (d0 < 0.250) {
         color = vec3(43. / 256., 184. / 256., 39. / 256.); // grass
      }
      else if (d0 < 0.375) {
         color = vec3(140. / 256., 63. / 256., 0. / 256.); // dirt
      }
      else if (d0 < 0.5) {
         color = vec3(222. / 256., 193. / 256., 4. / 256.); // sand
      }
      else if (d0 < 0.625) {
         color = vec3(156. / 256., 156. / 256., 156. / 256.); // rock
      }
      else if (d0 < 0.750) {
         color = vec3(107. / 256., 57. / 256., 0. / 256.); // wood
      }
      else if (d0 < 0.875) {
         color = vec3(117. / 256., 171. / 256., 2. / 256.); // leaf
      }
      //color = vec3(d0, d0, d0);
   }
   else if (vColor.g >= vColor.r && vColor.g >= vColor.b) {
      if (d1 < 0.125) {
         color = vec3(0., 0., 0.); // none
      }
      else if (d1 < 0.250) {
         color = vec3(43. / 256., 184. / 256., 39. / 256.); // grass
      }
      else if (d1 < 0.375) {
         color = vec3(140. / 256., 63. / 256., 0. / 256.); // dirt
      }
      else if (d1 < 0.5) {
         color = vec3(222. / 256., 193. / 256., 4. / 256.); // sand
      }
      else if (d1 < 0.625) {
         color = vec3(156. / 256., 156. / 256., 156. / 256.); // rock
      }
      else if (d1 < 0.750) {
         color = vec3(107. / 256., 57. / 256., 0. / 256.); // wood
      }
      else if (d1 < 0.875) {
         color = vec3(117. / 256., 171. / 256., 2. / 256.); // leaf
      }
      //color = vec3(d1, d1, d1);
   }
   else if (vColor.b >= vColor.r && vColor.b >= vColor.g) {
      if (d2 < 0.125) {
         color = vec3(0., 0., 0.); // none
      }
      else if (d2 < 0.250) {
         color = vec3(43. / 256., 184. / 256., 39. / 256.); // grass
      }
      else if (d2 < 0.375) {
         color = vec3(140. / 256., 63. / 256., 0. / 256.); // dirt
      }
      else if (d2 < 0.5) {
         color = vec3(222. / 256., 193. / 256., 4. / 256.); // sand
      }
      else if (d2 < 0.625) {
         color = vec3(156. / 256., 156. / 256., 156. / 256.); // rock
      }
      else if (d2 < 0.750) {
         color = vec3(107. / 256., 57. / 256., 0. / 256.); // wood
      }
      else if (d2 < 0.875) {
         color = vec3(117. / 256., 171. / 256., 2. / 256.); // leaf
      }
      //color = vec3(d2, d2, d2);
   }

   outColor = vec4(color * ndl, 1.);
}