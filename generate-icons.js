/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const svg192 = `<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'>
<rect width='192' height='192' rx='32' fill='#6366f1'/>
<text x='96' y='120' font-family='Arial,sans-serif' font-size='100' font-weight='bold' fill='white' text-anchor='middle'>A</text>
</svg>`;

const svg512 = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
<rect width='512' height='512' rx='64' fill='#6366f1'/>
<text x='256' y='320' font-family='Arial,sans-serif' font-size='280' font-weight='bold' fill='white' text-anchor='middle'>A</text>
</svg>`;

fs.mkdirSync(path.join(__dirname, 'public', 'icons'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'public', 'icons', 'icon-192.svg'), svg192);
fs.writeFileSync(path.join(__dirname, 'public', 'icons', 'icon-512.svg'), svg512);
console.log('Icons created');
