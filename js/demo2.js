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
    uniform sampler2D displacement; // Aggiungiamo una mappa di distorsione per l'effetto glitch
    uniform vec4 resolution;

    varying vec2 vUv;

    float random(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      // Manteniamo le UV corrette per centrare il video senza distorsioni
      vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
      
      // Variabili per la progressione
      vec2 p = newUV;
      float x = progress;

      // Calcolo dell'aspect ratio della finestra e del video
      float aspectRatio = resolution.x / resolution.y;
      float imageAspectRatio = resolution.z / resolution.w;

      // Correggiamo le UV per assicurare che il video copra l'intera finestra senza distorsioni
      if (aspectRatio > imageAspectRatio) {
        newUV.y = newUV.y * imageAspectRatio / aspectRatio + (1.0 - imageAspectRatio / aspectRatio) * 0.5;
      } else {
        newUV.x = newUV.x * aspectRatio / imageAspectRatio + (1.0 - aspectRatio / imageAspectRatio) * 0.5;
      }
      
      // Introduciamo un glitch temporaneo durante la transizione
      if (progress > 0.0 && progress < 1.0) {
        // Distorsione UV per l'effetto glitch
        vec4 displacementMap = texture2D(displacement, newUV * 10.0);
        newUV += displacementMap.rg * 0.1 * sin(time * 10.0);
        
        // Effetto di scorrimento casuale
        if (random(vUv) > 0.9) {
          newUV.y += random(vUv) * 0.2 * sin(time * 50.0);
        }
      }

      // Uso di smoothstep per creare una transizione più fluida con glitch
      x = smoothstep(0.0, 1.0, (x * 2.0 + p.y - 1.0));
      
      // Interpolazione tra i due video
      vec4 f = mix(
        texture2D(texture1, (newUV - 0.5) * (1.0 - x) + 0.5), 
        texture2D(texture2, (newUV - 0.5) * x + 0.5), 
        x
      );
      
      // Aggiungiamo variazioni di colore casuali per l'effetto glitch
      if (progress > 0.0 && progress < 1.0) {
        f.r += random(vUv + time) * 0.1;
        f.g += random(vUv + time + 10.0) * 0.1;
        f.b += random(vUv + time + 20.0) * 0.1;
      }

      gl_FragColor = f;
    }
  `
});
