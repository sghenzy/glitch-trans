void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec2 p = newUV;

    // Disattiva temporaneamente l'effetto glitch per verificare il rendering dei video
    // float glitchEffect = smoothstep(0.0, 1.0, progress);
    // if (progress < 1.0 && progress > 0.0) {
    //     newUV.x += sin(newUV.y * 10.0 + time * 5.0) * 0.1 * glitchEffect;
    //     newUV.y += cos(newUV.x * 10.0 + time * 5.0) * 0.1 * glitchEffect;
    // }

    float x = smoothstep(0.0, 1.0, (progress * 2.0 + p.y - 1.0));
    vec4 color1 = texture2D(texture1, (p - 0.5) * (1.0 - x) + 0.5);
    vec4 color2 = texture2D(texture2, (p - 0.5) * x + 0.5);

    // Misceliamo i due video in base al progresso
    vec4 finalColor = mix(color1, color2, progress);
    gl_FragColor = finalColor;
}
