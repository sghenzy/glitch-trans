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
    uniform vec4 resolution; // x = window width, y = window height, z = aspect ratio correction

    varying vec2 vUv;

    void main() {
      // Mappa le coordinate UV in modo da coprire tutta la finestra senza distorsioni
      vec2 newUV = vUv;

      // Non applichiamo distorsioni sui bordi
      newUV = vUv;

      // Interpolazione tra i due video
      vec4 color1 = texture2D(texture1, newUV);
      vec4 color2 = texture2D(texture2, newUV);

      // Miscelazione finale tra i video in base al progresso della transizione
      vec4 finalColor = mix(color1, color2, progress);

      gl_FragColor = finalColor;
    }
  `
});
