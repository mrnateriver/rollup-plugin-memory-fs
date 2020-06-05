import * as fs from 'fs';
import * as path from 'path';
import { patchFs } from 'fs-monkey';
import { Volume as MemoryVolume } from 'memfs';
import { ufs } from 'unionfs';
import { EventEmitter } from 'events';

class MemoryFsPlugin extends EventEmitter {
    constructor() {
        super();

        this.name = 'memfs';

        // We have to create a copy of original `fs` module to prevent infinite recursion in `unionfs`
        const stockFs = Object.create({});
        patchFs(fs, stockFs);

        const cache = new MemoryVolume();
        const union = ufs.use(stockFs).use(cache);

        let initialized = false; // lazy monkey-patching `fs`
        this.generateBundle = (options, bundle, isWrite) => {
            // If bundle is not written to FS, there's nothing to do
            if (!isWrite) {
                return;
            }

            cache.reset(); // removing previous bundles

            cache.mkdirSync(options.dir, { recursive: true });
            Object.keys(bundle).forEach((filename) => {
                const artifact = bundle[filename];

                const outputDir = options.dir || (options.file ? path.resolve(path.dirname(options.file)) : '');
                const filePath = path.join(outputDir, filename);

                if (artifact.type === 'asset') {
                    cache.writeFileSync(filePath, artifact.source);
                } else {
                    cache.writeFileSync(filePath, artifact.code);
                }

                this.emit('reload', filename);
            });

            if (!initialized) {
                initialized = true;
                patchFs(union);
            }
        };
    }
}

const pluginSingleton = new MemoryFsPlugin();
export default function () {
    return pluginSingleton;
}
