import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';

describe('paper runtime isolation',()=>{
  for(const file of ['3d-paper-site-of-the-year.html','3d-paper-chamber.html']){
    it(`${file} creates textures in its own browser realm`,()=>{
      const source=readFileSync(new URL(`../../public/threeui/${file}`,import.meta.url),'utf8');
      expect(source).toContain('<script src="/threeui/vendor/three-r149.js"></script>');
      expect(source).not.toContain('parent.THREE');
      expect(source.indexOf('src="/threeui/vendor/three-r149.js"')).toBeLessThan(source.indexOf('const T = THREE'));
    });
  }
});
