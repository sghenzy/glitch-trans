let sketch = new Sketch({
  duration: 1.5,
  debug: false,
  easing: 'easeOut',
  uniforms: {
    width: { value: 0.5, type: 'f', min: 0, max: 10 },
    displacementFactor: { value: 0.3, type: 'f', min: 0, max: 1 },
  },
  fragment: `
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform vec4 resolution;
    uniform sampler2D displacementMap;  // La mappa di displacement
    uniform float displacementFactor;   // Fattore di distorsione

    varying vec2 vUv;

    void main() {
      // Manteniamo le UV corrette per centrare il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
      
      // Applichiamo la distorsione usando la mappa di displacement
      vec2 displacement = texture2D(displacementMap, vUv).rg * displacementFactor; 
      vec2 displacedUV = newUV + displacement;

      // Progressione della transizione (orizzontale)
      float x = smoothstep(0.0, 1.0, (progress * 2.0 + displacedUV.x - 1.0));
      
      // Interpolazione tra i due video
      vec4 f = mix(
        texture2D(texture1, (displacedUV - 0.5) * (1.0 - x) + 0.5), 
        texture2D(texture2, (displacedUV - 0.5) * x + 0.5), 
        x
      );

      // Output finale del colore
      gl_FragColor = f;
    }
  `
});
