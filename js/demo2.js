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
    uniform sampler2D displacement; // Mappa di distorsione
    uniform vec4 resolution;

    varying vec2 vUv;

    void main() {
      // Mappa le coordinate UV in modo da coprire tutta la finestra senza distorsioni
      vec2 newUV = vUv;

      // Applica la mappa di distorsione per spostare le UV durante la transizione
      vec4 disp = texture2D(displacement, newUV);
      vec2 distortedUV = newUV + progress * (disp.rg * 2.0 - 1.0) * 0.2; // Distorsione UV

      // Recupera i colori dai due video usando le UV distorte
      vec4 color1 = texture2D(texture1, distortedUV);
      vec4 color2 = texture2D(texture2, distortedUV);

      // Interpolazione tra i due video
      vec4 finalColor = mix(color1, color2, progress);

      gl_FragColor = finalColor;
    }
  `
});
