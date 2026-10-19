// Loaded only by lazy scene modules. Frames use the same cached asset in their
// own realm: sharing constructors across windows breaks CanvasTexture uploads.
const runtimeUrl='/threeui/vendor/three-r149.js';
await import(/* @vite-ignore */ runtimeUrl);
export const THREE=(globalThis as typeof globalThis&{THREE:typeof import('three')}).THREE;
