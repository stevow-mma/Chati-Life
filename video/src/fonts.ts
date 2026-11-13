import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const FONT_TEXTE = 'Lilita One';
export const FONT_TITRE = 'Luckiest Guy';

loadFont({family: FONT_TEXTE, url: staticFile('fonts/LilitaOne.woff2')});
loadFont({family: FONT_TITRE, url: staticFile('fonts/LuckiestGuy.woff2')});
