import { Font } from '@react-pdf/renderer';

// Vite emits hashed, same-origin, base-prefixed URLs for each of these.
import Montserrat500 from '../assets/fonts/Montserrat-Medium.ttf?url';
import Montserrat600 from '../assets/fonts/Montserrat-SemiBold.ttf?url';
import Montserrat700 from '../assets/fonts/Montserrat-Bold.ttf?url';
import OpenSans400 from '../assets/fonts/OpenSans-Regular.ttf?url';
import OpenSans600 from '../assets/fonts/OpenSans-SemiBold.ttf?url';
import OpenSans700 from '../assets/fonts/OpenSans-Bold.ttf?url';

let registered = false;

export function registerFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: 'Montserrat',
    fonts: [
      { src: Montserrat500, fontWeight: 500 },
      { src: Montserrat600, fontWeight: 600 },
      { src: Montserrat700, fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'Open Sans',
    fonts: [
      { src: OpenSans400, fontWeight: 400 },
      { src: OpenSans600, fontWeight: 600 },
      { src: OpenSans700, fontWeight: 700 },
    ],
  });

  // Stop react-pdf from breaking words mid-word in the letter body.
  Font.registerHyphenationCallback((word) => [word]);
}
