import { createContext } from '../src/context';

describe('context', () => {
  it('basic', async() => {
    const context = createContext('/test', 'auto');
    expect(context).to.have.property('colors');
    expect(context?.awaitingPromises?.path).to.deep.equal({});
    expect(context?.awaitingPromises?.promises).to.deep.equal([]);
    expect(context?.contextPath).to.equal('/test');
    expect(context?.defaultSynchronous).to.equal(false);
    expect(context?.quiet).to.equal(false);
    expect(context?.rootScripts?.actions).to.deep.equal({});
    expect(context?.rootScripts?.subscripts).to.deep.equal({});
    expect(context?.script).to.equal('');
    expect(context?.scripts).to.have.keys([
      'addPassthroughScripts',
      'getScripts',
      'import',
      'importSubdirectories',
      'register',
      'removeFiles',
      'run',
      'runShell',
      'runShellOutput',
    ]);
    expect(context?.scriptsArguments).to.deep.equal({});
    expect(context?.scriptsBaseName).to.equal('scripts');
  });
});
