import * as fs from 'fs';
import * as path from 'path';
import { patchFs } from 'fs-monkey';
import { Volume } from 'memfs';
import { ufs } from 'unionfs';

export default function () {
    // We have to create a copy of original `fs` module to prevent infinite recursion in `unionfs`
    const stockFs = Object.create({});
    patchFs(fs, stockFs);

    const cache = new Volume();
    const union = ufs.use(stockFs).use(cache);

    let initialized = false; // lazy monkey-patching `fs`
    return {
        name: 'memfs',

        generateBundle(options, bundle, isWrite) {
            // If bundle is not written to FS, there's nothing to do
            if (!isWrite) {
                return;
            }

            cache.reset(); // removing previous bundles

            cache.mkdirSync(options.dir, { recursive: true });
            Object.keys(bundle).forEach((filename) => {
                const artifact = bundle[filename];
                if (artifact.type === 'asset') {
                    cache.writeFileSync(path.join(options.dir, filename), artifact.source);
                } else {
                    cache.writeFileSync(path.join(options.dir, filename), artifact.code);
                }
            });

            if (!initialized) {
                initialized = true;
                patchFs(union);
            }
        },
    };
}
