import type { ExportColors } from './colors';

export type PromiseVoid =  Promise<void> | void;

export type ScriptArguments = Record<string, boolean | string>;

export type ScriptsCallback = (() => PromiseVoid) | ((opts: ScriptArguments) => PromiseVoid);

export interface IScriptDefinition {
  arguments?: Record<string, string>;
  description?: string;
}

export interface IScript extends IScriptDefinition {
  callback: ScriptsCallback;
}

export interface IGetScriptsOptions {
  maxDepth?: number;
  minDepth?: number;
  path?: string;
}

export interface IActionOptions {
  arguments?: Record<string, string>;
  description?: string;
  path?: string;
}

export interface IExecutionOptions {
  path?: string;
  synchronous?: boolean;
}

export interface IShellExecutionOptions {
  asNPX?: boolean;
  cwd?: string;
}

export interface IPassthroughOptions {
  callerPath?: string;
  path?: string;
  synchronous?: boolean;
}

export interface ISimpleScripts {
  addPassthroughScripts: (scriptsDefinitions?: Record<string, IScriptDefinition>, opts?: IPassthroughOptions) => Promise<void>;
  getScripts: (action: string, opts?: IGetScriptsOptions) => Promise<string[]>;
  import: (dir: string/*, opts?: IImportOptions*/) => Promise<void>;
  importSubdirectories: (path?: string) => Promise<void>;
  register: (name: string, callback: ScriptsCallback, options?: IActionOptions) => Promise<void>;
  removeFiles: (path: string[] | string) => Promise<void>;
  run: (scripts: string[] | string, opts?: IExecutionOptions) => Promise<void>;
  runShell: (cmd: string, args: Array<string | undefined>, opts?: IShellExecutionOptions) => Promise<void>;
  runShellOutput: (cmd: string, args: Array<string | undefined>, opts?: IShellExecutionOptions) => Promise<string>;
}

export type VoidCallback = () => void;
export type RejectCallback = (err: unknown) => void;

export interface IPromisePath {
  path: Record<string, IPromisePath>;
  promises?: Array<Promise<void>>;
}

export interface ISubscripts {
  actions: Record<string, IScript>;
  subscripts: Record<string, ISubscripts>;
}

export interface IContext {
  awaitingPromises: IPromisePath;
  colors: ExportColors;
  contextPath: string;
  defaultSynchronous: boolean;
  quiet: boolean;
  rootScripts: ISubscripts;
  script: string;
  scripts: ISimpleScripts;
  scriptsArguments: ScriptArguments;
  scriptsBaseName: string;
}

export interface ISimpleScriptsOptions {
  cli?: boolean;
  cliArguments?: string[];
  color?: string;
  cwd?: string;
  quiet?: boolean;
  script?: string;
  scriptsArguments?: ScriptArguments;
  scriptsBaseName?: string;
  synchronous?: boolean;
}

export interface ISimpleScriptsOutput {
  list?: Record<string, Record<string, IScriptDefinition>>;
}
