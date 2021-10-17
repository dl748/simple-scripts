import type {
  IContext,
  RejectCallback,
  VoidCallback,
} from './types';
import {
  getCallerPath,
  getFileType,
  getNormalizedPath,
  pathToArray,
} from './utils';
import {
  opendir,
  rmdir,
  unlink,
} from 'fs/promises';
import {
  addPromise,
} from './promises';
import {
  resolve as pathResolve,
} from 'path';

export const removeFiles = (context: IContext, files: string[] | string): Promise<void> => {
  const filesList = ((): string[] => {
    if( typeof(files) === 'string' ) {
      return [ files ];
    }
    return files;
  })();
  const callerPath = getCallerPath();
  const cPath = getNormalizedPath(context.contextPath, callerPath);
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback): Promise<void> => {
    try {
      while( filesList.length > 0 ) {
        const file = filesList.shift() ?? '';
        const fullPath = pathResolve(callerPath, file);
        const ft = await getFileType(fullPath);
        if( ft === 'directory' ) {
          const fd = await opendir(fullPath);
          const old = filesList.length;
          for await (const fn of fd) {
            filesList.push(pathResolve(fullPath, fn.name));
          }
          const empty = filesList.length === old;
          if( empty ) {
            if( !context.quiet ) {
              console.log(`[${context.colors.fgRed('Removing directory')} ${context.colors.fgYellow(`'${fullPath}'`)}]`);
            }
            await rmdir(fullPath);
          } else {
            filesList.push(fullPath);
          }
        } else if( ft === 'file' ) {
          if( !context.quiet ) {
            console.log(`[${context.colors.fgRed('Remove file')} ${context.colors.fgYellow(`'${fullPath}'`)}]`);
          }
          await unlink(fullPath);
        }
      }
      res();
    } catch(e: unknown) {
      rej(e);
    }
  });
  return addPromise(context, prom, pathToArray(cPath), `removeFiles ${filesList.join(', ')}`);
};

