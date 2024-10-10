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
    uniform float width;
    uniform float scaleX;
    uniform float scaleY;
    uniform float transition;
    uniform float radius;
    uniform float swipe;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform sampler2D displacement;
    uniform vec4 resolution;

    varying vec2 vUv;

    vec2 mirrored(vec2 v) {
      vec2 m = mod(v, 2.);
      return mix(m, 2.0 - m, step(1.0, m));
    }

    void main() {
      // Mappa le coordinate UV in modo da coprire tutta la finestra senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
      
      // Prendi la mappa di distorsione
      vec4 noise = texture2D(displacement, mirrored(newUV + time * 0.04));

      // Modifica il progresso della transizione con la distorsione
      float prog = progress * 0.8 - 0.05 + noise.g * 0.06;
      float intpl = pow(abs(smoothstep(0.0, 1.0, (prog * 2.0 - vUv.x + 0.5))), 10.0);

      // Recupera i colori dai due video
      vec4 t1 = texture2D(texture1, (newUV - 0.5) * (1.0 - intpl) + 0.5);
      vec4 t2 = texture2D(texture2, (newUV - 0.5) * intpl + 0.5);
      
      // Miscelazione tra i due video
      gl_FragColor = mix(t1, t2, intpl);
    }
  `
});
