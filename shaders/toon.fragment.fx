#version 300 es
precision highp float;
 
uniform vec3 lightInvDirW;

in vec3 vPositionW;
in vec3 vNormalW;
in vec2 vUv;
in vec4 vColor;

out vec4 outColor;
 
void main() {
   float sunLightFactor = max(dot(vNormalW, lightInvDirW), 0.0);

   float lightFactor = round(sunLightFactor * 4.) / 4.;

   vec3 color = vColor.rgb;

   outColor = vec4(color * lightFactor, 1.);
}