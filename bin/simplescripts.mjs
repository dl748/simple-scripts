#!/bin/env node

import {
  fileURLToPath,
} from 'url';
import {
  resolve as pathResolve,
  dirname as pathDirname,
} from 'path';

(async() => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathDirname(__filename);
    const lib = await import(pathResolve(__dirname, '..', 'dist', 'index.js'));
    await lib.SimpleScripts({
      cli: true,
    });
  } catch {
    // Default is to display errors
    process.exit(1);
  }
})();
