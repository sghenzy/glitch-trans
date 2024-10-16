class Sketch {
  constructor(opts) {
    this.scene = new THREE.Scene();
    
    // Renderer con anti-aliasing e alpha per trasparenza
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true // Canvas trasparente se necessario
    });
    
    // Impostazioni del renderer
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Impostazioni della scena e del canvas
    document.body.appendChild(this.renderer.domElement);
  
    this.vertex = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    this.fragment = opts.fragment;
    this.uniforms = opts.uniforms;
  
    // Dimensioni del canvas
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1); // Rimuovere se non desideri un background bianco
  
    this.duration = opts.duration || 1;
    this.debug = opts.debug || false;
    this.easing = opts.easing || 'easeInOut';
  
    this.clicker = document.getElementById("content");
    this.container = document.getElementById("slider");
    
    // Definisco i percorsi dei video
    this.videos = ['video/reel1.webm', 'video/reel2.webm'];
    
    // Ottieni le dimensioni dal container e aggiungi il canvas
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);
  
    // Configura la camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(0, 0, 2);
  
    this.time = 0;
    this.current = 0;
    this.textures = [];
  
    // Imposta il flag di pausa
    this.paused = true;
  
    // Inizializza il setup, carica i video e avvia il rendering
    this.initiate(() => {
      console.log(this.textures);
      this.setupResize();
      this.settings();
      this.addObjects();
      this.resize();
      this.clickEvent();
      this.play();
    });
  }
  

  initiate(cb) {
    const promises = [];
    let that = this;
  
    this.videos.forEach((url, i) => {
      let video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
  
      // Promise per caricare i video
      let promise = new Promise((resolve) => {
        video.addEventListener('loadeddata', () => {
          video.play();
          that.textures[i] = new THREE.VideoTexture(video);
          that.textures[i].minFilter = THREE.LinearFilter;
          that.textures[i].magFilter = THREE.LinearFilter;
          that.textures[i].format = THREE.RGBFormat;
          resolve();
        });
      });
  
      promises.push(promise);
    });
  
    Promise.all(promises).then(() => {
      cb();
    });
  }
  

  clickEvent() {
    this.clicker.addEventListener('click', () => {
      this.next();
    });
  }

  settings() {
    let that = this;
    if (this.debug) this.gui = new dat.GUI();
    this.settings = { progress: 0.5 };

    Object.keys(this.uniforms).forEach((item) => {
      this.settings[item] = this.uniforms[item].value;
      if (this.debug) this.gui.add(this.settings, item, this.uniforms[item].min, this.uniforms[item].max, 0.01);
    });
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
  
    // Manteniamo l'aspect ratio del video originale
    this.imageAspect = this.textures[0].image.videoHeight / this.textures[0].image.videoWidth;
  
    let a1, a2;
    if (this.height / this.width > this.imageAspect) {
      // Se la finestra è più alta rispetto al video, scalare la larghezza
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      // Se la finestra è più larga rispetto al video, scalare l'altezza
      a1 = 1;
      a2 = (this.height / this.width) / this.imageAspect;
    }
  
    // Aggiorniamo le dimensioni corrette nello shader
    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;
  
    // Aggiorna il campo visivo della camera per mantenere il video centrato
    const dist = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
  
    // Imposta la scala del piano per comportarsi come 'object-fit: cover'
    if (this.camera.aspect > this.imageAspect) {
      this.plane.scale.x = this.camera.aspect / this.imageAspect;
      this.plane.scale.y = 1;
    } else {
      this.plane.scale.x = 1;
      this.plane.scale.y = this.imageAspect / this.camera.aspect;
    }
  
    this.camera.updateProjectionMatrix();
  }  

  addObjects() {
    let that = this;

    // Crea il materiale per lo shader con le VideoTexture
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        progress: { type: "f", value: 0 },
        border: { type: "f", value: 0 },
        intensity: { type: "f", value: 0 },
        scaleX: { type: "f", value: 40 },
        scaleY: { type: "f", value: 40 },
        transition: { type: "f", value: 40 },
        swipe: { type: "f", value: 0 },
        width: { type: "f", value: 0 },
        radius: { type: "f", value: 0 },
        texture1: { type: "t", value: this.textures[0] }, // Primo video
        texture2: { type: "t", value: this.textures[1] }, // Secondo video
        displacement: { type: "t", value: new THREE.TextureLoader().load('img/disp1.jpg') }, // Mappa di distorsione
        resolution: { type: "v4", value: new THREE.Vector4() }, // Risoluzione e rapporto d'aspetto
      },
      vertexShader: this.vertex,
      fragmentShader: this.fragment
    });

    // Crea il piano con dimensioni iniziali di 1x1
    this.geometry = new THREE.PlaneGeometry(1, 1, 2, 2);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    
    // Aggiunge il piano alla scena
    this.scene.add(this.plane);

    // Scala il piano in base alla risoluzione video
    this.resize();
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
    this.render();
  }

  next() {
    if (this.isRunning) return;
    this.isRunning = true;
    let len = this.textures.length;
    let nextTexture = this.textures[(this.current + 1) % len];
    this.material.uniforms.texture2.value = nextTexture;
    let tl = new TimelineMax();
    tl.to(this.material.uniforms.progress, this.duration, {
      value: 1,
      ease: Power2[this.easing],
      onComplete: () => {
        console.log('FINISH');
        this.current = (this.current + 1) % len;
        this.material.uniforms.texture1.value = nextTexture;
        this.material.uniforms.progress.value = 0;
        this.isRunning = false;
      }
    });
  }

  render() {
    if (this.paused) return;
    this.time += 0.05;
    this.material.uniforms.time.value = this.time;

    // Aggiorna le video texture
    this.textures.forEach((texture) => {
      if (texture) {
        texture.needsUpdate = true; // Forza l'aggiornamento della texture video
      }
    });

    Object.keys(this.uniforms).forEach((item) => {
      this.material.uniforms[item].value = this.settings[item];
    });

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
