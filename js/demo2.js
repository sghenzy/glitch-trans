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

      // Rimuoviamo completamente il fattore di ridimensionamento (senza zoom aggiuntivo)
      if (aspectRatio > imageAspectRatio) {
        // Se la finestra è più larga rispetto al video, ridimensioniamo in altezza
        newUV.y = newUV.y * imageAspectRatio / aspectRatio + (1.0 - imageAspectRatio / aspectRatio) * 0.5;
      } else {
        // Se la finestra è più alta rispetto al video, ridimensioniamo in larghezza
        newUV.x = newUV.x * aspectRatio / imageAspectRatio + (1.0 - aspectRatio / imageAspectRatio) * 0.5;
      }

      // Iniziamo l'effetto di transizione pixelata
      float pixelSize = mix(1.0, 30.0, progress); // I pixel diventano più grandi durante la transizione
      vec2 pixelatedUV = floor(newUV * pixelSize) / pixelSize; // Ridimensioniamo la griglia dei pixel
      
      // Prendiamo i colori dai due video con l'effetto pixelato
      vec4 color1 = texture2D(texture1, pixelatedUV);
      vec4 color2 = texture2D(texture2, pixelatedUV);
      
      // Uso di smoothstep per creare una transizione più fluida
      x = smoothstep(0.0, 1.0, (x * 2.0 + p.y - 1.0));
      
      // Interpolazione tra i due video con effetto pixelato
      vec4 finalColor = mix(color1, color2, x);
      
      gl_FragColor = finalColor;
    }
  `
});
