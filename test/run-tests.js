const path = require('path');
const fs = require('fs');

const projectBundlePath = path.join(__dirname, '../dist/index.cjs.js');
if (!fs.existsSync(projectBundlePath)) {
    console.error('Project must be built before running tests');
    process.exit(1);
}

const memfs = require(projectBundlePath);

const del = require('rollup-plugin-delete');
const serve = require('rollup-plugin-serve');
const html2 = require('rollup-plugin-html2');
const rollup = require('rollup');
const assert = require('assert');
const axios = require('axios');
const { execSync } = require('child_process');

const nativeExistsSync = fs.existsSync;

const bundleOutputDir = path.join(__dirname, 'test-dist');
const testModulePath = path.join(__dirname, './test-module.js');
const testPagePath = path.join(__dirname, './test-page.html');

const servePort = 10000 + Math.floor(Math.random() * 1000);

// These are called before memfs() plugin monkey-patches require('fs')
fs.writeFileSync(testModulePath, 'export default 1');
fs.writeFileSync(testPagePath, '<html><body></body></html>');

const memfsPlugin = memfs();

let watcher;
function startRollup() {
    watcher = rollup.watch({
        input: testModulePath,
        output: {
            format: 'esm',
            dir: bundleOutputDir,
        },
        plugins: [
            // This plugin is used for testing artifacts deletion from memfs in watch mode
            del({ targets: bundleOutputDir }),

            // Injects links to build artifacts into template and outputs it in destination directory
            html2({ template: testPagePath }),

            // Storing artifacts in memory is only ever useful for development server
            serve({ port: servePort, historyApiFallback: true, contentBase: [bundleOutputDir] }),

            memfsPlugin,
        ],
    });

    let secondBuildEndEvent = false;
    watcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
            performAllTests(secondBuildEndEvent);
            secondBuildEndEvent = true;
        } else if (event.code === 'ERROR') {
            console.error(event.error.message);
            exit(2);
        }
    });
}

function exit(code) {
    // Even though require('fs') is already monkey-patched at this point, these calls should still be forwarded to real FS
    fs.unlinkSync(testModulePath);
    fs.unlinkSync(testPagePath);
    process.exit(code);
}

async function runTest(test) {
    try {
        await test();
        return true;
    } catch (e) {
        console.error(red('✘') + ' ' + test.name + ': ' + e.message);
        return false;
    }
}

async function performAllTests(afterRebuild = false) {
    console.log('');
    if (afterRebuild) {
        console.log(blue('↯') + ' Performing the same checks after rebuild');
    }

    const success =
        (await runTest(testBundleNotInFS)) &&
        (await runTest(testJsBuild)) &&
        (await runTest(testStaticAsset)) &&
        (afterRebuild || (await runTest(testRebuildInWatchMode))) &&
        (!afterRebuild || (await runTest(testReloadEventEmitted)));

    if (afterRebuild || !success) {
        console.log('');
        watcher.close();
    }
    if (!success) {
        exit(3);
    } else if (afterRebuild) {
        exit(0);
    }
}

/**
 * Asserts that build artifacts are not present in the real FS.
 */
async function testBundleNotInFS() {
    // We have to use existsSync alias here, since require('fs') is already patched at this point
    assert.equal(nativeExistsSync(path.join(bundleOutputDir, './test-module.js')), false, 'bundle exists in FS');
    console.log(green('✔') + " bundle doesn't exist in FS");
}

let jsRun = 1;
/**
 * Asserts that JS bundle is built and REbuilt (that's what `jsRun` variable is for) in watch mode.
 */
async function testJsBuild() {
    const response = await axios.get(`http://localhost:${servePort}/test-module.js`);
    assert.equal(response.status, 200, 'bundle is not served');
    assert.equal(response.data, `var testModule = ${jsRun};\n\nexport default testModule;\n`, 'bundle is not rebuilt');

    console.log(green('✔') + ' bundle is built correctly');

    jsRun++;
}

/**
 * Asserts that HTML is bundled alongside JS and served.
 */
async function testStaticAsset() {
    // `rollup-plugin-serve` will serve files from current directory, so we'll just use this file for testing
    const response = await axios.get(`http://localhost:${servePort}/test-page.html`);
    assert.equal(
        (response.data || '').replace(/\s+/g, ''),
        `<!doctypehtml><html><head></head><body><scriptsrc="/test-module.js"></script></body></html>`,
        'unexpected HTML served',
    );
    assert.equal(response.status, 200, 'request static asset returned failed response');

    console.log(green('✔') + ' static asset is served');
}

const eventEmittedFor = new Set();
memfsPlugin.on('reload', (filePath) => {
    console.debug('changed', filePath);
    eventEmittedFor.add(filePath);
});
async function testReloadEventEmitted() {
    assert.equal(eventEmittedFor.has(path.basename(testModulePath)), true);
    console.log(green('✔') + ' reload event is emitted');
}

/**
 * Triggers bundle rebuild in watch mode so that tests can assert that bundle is correctly rebuilt in-memory.
 */
async function testRebuildInWatchMode() {
    // Updating the file in FS and testing whether changes appear in memfs
    // We have to resort to exec(), since require('fs') is monkey-patched at this point
    execSync(`echo export default 2 > "${testModulePath}"`);

    // Tests are going to be rerun automatically due to a BUILD_END event
}

function green(text) {
    return '\u001b[1m\u001b[32m' + text + '\u001b[39m\u001b[22m';
}

function red(text) {
    return '\u001b[1m\u001b[31m' + text + '\u001b[39m\u001b[22m';
}

function blue(text) {
    return '\u001b[1m\u001b[34m' + text + '\u001b[39m\u001b[22m';
}

startRollup();
