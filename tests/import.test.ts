import { createContext } from '../src/context';
import { importScript } from '../src/importscript';
import { join } from 'path';

describe('import', () => {
  it('basic/subdirectories', async() => {
    const fullPath = join(__dirname, 'importtest');
    const context = createContext(fullPath, 'never');
    context.quiet = true;
    await importScript(context, fullPath);
    expect(context.rootScripts?.actions?.build?.callback).to.not.equal(undefined);
    expect(context.rootScripts?.subscripts.x?.actions?.build?.callback).to.not.equal(undefined);
  });
});
