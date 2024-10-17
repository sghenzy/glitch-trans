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

    // Funzione per creare l'effetto pixelato
    vec2 pixelate(vec2 uv, float pixelSize) {
      // Arrotonda le coordinate UV al pixel più vicino
      uv = floor(uv * pixelSize) / pixelSize;
      return uv;
    }

    void main() {
      // Manteniamo le UV corrette per centrare il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
      
      // Calcolo dell'aspect ratio della finestra e del video
      float aspectRatio = resolution.x / resolution.y;
      float imageAspectRatio = resolution.z / resolution.w;

      if (aspectRatio > imageAspectRatio) {
        newUV.y = newUV.y * imageAspectRatio / aspectRatio + (1.0 - imageAspectRatio / aspectRatio) * 0.5;
      } else {
        newUV.x = newUV.x * aspectRatio / imageAspectRatio + (1.0 - aspectRatio / imageAspectRatio) * 0.5;
      }

      // Aumenta il livello di pixelazione in base al progresso della transizione
      float pixelSize = mix(1.0, 50.0, progress); // 1.0 = nessuna pixelazione, 50.0 = massima pixelazione
      vec2 pixelatedUV = pixelate(newUV, pixelSize);

      // Interpolazione tra i due video con pixelazione
      vec4 color1 = texture2D(texture1, pixelatedUV);
      vec4 color2 = texture2D(texture2, pixelatedUV);

      // Miscelazione fluida tra i due video in base al progresso
      vec4 finalColor = mix(color1, color2, progress);
      
      gl_FragColor = finalColor;
    }
  `
});
