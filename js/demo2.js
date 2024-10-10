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
      vec2 newUV = vUv;

      // Corregge l'aspetto del video
      float aspectRatio = resolution.x / resolution.y;
      newUV.x = (vUv.x - 0.5) * aspectRatio + 0.5;

      // Applica glitch solo durante la transizione
      if (progress < 1.0 && progress > 0.0) {
        newUV.x += sin(newUV.y * 10.0 + time * 5.0) * 0.05;
        newUV.y += cos(newUV.x * 10.0 + time * 5.0) * 0.05;
      }

      // Miscelazione tra i due video in base al progresso
      vec4 color1 = texture2D(texture1, newUV);
      vec4 color2 = texture2D(texture2, newUV);

      // Interpolazione finale tra i video
      vec4 finalColor = mix(color1, color2, progress);

      gl_FragColor = finalColor;
    }
  `
});
