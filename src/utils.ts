import {
  lstat,
  stat,
} from 'fs/promises';
import {
  dirname as pathDirname,
  relative as pathRelative,
  sep as pathSep,
} from 'path';
import type {
  ScriptArguments,
} from './types';
import { extensions } from 'interpret';

export const getNormalizedPath = (root: string, current: string, pathSeperator?: string): string => {
  return pathRelative(root, current).split(pathSeperator===undefined?pathSep:pathSeperator).join('/');
};

export const pathToArray = (relativePath: string): string[] => {
  return relativePath===''?[]:relativePath.split('/');
};

export const getStack = (): NodeJS.CallSite[] => {
  const results: NodeJS.CallSite[] = [];
  const obj: {
    stack?: string;
  } = {};
  Error.captureStackTrace(obj);
  const old = Error.prepareStackTrace;
  Error.prepareStackTrace = (_err: Error, stack: NodeJS.CallSite[]): void => {
    results.push(...(stack.slice(2)));
  };
  /* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
  obj.stack;
  Error.prepareStackTrace = old;
  return results;
};

export const getCaller = (): NodeJS.CallSite => {
  const stack = getStack();
  return stack[1];
};

export const getCallerPath = (value: number=1): string => {
  const stack = getStack();
  return pathDirname(stack[1 + value]?.getFileName()??'');
};

export const fileExists = async(fn: string): Promise<boolean> => {
  try {
    const s = await stat(fn);
    if( s.isFile() ) {
      return true;
    }
  } catch {
    // Missing File
  }
  return false;
};

export const normalizeArguments = (args: string[]): { arguments: ScriptArguments; script: string; } => {
  const results: {
    arguments: ScriptArguments;
    script: string;
  } = {
    arguments: {},
    script: '',
  };
  const script = args?.[0] ?? '';
  if( !script.match(/^--/) ) {
    results.script = script;
    args.shift();
    for(const arg of args) {
      const matches = arg.match(/^--(.*?)(?:=(.+))?$/);
      if( matches ) {
        const [name, value] = [matches[1] ?? '', matches[2]];
        if( value === undefined ) {
          const nomatch = name.match(/^no-(.+)$/);
          if( nomatch ) {
            results.arguments[nomatch[1]] = false;
          } else {
            results.arguments[name] = true;
          }
        } else {
          results.arguments[name] = value;
        }
      }
    }
  }
  return results;
};

const extensionsImported: Record<string, boolean> = {};

export const loadHandler = async(ext: string): Promise<void> => {
  if( !extensionsImported[ext] && !require.extensions[ext]) {
    const extOptions = extensions[ext];
    if( extOptions === undefined ) {
      throw new Error(`Unsupported extension ${ext}`);
    }
    if( typeof(extOptions) === 'string' ) {
      await import(extOptions);
    } else if( Array.isArray(extOptions) ) {
      for(const arr of extOptions) {
        try {
          if( typeof(arr) === 'string' ) {
            await import(arr);
          } else {
            const mod = await import(arr.module);
            arr.register(mod);
          }
          extensionsImported[ext] = true;
          break;
        } catch {
        }
      }
    } else if( extOptions === null ) {
    } else {
      const mod = await import(extOptions.module);
      extOptions.register(mod);
    }
    extensionsImported[ext] = true;
  }
  if( !extensionsImported[ext] && !require.extensions[ext]) {
    throw new Error(`Unable to load ${ext}`);
  }
};

export const wordWrap = (text: string, subtract: number): string[] => {
  const maxColumns = process.stdout.columns;
  if( maxColumns === undefined ) {
    return [ text ];
  }
  const max = maxColumns - subtract;
  const wrapping = text.replace(new RegExp(`(?![^\\n]{1,${max}}$)([^\\n]{1,${max}})\\s`, 'g'), '$1\n');
  return wrapping.split('\n');
};

export const divideBigInt = (v: bigint, by: number): [ bigint, bigint ] => {
  return [ v / BigInt(by), v % BigInt(by) ];
};

const cvt = [
  {
    multi: 1000,
    suffix: 'ns',
  },
  {
    multi: 1000,
    suffix: 'μs',
  },
  {
    multi: 1000,
    suffix: 'ms',
  },
  {
    multi: 60,
    suffix: 's',
  },
  {
    multi: 60,
    suffix: 'm',
  },
  {
    multi: 24,
    suffix: 'h',
  },
  {
    suffix: 'd',
  },
];

export const displayTime = (ns: bigint): string => {
  const result: {
    div: [ bigint, bigint ];
    lowvalue: number;
    value: bigint;
  } = {
    div: [ BigInt(0), BigInt(0) ],
    lowvalue: 0,
    value: ns,
  };
  for(const c of cvt) {
    if( c.multi === undefined || result.value < c.multi ) {
      return `${(Number(result.value)+result.lowvalue).toFixed(3)}${c.suffix}`;
    }
    result.div = divideBigInt(result.value, c.multi);
    result.lowvalue = (Number(result.div[1]) + result.lowvalue) / c.multi;
    result.value = result.div[0];
  }
  return '';
};

export const getFileType = async(filename: string): Promise<'directory' | 'file' | undefined> => {
  try {
    const s = await lstat(filename);
    if( s.isDirectory() ) {
      return 'directory';
    }
    return 'file';
  } catch {
    // ignore missing files
  }
  return undefined;
};
