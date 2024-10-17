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
    uniform sampler2D displacement; // Aggiungiamo la mappa di distorsione per il glitch
    uniform vec4 resolution;

    varying vec2 vUv;

    void main() {
      // Manteniamo le UV corrette per centrare il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
      
      // Variabili per la progressione della transizione
      vec2 p = newUV;
      float x = progress;

      // Calcolo dell'aspect ratio della finestra e del video
      float aspectRatio = resolution.x / resolution.y;
      float imageAspectRatio = resolution.z / resolution.w;

      // Correzione delle UV per mantenere i video ben centrati
      if (aspectRatio > imageAspectRatio) {
        newUV.y = newUV.y * imageAspectRatio / aspectRatio + (1.0 - imageAspectRatio / aspectRatio) * 0.5;
      } else {
        newUV.x = newUV.x * aspectRatio / imageAspectRatio + (1.0 - aspectRatio / imageAspectRatio) * 0.5;
      }

      // Introduciamo un glitch molto breve solo durante la metà della transizione
      if (progress > 0.4 && progress < 0.6) {
        // Distorsione glitch breve durante la transizione
        vec4 displacementMap = texture2D(displacement, newUV * 5.0); // Usa una mappa di distorsione con meno amplificazione
        newUV.x += displacementMap.r * 0.1; // Glitch orizzontale leggero
      }

      // Uso di smoothstep per creare una transizione fluida
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
