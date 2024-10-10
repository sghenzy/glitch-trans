void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);

    // Renderizza solo il primo video senza transizione per il test
    vec4 color1 = texture2D(texture1, newUV);
    gl_FragColor = color1;
}
