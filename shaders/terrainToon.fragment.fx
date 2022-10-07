#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;

in vec3 vPositionW;
in vec3 vNormalW;
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

   vec3 colors[5] = vec3[](
      vec3(0., 0., 0.),
      vec3(0.3, 1.0, 0.2),
      vec3(0.5, 0.3, 0.),
      vec3(0.8, 0.8, 0.),
      vec3(0.3, 0.3, 0.3)
   );
   int d0 = int(vColor.a * 1000.) % 10;
   int d1 = int(vColor.a * 100.) % 100;
   int d2 = int(vColor.a * 10.) % 1000;

   vec3 color = vec3(0., 0., 0.);
   if (vColor.r >= vColor.g && vColor.r >= vColor.b) {
      color = colors[d0];
   }
   else if (vColor.g >= vColor.r && vColor.g >= vColor.b) {
      color = colors[d1];
   }
   else if (vColor.b >= vColor.r && vColor.b >= vColor.g) {
      color = colors[d2];
   }

   outColor = vec4(color * ndl, 1.);
}