import type {
  IActionOptions,
  IContext,
  ISubscripts,
  RejectCallback,
  ScriptsCallback,
  VoidCallback,
} from './types';
import {
  getCallerPath,
  getNormalizedPath,
  pathToArray,
} from './utils';
import { addPromise } from './promises';

export const register = (context: IContext, action: string, callback: ScriptsCallback, opts?: IActionOptions): Promise<void> => {
  const caller = getNormalizedPath(context.contextPath, getCallerPath());
  const options = opts ?? {};
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback) => {
    try {
      const path = options.path===undefined?caller:options.path;
      const pathList = pathToArray(path);
      const getSubscript = (subscripts: ISubscripts, pathList: string[]): ISubscripts => {
        const path = [...pathList];
        const item = path.shift();
        if( item !== undefined ) {
          if( subscripts.subscripts[item] === undefined ) {
            subscripts.subscripts[item] = {
              actions: {},
              subscripts: {},
            };
          }
          return getSubscript(subscripts.subscripts[item], path);
        }
        return subscripts;
      };
      const subscript = getSubscript(context.rootScripts, pathList);
      if( subscript.actions[action] !== undefined ) {
        throw new Error(`Action ${action} already created`);
      }
      subscript.actions[action] = {
        arguments: options.arguments ?? undefined,
        callback,
        description: options.description ?? undefined,
      };
      res();
    } catch(e: unknown) {
      rej(e);
    }
  });
  return addPromise(context, prom, pathToArray(caller), `register ${action}`);
};
