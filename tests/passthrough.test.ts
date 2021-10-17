import { addPassthroughScripts } from '../src/passthrough';
import { createContext } from '../src/context';
import { runScripts } from '../src/runscripts';

describe('passthrough', () => {
  it('basic', async() => {
    const context = createContext('/test', 'never');
    context.quiet = true;
    const values = {
      called: false,
    };
    context.rootScripts = {
      actions: {
      },
      subscripts: {
        subdir: {
          actions: {
            build: {
              arguments: {
                'subtest': 'subthis',
              },
              callback: async(): Promise<void> => {
                values.called = true;
              },
              description: 'sub build',
            },
          },
          subscripts: {
          },
        },
      },
    };
    await addPassthroughScripts(context, {
      'build': {
        description: 'top build',
      },
      'test': {
        description: 'top test',
      },
    }, {
      callerPath: '/test',
    });
    expect(context.rootScripts.actions).to.have.property('build');
    expect(context.rootScripts.actions).to.not.have.property('test');
    await runScripts(context, 'build', {
      path: '',
    });
    expect(values.called).to.equal(true);
  });
});
