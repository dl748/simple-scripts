import type {
  IPromisePath,
  ISimpleScripts,
  ISimpleScriptsOptions,
  ISimpleScriptsOutput,
  ScriptArguments,
} from './types';
import { createContext } from './context';
import { displayScripts } from './displayscripts';
import { normalizeArguments } from './utils';

const allPromises = (path: IPromisePath): Array<Promise<void>> => {
  const results: Array<Promise<void>> = [];
  for(const p of Object.values(path.path)) {
    results.push(...allPromises(p));
  }
  results.push(...(path.promises ?? []));
  return results;
};

export const SimpleScripts = async(opts?: ISimpleScriptsOptions): Promise<ISimpleScriptsOutput> => {
  const options: ISimpleScriptsOptions = {
    ...(opts ?? {}),
  };
  const cwd = options.cwd ?? process.cwd();
  const cli = options.cli ?? false;
  const color = options.color ?? 'auto';
  const result: ISimpleScriptsOutput = {};
  const cliArguments = options.cliArguments ?? process.argv.slice(2);
  const scriptsBaseName = options.scriptsBaseName ?? 'scripts';
  const scriptsArguments = options.scriptsArguments ?? {};
  const quiet = options.quiet ?? false;
  const context = createContext(cwd, color);
  try {
    context.defaultSynchronous = options?.synchronous ?? false;
    context.scriptsBaseName = scriptsBaseName;
    context.script = options.script ?? '';
    context.scriptsArguments = scriptsArguments;
    context.quiet = quiet;
    if( cli ) {
      const parameters = normalizeArguments(cliArguments);
      context.script = parameters.script;
      context.scriptsArguments = parameters.arguments;
    }
    await context.scripts.import(context.contextPath);
    const results = await Promise.allSettled(allPromises(context.awaitingPromises));
    context.awaitingPromises.promises = [];
    context.awaitingPromises.path = {};
    for(const r of results) {
      if( r.status === 'rejected' ) {
        throw r.reason;
      }
    }
    if( context.script === '' ) {
      result.list = displayScripts(context, console);
    } else {
      await context.scripts.run(context.script, {
        path: '',
      });
    }
    return result;
  } catch(e: unknown) {
    if( e !== null && typeof(e) === 'object' ) {
      const err = e as Record<string, string>;
      if( typeof(err.message) !== undefined ) {
        console.error(`[${context.colors.fgRed('ERROR')}: ${err.message}]`);
        console.log(err.stack);
      }
    } else {
      console.error(`[${context.colors.fgRed('ERROR')}: ${e}]`);
    }
    if( !quiet ){
      throw e;
    }
  }
  if( !quiet ) {
    console.log('[Exiting]');
  }
  return {};
};

export {
  ISimpleScripts,
  ISimpleScriptsOptions,
  ISimpleScriptsOutput,
  ScriptArguments,
};
