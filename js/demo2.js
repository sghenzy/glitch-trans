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

      // Effetto di pixelazione durante la transizione
      float pixelSize = mix(1.0, 20.0, progress); // I pixel diventano più grandi durante la transizione
      vec2 pixelatedUV = floor(newUV * pixelSize) / pixelSize; // Griglia dei pixel per l'effetto

      // Interpolazione tra i due video
      vec4 color1 = texture2D(texture1, pixelatedUV);
      vec4 color2 = texture2D(texture2, pixelatedUV);

      // Uso di smoothstep per creare una transizione fluida
      vec4 finalColor = mix(color1, color2, smoothstep(0.0, 1.0, progress));

      gl_FragColor = finalColor;
    }
  `
});
