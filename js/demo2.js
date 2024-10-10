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
      // Mappa le coordinate UV in modo da coprire tutta la finestra senza distorsioni
      vec2 newUV = vUv;

      // Variabile per l'intensità della distorsione glitch
      float glitchStrength = 0.8;

      // Applica glitch solo durante la transizione
      if (progress < 1.0 && progress > 0.0) {
        // Distorsione delle coordinate UV con sinusoidi per creare l'effetto glitch
        newUV.x += sin(newUV.y * 10.0 + time * 5.0) * glitchStrength * (1.0 - progress);
        newUV.y += cos(newUV.x * 10.0 + time * 5.0) * glitchStrength * (1.0 - progress);
      }

      // Miscelazione tra i due video
      vec4 color1 = texture2D(texture1, newUV);
      vec4 color2 = texture2D(texture2, newUV);

      // Interpolazione finale tra i video con l'effetto glitch
      vec4 finalColor = mix(color1, color2, smoothstep(0.0, 1.0, progress));

      gl_FragColor = finalColor;
    }
  `
});
