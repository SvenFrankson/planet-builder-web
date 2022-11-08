#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 terrainColors[8];
uniform vec3 globalColor;
uniform int useSeaLevelTexture;
uniform sampler2D seaLevelTexture;

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
   //sunFactor = round(sunFactor * 5.) / 5.;
   //sunFactor = 1.;

   float sunLightFactor = max(dot(vNormalW, lightInvDirW), 0.0);
   //sunLightFactor = round(sunLightFactor * 2.) / 2.;
   //sunLightFactor = 1.;

   float ambiantLightFactor = 1.;
   if (flatness < 0.7) {
      ambiantLightFactor = 0.7;
   }
   if (flatness < -0.3) {
      ambiantLightFactor = 0.4;
   }

   float lightFactor = sunFactor * sunLightFactor + ambiantLightFactor;

   lightFactor = round(lightFactor * 3.) / 3.;
   lightFactor = lightFactor * 0.8 + 0.2;

   vec3 color = vec3(0., 0., 0.);
   if (useSeaLevelTexture == 1) {
      color = texture(seaLevelTexture, vUv).rgb;
   }
   else {
      int d0 = int(vColor.a * 128. + 0.002);
      int d1 = int(vUv.x * 128. + 0.002);
      int d2 = int(vUv.y * 128. + 0.002);

      if (vColor.r >= vColor.g && vColor.r >= vColor.b) {
         if (d0 == 2 && flatness < 0.7) {
            d0 = 3;
         }
         color = terrainColors[d0];
      }
      else if (vColor.g >= vColor.r && vColor.g >= vColor.b) {
         if (d1 == 2 && flatness < 0.7) {
            d1 = 3;
         }
         color = terrainColors[d1];
      }
      else if (vColor.b >= vColor.r && vColor.b >= vColor.g) {
         if (d2 == 2 && flatness < 0.7) {
            d2 = 3;
         }
         color = terrainColors[d2];
      }
   }

   outColor = vec4(globalColor + color * lightFactor, 1.);
}