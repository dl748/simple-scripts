import type {
  IContext,
  IPromisePath,
} from './types';

export const getPromiseTree = (current: IPromisePath, path: string[]): IPromisePath[] => {
  const pathList = [ ...path ];
  const results: IPromisePath[] = [ current ];
  const p = pathList.shift();
  if( p !== undefined ) {
    if( current.path[p] !== undefined ) {
      results.push(...getPromiseTree(current.path[p], pathList));
    }
  }
  return results;
};

export const addPromise = <T>(context: IContext, prom: Promise<T>, path: string[], name: string): Promise<T> => {
  const voidPromise = (prom as unknown) as Promise<void>;
  ((voidPromise as unknown) as { name?: string; }).name = name;
  const lastAwaiter = getPromiseTree(context.awaitingPromises, path).reverse().filter((v: { promises?: Array<Promise<void>>; }) => v.promises !== undefined).shift() as IPromisePath;
  lastAwaiter.promises?.push(voidPromise);
  return prom;
};

export const getPromises = (current: IPromisePath, path: string[]): IPromisePath => {
  const pathList = [ ...path ];
  const p = pathList.shift();
  if( p !== undefined ) {
    if( current.path[p] === undefined ) {
      current.path[p] = {
        path: {},
      };
    }
    return getPromises(current.path[p], pathList);
  }
  return current;
};
