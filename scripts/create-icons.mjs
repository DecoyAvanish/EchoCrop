// Rasterize the small geometric brand mark without a build-time graphics dependency.
import fs from 'node:fs';
import zlib from 'node:zlib';
const size=180,pixels=Buffer.alloc((size*4+1)*size);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const d=Math.hypot(x-90,y-90),diamond=Math.abs(x-90)+Math.abs(y-90);
  const lit=(d>30&&d<33)||(diamond>66&&diamond<69)||(Math.abs(x-90)<2&&y>45&&y<135)||(Math.abs(y-90)<2&&x>45&&x<135);
  const i=y*(size*4+1)+1+x*4;
  pixels.set(lit?[56,225,255,255]:[5,7,13,255],i);
}
function crc32(buffer){let c=0xffffffff;for(const byte of buffer){c^=byte;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function chunk(type,data){const tag=Buffer.from(type),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([tag,data])));return Buffer.concat([length,tag,data,crc])}
const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
fs.writeFileSync('public/apple-touch-icon.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]));
