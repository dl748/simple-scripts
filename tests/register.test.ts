import { createContext } from '../src/context';
import { register } from '../src/register';
import { runScripts } from '../src/runscripts';

describe('register/run', () => {
  it('basic', async() => {
    const context = createContext('/test', 'never');
    context.quiet = true;
    const values = {
      called: false,
      subcalled: false,
    };
    await register(context, 'build', async() => {
      values.called = true;
    }, {
      path: '',
    });
    await register(context, 'build', async() => {
      values.subcalled = true;
    }, {
      path: 'x/y',
    });
    await runScripts(context, 'build', {
      path: '',
    });
    expect(values.called).to.equal(true);
    expect(values.subcalled).to.equal(false);
    values.called = false;
    await runScripts(context, 'build:x/y', {
      path: '',
    });
    expect(values.called).to.equal(false);
    expect(values.subcalled).to.equal(true);
    values.subcalled = false;
    await runScripts(context, 'build', {
      path: 'x/y',
    });
    expect(values.called).to.equal(false);
    expect(values.subcalled).to.equal(true);
  });
});
