import { createContext } from '../src/context';
import { importScript } from '../src/importscript';

describe('import', () => {
  it('basic/subdirectories', async() => {
    const context = createContext(__dirname, 'never');
    context.quiet = true;
    await importScript(context, __dirname);
    expect(context.rootScripts?.actions?.build?.callback).to.not.equal(undefined);
    expect(context.rootScripts?.subscripts.x?.actions?.build?.callback).to.not.equal(undefined);
  });
});
