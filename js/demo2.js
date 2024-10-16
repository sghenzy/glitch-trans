let sketch = new Sketch({
  duration: 1.5,
  debug: false,
  easing: 'easeOut',
  uniforms: {
    width: { value: 0.5, type: 'f', min: 0, max: 10 },
  },
  fragment: `
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform vec4 resolution;

    varying vec2 vUv;

    void main() {
      // Manteniamo le UV corrette per centrare il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
      
      // Variabili per la progressione
      vec2 p = newUV;

      // Effetto pixelato durante la transizione
      float pixelSize = mix(1.0, 20.0, progress); // I pixel diventano più grandi durante la transizione
      vec2 pixelatedUV = floor(newUV * pixelSize) / pixelSize; // Ridimensioniamo la griglia dei pixel
      
      // Prendiamo i colori dai due video
      vec4 color1 = texture2D(texture1, pixelatedUV);
      vec4 color2 = texture2D(texture2, pixelatedUV);
      
      // Mix dei due video
      vec4 finalColor = mix(color1, color2, progress);

      gl_FragColor = finalColor;
    }
  `
});
