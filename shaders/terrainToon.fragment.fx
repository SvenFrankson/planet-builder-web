#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 terrainColors[7];
uniform vec3 globalColor;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   vec3 localUp = normalize(vPositionW);
   float flatness = dot(vNormalW, localUp);

   float cosAlphaZenith = dot(localUp, lightInvDirW);
   
   float sunFactor = max(cosAlphaZenith, 0.0);
   sunFactor = round(sunFactor * 10.) / 10.;

   float sunLightFactor = max(dot(vNormalW, lightInvDirW), 0.0);
   sunLightFactor = round(sunLightFactor * 4.) / 4.;

   float ambiantLightFactor = ((flatness + 1.) * 0.5);
   ambiantLightFactor = round(ambiantLightFactor * 4.) / 4. * 0.3;

   float lightFactor = sunFactor * sunLightFactor + ambiantLightFactor;

   lightFactor = lightFactor * 0.9 + 0.1;

   int d0 = int(vColor.a * 128. + 0.002);
   int d1 = int(vUv.x * 128. + 0.002);
   int d2 = int(vUv.y * 128. + 0.002);

   vec3 color = vec3(0., 0., 0.);
   if (vColor.r >= vColor.g && vColor.r >= vColor.b) {
      if (d0 == 2 && flatness < 0.5) {
         d0 = 3;
      }
      color = terrainColors[d0];
   }
   else if (vColor.g >= vColor.r && vColor.g >= vColor.b) {
      if (d1 == 2 && flatness < 0.5) {
         d1 = 3;
      }
      color = terrainColors[d1];
   }
   else if (vColor.b >= vColor.r && vColor.b >= vColor.g) {
      if (d2 == 2 && flatness < 0.5) {
         d2 = 3;
      }
      color = terrainColors[d2];
   }

   outColor = vec4(globalColor + color * lightFactor, 1.);
}