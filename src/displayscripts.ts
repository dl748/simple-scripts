import type {
  IContext,
  IScriptDefinition,
  ISubscripts,
} from './types';
import {
  wordWrap,
} from './utils';

type Listable = Record<string, Record<string, IScriptDefinition>>;

const getListable = (script: ISubscripts, path: string): Listable => {
  const results: Listable = {};
  for(const [name, scr] of Object.entries(script.subscripts)) {
    const r = getListable(scr, path===''?name:`${path}/${name}`);
    for(const [sname, sublist] of Object.entries(r)) {
      for(const [path, def] of Object.entries(sublist)) {
        if( typeof(results[sname]) === 'undefined' ) {
          results[sname] = {};
        }
        results[sname][path] = {
          ...def,
        };
      }
    }
  }
  for(const [sname, def] of Object.entries(script.actions)) {
    if( typeof(results[sname]) === 'undefined' ) {
      results[sname] = {};
    }
    results[sname][path] = {
      ...def,
    };
  }
  return results;
};

export const displayScripts = (context: IContext, myconsole: { log: (...values: unknown[]) => void; }): Listable => {
  const list = getListable(context.rootScripts, '');
  const sizes = {
    action: 0,
    argument: 0,
    path: 0,
  };
  for(const [action, scripts] of Object.entries(list)) {
    if( action.length > sizes.action ) {
      sizes.action = action.length;
    }
    for(const [path, def] of Object.entries(scripts)) {
      if( path.length > sizes.path ) {
        sizes.path = path.length;
      }
      for(const arg of Object.keys(def.arguments ?? {})) {
        if( arg.length > sizes.argument ) {
          sizes.argument = arg.length;
        }
      }
    }
  }
  if( !context.quiet ) {
    myconsole.log('  Actions');
    myconsole.log('  -------');
    myconsole.log('');
    for(const action of Object.keys(list).sort()) {
      const alist = list[action];
      const daction = alist[''];
      const actionText = wordWrap(daction?.description ?? '', 5+sizes.action);
      const firstline = actionText.shift() ?? '';
      myconsole.log(`  ${context.colors.fgGreen(action.padEnd(sizes.action))}${daction!==undefined?` - ${firstline}`:''}`);
      for(const line of actionText) {
        myconsole.log(`${''.padEnd(5+sizes.action)}${line}`);
      }
      for(const arg of Object.keys(daction?.arguments ?? {}).sort()) {
        const argText = wordWrap(daction?.arguments?.[arg] ?? '', 11+sizes.argument);
        const aFirstLine = argText.shift() ?? '';
        myconsole.log(`      --${context.colors.fgMagenta(arg.padEnd(sizes.argument))} - ${aFirstLine}`);
        for(const line of argText) {
          myconsole.log(`${''.padEnd(11+sizes.argument)}${line}`);
        }
      }
      for(const path of Object.keys(list[action]).sort()) {
        if( path !== '' ) {
          const pathText = wordWrap(list[action][path].description ?? '', 7+sizes.path);
          const pFirstLine = pathText.shift() ?? '';
          myconsole.log(`    ${context.colors.fgCyan(path.padEnd(sizes.path))} - ${pFirstLine}`);
          for(const line of pathText) {
            myconsole.log(`${''.padEnd(7+sizes.path)}${line}`);
          }
          for(const arg of Object.keys(list[action][path].arguments ?? {}).sort()) {
            const argText = wordWrap(list[action][path].arguments?.[arg] ?? '', 11+sizes.argument);
            const aFirstLine = argText.shift() ?? '';
            myconsole.log(`      ${context.colors.fgMagenta(`--${arg.padEnd(sizes.argument)}`)} - ${aFirstLine}`);
            for(const line of argText) {
              myconsole.log(`${''.padEnd(11+sizes.argument)}${line}`);
            }
          }
        }
      }
    }
  }
  return list;
};
