import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Sub X random community maps!',
        version: '1.3',
        description: '[RELEASE NOTE] rewrite in typescript for easier future maintenance, AND a ui toggle button!',
        author: "justaloli",
        match: ['https://steamcommunity.com/workshop/browse/*'],
        grant: "none"
      },
    }),
  ],
});
