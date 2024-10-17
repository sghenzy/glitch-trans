class Sketch {
  constructor(opts) {
    this.scene = new THREE.Scene();
    this.vertex = `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`;
    this.fragment = opts.fragment;
    this.uniforms = opts.uniforms;
    this.renderer = new THREE.WebGLRenderer();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.duration = opts.duration || 1;
    this.debug = opts.debug || false;
    this.easing = opts.easing || 'easeInOut';

    this.clicker = document.getElementById("content");

    this.container = document.getElementById("slider");
    this.videos = ['video/reel1.webm', 'video/reel2.webm']; // Percorsi dei video
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.camera.position.set(0, 0, 2);
    this.time = 0;
    this.current = 0;
    this.textures = [];

    this.paused = true;
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

      // Creiamo una Promise per ogni video
      let promise = new Promise((resolve) => {
        video.addEventListener('loadeddata', () => {
          console.log(`Video ${i + 1} caricato: ${url}`);
          video.play();
          that.textures[i] = new THREE.VideoTexture(video);
          that.textures[i].minFilter = THREE.LinearFilter;
          that.textures[i].magFilter = THREE.LinearFilter;
          that.textures[i].format = THREE.RGBFormat; // Imposta il formato corretto
          resolve();  // Risolviamo la Promise quando il video è pronto
        });
      });

      promises.push(promise);
    });

    // Attendi il caricamento di tutti i video prima di procedere
    Promise.all(promises).then(() => {
      console.log("Tutti i video sono stati caricati correttamente.");
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
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // Calcola il rapporto d'aspetto del video
    this.imageAspect = this.textures[0].image.videoHeight / this.textures[0].image.videoWidth;
    
    let scaleX, scaleY;
    
    // Verifica se lo spazio dell'altezza è maggiore o lo spazio della larghezza è maggiore
    if (this.width / this.height > this.imageAspect) {
        // Se la larghezza della finestra è maggiore, adattiamo l'altezza
        scaleX = this.width / this.height * this.imageAspect;
        scaleY = 1;
    } else {
        // Se l'altezza della finestra è maggiore, adattiamo la larghezza
        scaleX = 1;
        scaleY = this.height / this.width / this.imageAspect;
    }

    // Applica la scala al piano
    this.plane.scale.x = scaleX;
    this.plane.scale.y = scaleY;

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
