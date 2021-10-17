import * as path from 'path';
import {
  mkdir,
  writeFile,
} from 'fs/promises';
import { createContext } from '../src/context';
import { getFileType } from '../src/utils';
import { removeFiles } from '../src/removefiles';

describe('register/run', () => {
  it('basic', async() => {
    const context = createContext(__dirname, 'never');
    context.quiet = true;
    try {
      await mkdir(path.join(__dirname, '12345'));
    } catch {
      // ignore error
    }
    try {
      await writeFile(path.join(__dirname, '12345', 'x.txt'), '');
    } catch {
      // ignore error
    }
    await (async(): Promise<void> => {
      await removeFiles(context, [ '12345' ]);
    })();
    expect(await getFileType('12345')).to.equal(undefined);
  });
});
