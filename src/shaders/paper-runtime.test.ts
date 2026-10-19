import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {describe,expect,it} from 'vitest';

describe('paper runtime isolation',()=>{
  for(const file of ['3d-paper-site-of-the-year.html','3d-paper-chamber.html']){
    it(`${file} creates textures in its own browser realm`,()=>{
      const source=readFileSync(new URL(`../../public/threeui/${file}`,import.meta.url),'utf8');
      expect(source).toContain('<script src="/threeui/vendor/three-r149.js"></script>');
      expect(source).not.toContain('parent.THREE');
      for(const match of source.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g))expect(()=>new Script(match[1])).not.toThrow();
      const bootstrap=readFileSync(new URL('../../public/threeui/3d-paper-runtime.html',import.meta.url),'utf8');
      expect(bootstrap).toContain('frameId=0,lastPaint=0');
      expect(source.indexOf('src="/threeui/vendor/three-r149.js"')).toBeLessThan(source.indexOf('const T = THREE'));
    });
  }
});
