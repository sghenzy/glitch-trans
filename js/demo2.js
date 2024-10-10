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
    uniform vec4 resolution; // x = width, y = height, z = aspect ratio correction

    varying vec2 vUv;
    varying vec4 vPosition;

    void main() {
      // Correggi le coordinate UV per il rapporto d'aspetto del video
      vec2 newUV = vUv;
      float aspectRatio = resolution.x / resolution.y;
      newUV.x *= aspectRatio;

      // Applica l'effetto glitch solo durante la transizione (quando progress è tra 0 e 1)
      if (progress < 1.0 && progress > 0.0) {
        // Distorsione glitch temporanea
        newUV.x += sin(newUV.y * 10.0 + time * 5.0) * 0.05;
        newUV.y += cos(newUV.x * 10.0 + time * 5.0) * 0.05;
      }

      // Misceliamo i due video in base al progresso della transizione
      vec4 color1 = texture2D(texture1, newUV);
      vec4 color2 = texture2D(texture2, newUV);

      // Interpolazione tra i due video in base al progresso della transizione
      vec4 finalColor = mix(color1, color2, progress);

      gl_FragColor = finalColor;
    }
  `
});
