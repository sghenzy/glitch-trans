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
      // Manteniamo le UV corrette per il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);

      // Applica la pixelazione solo durante la transizione con un effetto fade-out graduale
      vec2 finalUV = newUV;
      if (progress > 0.0 && progress < 1.0) {
        float pixelSize = mix(1.0, 50.0, progress); // Da 1 (nessuna pixelazione) a 50 (pixelazione massima)
        finalUV = floor(newUV * pixelSize) / pixelSize;

        // Applichiamo un effetto di dissolvenza per i pixel verso la fine
        float fade = smoothstep(0.8, 1.0, progress); // Fade in/out nella fase finale della transizione
        finalUV = mix(finalUV, newUV, fade); // Transizione fluida verso la non-pixelazione
      }

      // Interpolazione tra i due video
      vec4 color1 = texture2D(texture1, finalUV);
      vec4 color2 = texture2D(texture2, finalUV);

      // Transizione tra i due video
      vec4 finalColor = mix(color1, color2, progress);

      gl_FragColor = finalColor;
    }
  `
});
