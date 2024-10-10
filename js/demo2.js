let sketch = new Sketch({
	duration: 1.5,
	debug: false,
	easing: 'easeOut',
	uniforms: {
		width: {value: 0.5, type:'f', min:0, max:10},
	},
	fragment: `
		uniform float time;
		uniform float progress;
		uniform sampler2D texture1;
		uniform sampler2D texture2;
		uniform vec4 resolution;

		varying vec2 vUv;
		varying vec4 vPosition;

		void main() {
    			vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);

    			// Renderizza solo il primo video senza transizione per testare
    			vec4 color1 = texture2D(texture1, newUV);
    			gl_FragColor = color1;
		}
	`
});
