import type {
  IContext,
  IPassthroughOptions,
  IScriptDefinition,
  ISubscripts,
  RejectCallback,
  VoidCallback,
} from './types';
import {
  getCallerPath,
  getNormalizedPath,
  pathToArray,
} from './utils';
import {
  addPromise,
} from './promises';
import {
  getScriptFromPath,
} from './runscripts';

export const addPassthroughScripts = (context: IContext, scriptsDefinitions?: Record<string, IScriptDefinition>, opts?: IPassthroughOptions): Promise<void> => {
  const definitions = scriptsDefinitions ?? {};
  const options = opts ?? {};
  const callerPath = options.callerPath ?? getCallerPath();
  const cPath = getNormalizedPath(context.contextPath, callerPath);
  const fromPath = options.path!==undefined?options.path:cPath;
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback): Promise<void> => {
    try {
      const path = pathToArray(cPath);
      const script = getScriptFromPath(context.rootScripts, path);
      if( script !== undefined ) {
        const aList: string[] = [];
        for(const v of Object.values(script.subscripts)) {
          for(const a of Object.keys(v.actions)) {
            if( !aList.includes(a) ) {
              aList.push(a);
            }
          }
        }
        for(const action of aList) {
          if( !Object.keys(script.actions).includes(action) ) {
            const scriptList: string[] = Object.entries(script.subscripts).reduce((a: string[], [k, v]: [string, ISubscripts]) => {
              if( v.actions[action] !== undefined ) {
                a.push(`${action}:${k}`);
              }
              return a;
            }, []);
            const synchronous = options.synchronous;
            script.actions[action] = {
              ...(definitions[action]??{}),
              callback: async(): Promise<void> => {
                await context.scripts.run(scriptList, {
                  path: fromPath,
                  synchronous,
                });
              },
            };
          }
        }
      }
      res();
    } catch(e: unknown) {
      rej(e);
    }
  });
  return addPromise(context, prom, pathToArray(cPath), `addPassthroughScripts ${callerPath}`);
};
