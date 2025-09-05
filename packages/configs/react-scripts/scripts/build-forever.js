import chokidar from 'chokidar';
import { main as compileMain } from './compile.js';
import { main as copyAssetsMain } from './copy-assets.js';

export async function main({ srcDir = 'src/lib', targetDir = 'lib' }) {
  console.log(`🔄 Starting watch mode...`);
  console.log(`📁 Watching: ${srcDir}`);
  console.log(`📦 Building to: ${targetDir}`);

  // Initial build
  console.log('\n🏗️  Initial build...');
  await compileMain(targetDir);
  await copyAssetsMain(srcDir, targetDir);
  console.log('✅ Initial build complete\n');

  // Set up file watching with chokidar
  let isBuilding = false;

  const triggerBuild = async (path) => {
    if (isBuilding) return;

    isBuilding = true;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🔄 [${timestamp}] Change detected: ${path}`);

    try {
      console.log('🏗️  Rebuilding...');
      await compileMain(targetDir);
      await copyAssetsMain(srcDir, targetDir);
      console.log('✅ Build complete\n');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
    } finally {
      isBuilding = false;
    }
  };

  // Initialize watcher
  const watcher = chokidar.watch(srcDir, {
    ignored: [
      /(^|[\/\\])\../, // ignore dotfiles
      /node_modules/, // ignore node_modules
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 500,
    },
  });

  // Set up event handlers
  watcher
    .on('add', triggerBuild)
    .on('change', triggerBuild)
    .on('unlink', (path) => console.log(`🗑️  File removed: ${path}`))
    .on('ready', () => {
      console.log('👀 Watching for changes... (Press Ctrl+C to stop)\n');
    })
    .on('error', (error) => console.error(`❌ Watcher error: ${error}`));

  // Keep process alive
  process.stdin.resume();

  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping watch mode...');
    watcher.close();
    process.exit(0);
  });
}
