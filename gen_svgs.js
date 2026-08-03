/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

const write = (name, content) => {
    fs.writeFileSync(path.join(publicDir, name), content.trim());
    console.log('Created ' + name);
};

const iconGroup = (scale = 1, tx = 0, ty = 0) => `
  <g transform="translate(${tx}, ${ty}) scale(${scale})">
    <rect width="512" height="512" rx="112" fill="#2563EB"/>
    <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
    <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
    <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="140" cy="300" r="16.5" fill="white"/>
    <circle cx="256" cy="300" r="18" fill="white"/>
    <circle cx="376" cy="300" r="16.5" fill="white"/>
    <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
  </g>
`;

const textStyle = `font-family="Inter, Geist, Arial, sans-serif"`;

// 1. favicon.svg
write('favicon.svg', `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563EB"/>
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
</svg>
`);

// 2. logo.svg
write('logo.svg', `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Takt Studio logo</title>
  <desc id="desc">A blue rounded square logo with an abstract T, a production flow line, station nodes and a highlighted bottleneck point.</desc>
  <rect width="512" height="512" rx="112" fill="#2563EB"/>
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
</svg>
`);

// 3. logo-mark.svg
write('logo-mark.svg', `
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
  <rect width="512" height="512" rx="112" fill="#2563EB"/>
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
</svg>
`);

// 4. logo-mark-transparent.svg
write('logo-mark-transparent.svg', `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M128 170H384" stroke="#2563EB" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="#2563EB" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="18" fill="#2563EB"/>
  <circle cx="376" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
</svg>
`);

// 5. logo-horizontal.svg (960x256)
// scale = 160/512 = 0.3125
write('logo-horizontal.svg', `
<svg width="960" height="256" viewBox="0 0 960 256" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
  ${iconGroup(0.3125, 48, 48)}
  <text x="240" y="140" font-size="72" font-weight="800" letter-spacing="-2" ${textStyle} fill="#0F172A">Takt</text>
  <text x="405" y="140" font-size="72" font-weight="800" letter-spacing="-2" ${textStyle} fill="#2563EB">Studio</text>
  <text x="245" y="180" font-size="20" font-weight="500" letter-spacing="0" ${textStyle} fill="#64748B">Simulación y análisis de líneas de producción</text>
</svg>
`);

// 6. logo-horizontal-dark.svg
write('logo-horizontal-dark.svg', `
<svg width="960" height="256" viewBox="0 0 960 256" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
  ${iconGroup(0.3125, 48, 48)}
  <text x="240" y="140" font-size="72" font-weight="800" letter-spacing="-2" ${textStyle} fill="#FFFFFF">Takt</text>
  <text x="405" y="140" font-size="72" font-weight="800" letter-spacing="-2" ${textStyle} fill="#60A5FA">Studio</text>
  <text x="245" y="180" font-size="20" font-weight="500" letter-spacing="0" ${textStyle} fill="#CBD5E1">Simulación y análisis de líneas de producción</text>
</svg>
`);

// 7. logo-horizontal-light.svg
// No tagline, compact
write('logo-horizontal-light.svg', `
<svg width="720" height="160" viewBox="0 0 720 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
  ${iconGroup(0.234375, 24, 20)} <!-- 120x120 icon (scale 0.234) -->
  <text x="168" y="105" font-size="64" font-weight="800" letter-spacing="-2" ${textStyle} fill="#0F172A">Takt</text>
  <text x="315" y="105" font-size="64" font-weight="800" letter-spacing="-2" ${textStyle} fill="#2563EB">Studio</text>
</svg>
`);

// 8. logo-horizontal-compact.svg
write('logo-horizontal-compact.svg', `
<svg width="720" height="160" viewBox="0 0 720 160" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Takt Studio">
  ${iconGroup(0.234375, 24, 20)}
  <text x="168" y="105" font-size="64" font-weight="800" letter-spacing="-2" ${textStyle} fill="#0F172A">Takt Studio</text>
</svg>
`);

// 9. logo-monochrome.svg
// Only #2563EB
write('logo-monochrome.svg', `
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="112" fill="#2563EB"/>
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="18" fill="#2563EB"/>
  <circle cx="376" cy="300" r="16.5" fill="#2563EB"/>
  <circle cx="256" cy="300" r="10.5" fill="white"/>
</svg>
`);

// 10. logo-white.svg
// All white
write('logo-white.svg', `
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="white" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#0F172A"/> <!-- Inner bottleneck inverted for visibility -->
</svg>
`);

// 11. maskable-icon.svg
// No rx, scaled down inside 512x512
// Let's scale down the inner part. Scale 0.8 around center. Translate by 51.2
const maskableInner = `
  <path d="M128 170H384" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M256 170V334" stroke="white" stroke-width="38" stroke-linecap="round"/>
  <path d="M140 300C184 252 218 252 256 300C294 348 336 348 376 300" stroke="#06B6D4" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="140" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="18" fill="white"/>
  <circle cx="376" cy="300" r="16.5" fill="white"/>
  <circle cx="256" cy="300" r="10.5" fill="#22C55E"/>
`;
write('maskable-icon.svg', `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563EB"/>
  <g transform="translate(51.2, 51.2) scale(0.8)">
    ${maskableInner}
  </g>
</svg>
`);

// 12. apple-touch-icon-source.svg
write('apple-touch-icon-source.svg', `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563EB"/>
  ${maskableInner}
</svg>
`);
