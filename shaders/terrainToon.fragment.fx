#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;
uniform vec3 terrainColors[12];
uniform vec3 globalColor;
uniform vec3 planetPos;
uniform int useSeaLevelTexture;
uniform sampler2D seaLevelTexture;
uniform int useVertexColor;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   float alt = length(vPositionW - planetPos);
   vec3 localUp = (vPositionW - planetPos) / alt;
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

   float lightFactor = sunLightFactor * 0.8 + 0.2;

   lightFactor = round(lightFactor * 5.) / 5.;
   if (flatness < 0.6 && flatness > - 0.6) {
      lightFactor += 0.1;
   }

   vec3 color = vec3(0., 0., 0.);
   if (useSeaLevelTexture == 1) {
      color = texture(seaLevelTexture, vUv).rgb;
   }
   else if (useVertexColor == 1) {
      color = vec3(1., 0., 0.);
   }
   else {
      //color = vec3(0.50, 0.96, 0.36);
      
      int d = int(vColor.r * 128. + 0.002);
      if (d == 2 && flatness < 0.6) {
         d = 3;
      } 
      color = terrainColors[d];
   }

   outColor = vec4(globalColor + color * lightFactor, 1.);
}