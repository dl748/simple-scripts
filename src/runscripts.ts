import type {
  IContext,
  IExecutionOptions,
  IGetScriptsOptions,
  ISubscripts,
  RejectCallback,
  ScriptsCallback,
  VoidCallback,
} from './types';
import {
  displayTime,
  getCallerPath,
  getNormalizedPath,
  pathToArray,
} from './utils';
import {
  addPromise,
} from './promises';

export const getScriptFromPath = (from: ISubscripts, path: string[]): ISubscripts | undefined => {
  const pathList = [ ...path ];
  if( pathList.length > 0 ) {
    const p = pathList.shift() ?? '';
    if( from.subscripts[p] === undefined ) {
      return;
    }
    return getScriptFromPath(from.subscripts[p], pathList);
  }
  return from;
};

const searchScripts = (script: ISubscripts, action: string, path: string, minDepth?: number, maxDepth?: number): string[] => {
  const results: string[] = [];
  if( minDepth === undefined || minDepth <= 0 ) {
    if( maxDepth === undefined || maxDepth >= 0 ) {
      if( Object.keys(script.actions).includes(action) ) {
        results.push(`${action}${path===''?'':`:${path}`}`);
      }
    }
  }
  for(const [k,v] of Object.entries(script.subscripts)) {
    results.push(...searchScripts(v, action, path===''?k:`${path}/${k}`, minDepth===undefined?undefined:minDepth-1, maxDepth===undefined?undefined:maxDepth-1));
  }
  return results;
};

export const getScripts = (context: IContext, action: string, opts?: IGetScriptsOptions): Promise<string[]> => {
  const options = opts ?? {};
  const minDepth = options.minDepth;
  const maxDepth = options.maxDepth;
  const callerPath = getCallerPath();
  const cPath = getNormalizedPath(context.contextPath, callerPath);
  const path = options.path !== undefined?options.path:cPath;
  const prom = new Promise<string[]>(async(res: (value: string[]) => void, rej: RejectCallback): Promise<void> => {
    try {
      const results: string[] = [];
      const script = getScriptFromPath(context.rootScripts, pathToArray(path));
      if( script !== undefined ) {
        results.push(...searchScripts(script, action, '', minDepth, maxDepth));
      }
      res(results);
    } catch(e: unknown) {
      rej(e);
    }
  });
  return addPromise(context, prom, pathToArray(cPath), `getScripts ${action}`);
};

const runScript = async(context: IContext, name: string, callback: ScriptsCallback): Promise<void> => {
  const startTime = process.hrtime.bigint();
  if( !context.quiet ) {
    console.log(`[${context.colors.fgGreen(`Starting '${name}']`)}`);
  }
  await Promise.resolve(callback({
    ...context.scriptsArguments,
  }));
  const endTime = process.hrtime.bigint();
  if( !context.quiet ) {
    console.log(`[${context.colors.fgGreen(`Finished '${name}'`)} in ${context.colors.fgYellow(displayTime(endTime-startTime))}]`);
  }
};

export const runScripts = (context: IContext, scripts: string[] | string, opts?: IExecutionOptions): Promise<void> => {
  const options = opts ?? {};
  const synchronous = options.synchronous ?? context.defaultSynchronous;
  const callerPath = getCallerPath();
  const allScripts = ((): string[] => {
    if( typeof(scripts) === 'string' ) {
      return [ scripts ];
    }
    return scripts;
  })();
  const cPath = getNormalizedPath(context.contextPath, callerPath);
  const path = options.path !== undefined?options.path:cPath;
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback): Promise<void> => {
    try {
      const actionRegex = new RegExp(/^(.*?)(?:\:(.*))?$/);
      const callbackList: Array<{ callback: ScriptsCallback; name: string; }> = [];
      const prependPath = pathToArray(path);
      const rootScripts = getScriptFromPath(context.rootScripts, prependPath);
      if( rootScripts !== undefined ) {
        for(const scriptName of allScripts) {
          const m = actionRegex.exec(scriptName) ?? [''];
          const action = m[1];
          const pathList = pathToArray(m[2] ?? '');
          const script = getScriptFromPath(rootScripts, pathList);
          if( script === undefined || script.actions[action] === undefined ) {
            throw new Error(`Script Not Found ${action}${pathList.length?`:${pathList.join('/')}`:''}`);
          }
          const fullPath = [
            ...prependPath,
            ...pathList,
          ];
          callbackList.push({
            callback: script.actions[action].callback,
            name: `${action}${fullPath.length===0?'':`:${fullPath.join('/')}`}`,
          });
        }
        if( synchronous ) {
          for(const call of callbackList) {
            await runScript(context, call.name, call.callback);
          }
        } else {
          const results = await Promise.allSettled(callbackList.map(async(script: { callback: ScriptsCallback; name: string; }): Promise<void> => runScript(context, script.name, script.callback)));
          for(const r of results ) {
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
  return addPromise(context, prom, pathToArray(cPath), `run ${allScripts.join(',')}`);
};
