import { createContext } from '../src/context';
import { importScript } from '../src/importscript';
import { join } from 'path';

describe('multiple', () => {
  it('do not load multiple configs', async() => {
    const fullPath = join(__dirname, 'multiple');
    const context = createContext(fullPath, 'never');
    context.quiet = true;
    // Will throw an exception if failing
    await importScript(context, fullPath);
  });
});
