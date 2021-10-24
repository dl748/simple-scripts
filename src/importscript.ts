import type {
  IContext,
  //IImportOptions,
  RejectCallback,
  VoidCallback,
} from './types';
import {
  addPromise,
  getPromises,
} from './promises';
import {
  fileExists,
  getCallerPath,
  getNormalizedPath,
  loadHandler,
  pathToArray,
} from './utils';
import {
  dirname as pathDirname,
  join as pathJoin,
  resolve as pathResolve,
} from 'path';
import { extensions } from 'interpret';
import {
  opendir,
} from 'fs/promises';

const internalImportScript = async(context: IContext, path: string): Promise<void> => {
  const fullPath = pathResolve(context.contextPath, pathJoin(path, context.scriptsBaseName));
  for(const ext of Object.keys(extensions)) {
    const fileName = `${fullPath}${ext}`;
    if( await fileExists(fileName) ) {
      await loadHandler(ext);
      const data = await import(fileName);
      if( typeof(data) === 'function' ) {
        await Promise.resolve(data(context.scripts, {
          ...context.scriptsArguments,
        }));
      } else if( typeof(data) === 'object' && typeof(data.default) === 'function' ) {
        await Promise.resolve(data.default(context.scripts, {
          ...context.scriptsArguments,
        }));
      }
      break;
    }
  }
};

export const importScript = (context: IContext, path: string/*, opts?: IImportOptions*/): Promise<void> => {
  const fullPath = pathResolve(context.contextPath, path);
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback) => {
    try {
      const currentPromises = getPromises(context.awaitingPromises, pathToArray(getNormalizedPath( context.contextPath, path)));
      currentPromises.promises = [];
      try {
        await internalImportScript(context, fullPath);
      } finally {
        if( currentPromises.promises !== undefined ) {
          if( currentPromises.promises.length >0 ) {
            const results = await Promise.allSettled(currentPromises.promises);
            delete currentPromises.promises;
            for(const r of results) {
              if( r.status === 'rejected' ) {
                throw r.reason;
              }
            }
          }
          delete currentPromises.promises;
        }
      }
      res();
    } catch(e: unknown) {
      rej(e);
    }
  });
  const cPath = getNormalizedPath(context.contextPath, pathDirname(path));
  return cPath.match(/^\.\.(?:\/|$)/)?prom:addPromise(context, prom, pathToArray(cPath), `import ${fullPath}`);
};

export const importSubdirectories = (context: IContext, path?: string): Promise<void> => {
  const importPath = path ?? getCallerPath();
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback) => {
    try {
      const directories: string[] = [];
      const fd = await opendir(importPath);
      for await (const ent of fd) {
        if( ent.isDirectory() ) {
          const nPath = pathJoin(importPath, ent.name);
          const ofd = await opendir(nPath);
          for await(const oent of ofd) {
            if( oent.name.substring(0,context.scriptsBaseName.length+1) === `${context.scriptsBaseName}.` ) {
              directories.push(nPath);
            }
          }
        }
      }
      const promiselist = directories.map((v: string) => {
        const caller = getNormalizedPath(context.contextPath, v);
        const proms = getPromises(context.awaitingPromises, pathToArray(caller));
        proms.promises = [];
        return proms;
      });

      await Promise.all(directories.map((v: string) => internalImportScript(context, v)));
      for(const p of promiselist) {
        if( p.promises !== undefined ) {
          const results = await Promise.allSettled(p.promises);
          delete p.promises;
          for(const r of results) {
            if( r.status === 'rejected' ) {
              throw r.reason;
            }
          }
        }
      }
      res();
    } catch(e: unknown) {
      rej(e);
    }
  });
  const cPath = getNormalizedPath(context.contextPath, pathDirname(importPath));
  return addPromise(context, prom, pathToArray(cPath), `importSubdirectories ${importPath}`);
};
