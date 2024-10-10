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
      // Corregge le coordinate UV per centrare il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);

      // Variabili per la progressione
      vec2 p = newUV;
      float x = progress;

      // Correzione dell'aspect ratio del video
      float aspectRatio = resolution.x / resolution.y;
      float imageAspectRatio = resolution.z / resolution.w;

      if (aspectRatio > imageAspectRatio) {
        // La finestra è più larga rispetto al video
        newUV.y *= imageAspectRatio / aspectRatio;
      } else {
        // La finestra è più alta rispetto al video
        newUV.x *= aspectRatio / imageAspectRatio;
      }
      
      // Uso di smoothstep per creare una transizione più fluida
      x = smoothstep(0.0, 1.0, (x * 2.0 + p.y - 1.0));
      
      // Interpolazione tra i due video
      vec4 f = mix(
        texture2D(texture1, (newUV - 0.5) * (1.0 - x) + 0.5), 
        texture2D(texture2, (newUV - 0.5) * x + 0.5), 
        x
      );
      
      gl_FragColor = f;
    }
  `
});
