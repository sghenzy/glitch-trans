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
      float x = progress;

      // Calcolo dell'aspect ratio della finestra e del video
      float aspectRatio = resolution.x / resolution.y;
      float imageAspectRatio = resolution.z / resolution.w;

      // Riduciamo ulteriormente il fattore di ridimensionamento (zoom ancora più basso)
      if (aspectRatio > imageAspectRatio) {
        // Se la finestra è più larga rispetto al video, ridimensioniamo in altezza (con meno zoom)
        newUV.y = newUV.y * imageAspectRatio / aspectRatio * 0.85 + (1.0 - imageAspectRatio / aspectRatio * 0.85) * 0.5;
      } else {
        // Se la finestra è più alta rispetto al video, ridimensioniamo in larghezza (con meno zoom)
        newUV.x = newUV.x * aspectRatio / imageAspectRatio * 0.85 + (1.0 - aspectRatio / imageAspectRatio * 0.85) * 0.5;
      }

      // Effetto glitch (distorsione casuale)
      float glitch = sin(time * 10.0) * 0.05 * progress; // Distorsione glitch casuale basata su sinusoide
      vec2 glitchOffset = vec2(glitch, 0.0);
      
      // Applichiamo il glitch solo durante la transizione
      vec4 color1 = texture2D(texture1, newUV + glitchOffset);
      vec4 color2 = texture2D(texture2, newUV - glitchOffset);
      
      // Mix dei due video con effetto glitch
      vec4 finalColor = mix(color1, color2, smoothstep(0.0, 1.0, progress));

      gl_FragColor = finalColor;
    }
  `
});
