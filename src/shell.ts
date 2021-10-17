import type {
  IContext,
  IShellExecutionOptions,
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
  spawn,
} from 'child_process';

const escapeQuotes = (v: string): string => {
  return `"${v.replace(/(\x27|\x22|\x5C)/g, (v: string) => `\\${v}`)}"`;
};

export const runShell = (context: IContext, cmd: string, args: Array<string | undefined>, opts?: IShellExecutionOptions): Promise<void> => {
  const options = opts ?? {};
  const asNPX = options.asNPX ?? false;
  const callerPath = getCallerPath();
  const cwd = (options.cwd ?? callerPath) ?? process.cwd();
  const prom = new Promise<void>(async(res: VoidCallback, rej: RejectCallback) => {
    try {
      const [runCommand, runArguments] = ((): [string, Array<string | undefined>] => {
        if( asNPX ) {
          return [ 'npx', [ cmd, ...(args ?? []) ] ];
        }
        return [ cmd, args ?? [] ];
      })();
      if( !context.quiet ) {
        console.log(`[${context.colors.fgGreen('Running command')}: ${runCommand}${runArguments.length?` ${runArguments.join(' ')}`:''}]`);
      }
      const process = spawn(runCommand, runArguments.reduce((a: string[], v: string | undefined): string[] => {
        if( v !== undefined ) {
          a.push(escapeQuotes(v));
        }
        return a;
      }, []), {
        cwd,
        shell: true,
        stdio: 'inherit',
      });
      process.on('close', (code?: number, signal?: string) => {
        if( typeof(code) === 'number' && code !== 0 ) {
          rej(new Error(`Process exited with code: ${code}`));
        } else if( typeof(signal) === 'string' && signal !== '') {
          rej(new Error(`Process exit with signal: ${signal}`));
        } else {
          res();
        }
      });
    } catch(e: unknown) {
      rej(e);
    }
  });
  const caller = getNormalizedPath(context.contextPath, callerPath);
  return addPromise(context, prom, pathToArray(caller), `runShell ${cmd} ${args.join(' ')}`);
};

export const runShellOutput = (context: IContext, cmd: string, args: Array<string | undefined>, opts?: IShellExecutionOptions): Promise<string> => {
  const options = opts ?? {};
  const asNPX = options.asNPX ?? false;
  const callerPath = getCallerPath();
  const cwd = (options.cwd ?? callerPath) ?? process.cwd();
  const prom = new Promise<string>(async(res: (value: string) => void, rej: RejectCallback) => {
    try {
      const [runCommand, runArguments] = ((): [string, Array<string | undefined>] => {
        if( asNPX ) {
          return [ 'npx', [ cmd, ...(args ?? []) ] ];
        }
        return [ cmd, args ?? [] ];
      })();
      const output: {
        stdout: string;
      } = {
        stdout: '',
      };
      if( !context.quiet ) {
        console.log(`[${context.colors.fgGreen('Running command')}: ${runCommand}${runArguments.length?` ${runArguments.join(' ')}`:''}]`);
      }
      const process = spawn(runCommand, runArguments.reduce((a: string[], v: string | undefined): string[] => {
        if( v !== undefined ) {
          a.push(escapeQuotes(v));
        }
        return a;
      }, []), {
        cwd,
        shell: true,
        stdio: [ 'inherit', 'pipe', 'inherit' ],
      });
      process.stdout?.on('data', (data: Buffer | string): void => {
        if( Buffer.isBuffer(data) ) {
          output.stdout += data.toString('utf8');
        } else if( typeof(data) === 'string' ) {
          output.stdout += data;
        }
      });
      process.on('close', (code?: number, signal?: string) => {
        if( typeof(code) === 'number' && code !== 0 ) {
          rej(new Error(`Process exited with code: ${code}`));
        } else if( typeof(signal) === 'string' && signal !== '') {
          rej(new Error(`Process exit with signal: ${signal}`));
        } else {
          res(output.stdout);
        }
      });
    } catch(e: unknown) {
      rej(e);
    }
  });
  const caller = getNormalizedPath(context.contextPath, callerPath);
  return addPromise(context, prom, pathToArray(caller), `runShellOutput ${cmd} ${args.join(' ')}`);
};
