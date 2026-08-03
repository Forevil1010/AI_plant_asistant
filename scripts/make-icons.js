const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/images/tab');

const crc32 = (data) => {
  let crc = -1;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return ~crc >>> 0;
};

const createChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData));
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const createPNG = (r, g, b, a = 255) => {
  const width = 48;
  const height = 48;
  
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a);
    }
  }
  
  const { deflateSync } = require('zlib');
  const compressed = deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);
  
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
};

const icons = [
  { name: 'home', color: [153, 153, 153] },
  { name: 'home-active', color: [82, 196, 26] },
  { name: 'identify', color: [153, 153, 153] },
  { name: 'identify-active', color: [82, 196, 26] },
  { name: 'garden', color: [153, 153, 153] },
  { name: 'garden-active', color: [82, 196, 26] },
  { name: 'diagnose', color: [153, 153, 153] },
  { name: 'diagnose-active', color: [82, 196, 26] },
  { name: 'profile', color: [153, 153, 153] },
  { name: 'profile-active', color: [82, 196, 26] }
];

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

icons.forEach(icon => {
  const png = createPNG(...icon.color);
  fs.writeFileSync(path.join(iconsDir, `${icon.name}.png`), png);
  console.log(`Created ${icon.name}.png`);
});

console.log('All icons created successfully!');
