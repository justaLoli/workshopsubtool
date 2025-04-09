import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Sub X random community maps!',
        version: '2.0',
        description: '[RELEASE NOTE] TRUE RANDOM AND P2 NSRCC% SUPPORT!',
        author: "justaloli",
        match: ['https://steamcommunity.com/workshop/browse/*'],
        grant: "none",
        updateURL: "https://raw.githubusercontent.com/justaLoli/workshopsubtool/main/random-map-subber.user.js",
        downloadURL: "https://raw.githubusercontent.com/justaLoli/workshopsubtool/main/random-map-subber.user.js"
      },
    }),
  ],
});
