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
      
      // Calcolo dell'aspect ratio della finestra e del video
      float aspectRatio = resolution.x / resolution.y;
      float imageAspectRatio = resolution.z / resolution.w;

      // Manteniamo le UV senza distorsioni
      if (aspectRatio > imageAspectRatio) {
        newUV.y = newUV.y * imageAspectRatio / aspectRatio + (1.0 - imageAspectRatio / aspectRatio) * 0.5;
      } else {
        newUV.x = newUV.x * aspectRatio / imageAspectRatio + (1.0 - aspectRatio / imageAspectRatio) * 0.5;
      }
      
      // Definisce la pixelatura durante la transizione: parte da 1 (nessuna pixelatura) e aumenta fino a 20 quando progress è 0.5
      float pixelSize = mix(1.0, 20.0, smoothstep(0.0, 0.5, progress));
      
      // Applica la pixelatura solo durante la transizione
      vec2 pixelatedUV = floor(newUV * pixelSize) / pixelSize;

      // Interpolazione tra i due video con pixelatura visibile solo durante la transizione
      vec4 color1 = texture2D(texture1, pixelatedUV);
      vec4 color2 = texture2D(texture2, pixelatedUV);

      // Usa smoothstep per miscelare i video in base al progresso
      vec4 finalColor = mix(color1, color2, smoothstep(0.0, 1.0, progress));

      gl_FragColor = finalColor;
    }
  `
});
