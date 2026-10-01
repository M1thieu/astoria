import { resolve } from 'path';
import { createLogger, defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const root = resolve(__dirname);

// Pages also load classic (non-module) scripts from js/ that rely on globals.
// They are copied verbatim to dist (see viteStaticCopy), so Vite's notice that it
// cannot bundle them is expected and only hides real warnings.
const logger = createLogger();
const baseWarn = logger.warn;
logger.warn = (msg, options) => {
    if (String(msg).includes("can't be bundled without type=\"module\" attribute")) return;
    baseWarn(msg, options);
};

export default defineConfig({
    root,
    customLogger: logger,
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index:       resolve(root, 'index.html'),
                login:       resolve(root, 'login.html'),
                profil:      resolve(root, 'profil.html'),
                fiche:       resolve(root, 'fiche.html'),
                competences: resolve(root, 'competences.html'),
                inventaire:  resolve(root, 'inventaire.html'),
                hdv:         resolve(root, 'hdv.html'),
                quetes:      resolve(root, 'quetes.html'),
                magie:       resolve(root, 'magie.html'),
                codex:       resolve(root, 'codex.html'),
                craft:       resolve(root, 'craft.html'),
                nokorah:     resolve(root, 'nokorah.html'),
                admin:       resolve(root, 'admin/index.html'),
            },
        },
    },
    plugins: [
        viteStaticCopy({
            targets: [
                { src: 'assets', dest: '.' },
                { src: 'js', dest: '.' },
            ],
        }),
    ],
    server: {
        port: 5173,
        open: '/index.html',
    },
});
