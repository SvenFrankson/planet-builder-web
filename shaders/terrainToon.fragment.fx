#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;

in vec3 vPositionW;
in vec3 vNormalW;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   float ndl = dot(vNormalW, lightInvDirW);
   ndl = round(ndl * 5.) / 5.;
   ndl = ndl * 0.5 + 0.5;

   vec3 color = vec3(0., 0., 0.);
   if (vColor.r >= vColor.g && vColor.r >= vColor.b) {
      
   }

   outColor = vec4(vColor.rgb * ndl, 1.);
}