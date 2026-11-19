#!/usr/bin/env node
/** Bruitages synthétisés en local (ffmpeg), un fichier par type : node shared/toy/bruitages.mjs ep20 */
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'public', process.argv[2] ?? 'ep20', 'sfx');
mkdirSync(out, {recursive: true});
const SONS = {
  whoosh: ['anoisesrc=d=0.4:c=pink:a=0.9', 'highpass=f=500,lowpass=f=3500,afade=t=in:d=0.18,afade=t=out:st=0.18:d=0.22'],
  pop: ['aevalsrc=sin(2*PI*(260+900*exp(-t*35))*t)*exp(-t*22):d=0.18', 'volume=0.65'],
  tchak: ['aevalsrc=(random(0)*2-1)*exp(-t*45)*0.7+sin(2*PI*85*t)*exp(-t*16):d=0.35', 'lowpass=f=5000,volume=0.65'],
  ding: ['aevalsrc=(sin(2*PI*1568*t)+0.4*sin(2*PI*3136*t))*exp(-t*4):d=1.2', 'volume=0.65'],
  pieces: ['aevalsrc=sin(2*PI*2637*t)*exp(-t*16)+gt(t\\,0.12)*sin(2*PI*3322*(t-0.12))*exp(-(t-0.12)*16)+gt(t\\,0.26)*sin(2*PI*2960*(t-0.26))*exp(-(t-0.26)*16):d=0.9', 'volume=0.65'],
  tictac: ['aevalsrc=(random(0)*2-1)*exp(-mod(t\\,0.25)*150)*if(lt(mod(t\\,0.5)\\,0.25)\\,1\\,0.6):d=3.6', 'highpass=f=1500'],
};
for (const [nom, [src, af]] of Object.entries(SONS)) {
  const f = join(out, `${nom}.wav`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', src, '-af', `${af},aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=mono`, f]);
  const st = execFileSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).toString();
  console.log(nom, 'ok');
}
