import type {
  IActionOptions,
  IContext,
  IExecutionOptions,
  IGetScriptsOptions,
  //IImportOptions,
  IPassthroughOptions,
  IScriptDefinition,
  IShellExecutionOptions,
  ScriptsCallback,
} from './types';
import {
  getScripts,
  runScripts,
} from './runscripts';
import {
  importScript,
  importSubdirectories,
} from './importscript';
import {
  runShell,
  runShellOutput,
} from './shell';
import { addPassthroughScripts } from './passthrough';
import { getColors } from './colors';
import { register } from './register';
import { removeFiles } from './removefiles';

export const createContext = (path: string, colors: string): IContext => {
  const context: IContext = {
    awaitingPromises: {
      path: {},
      promises: [],
    },
    colors: getColors(colors, process.stdout.isTTY),
    contextPath: path,
    defaultSynchronous: false,
    quiet: false,
    rootScripts: {
      actions: {},
      subscripts: {},
    },
    script: '',
    scripts: {
      addPassthroughScripts: (scriptsDefinitions?: Record<string, IScriptDefinition>, opts?: IPassthroughOptions): Promise<void> => addPassthroughScripts(context, scriptsDefinitions, opts),
      getScripts: (action: string, opts?: IGetScriptsOptions): Promise<string[]> => getScripts(context, action, opts),
      import: (path: string/*, opts?: IImportOptions*/): Promise<void> => importScript(context, path/*, opts*/),
      importSubdirectories: (path?: string): Promise<void> => importSubdirectories(context, path),
      register: (action: string, callback: ScriptsCallback, opts?: IActionOptions): Promise<void> => register(context, action, callback, opts),
      removeFiles: (files: string[] | string): Promise<void> => removeFiles(context, files),
      run: (script: string[] | string, opts?: IExecutionOptions): Promise<void> => runScripts(context, script, opts),
      runShell: (cmd: string, args: Array<string | undefined>, opts?: IShellExecutionOptions): Promise<void> => runShell(context, cmd, args, opts),
      runShellOutput: (cmd: string, args: Array<string | undefined>, opts?: IShellExecutionOptions): Promise<string> => runShellOutput(context, cmd, args, opts),
    },
    scriptsArguments: {},
    scriptsBaseName: 'scripts',
  };
  return context;
};
