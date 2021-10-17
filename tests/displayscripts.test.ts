import { createContext } from '../src/context';
import { displayScripts } from '../src/displayscripts';

const emptyCallback = async(): Promise<void> => {
  return;
};

describe('displayscripts', () => {
  it('basic', () => {
    const output: {
      log: (...values: unknown[]) => void;
      text: string;
    } = {
      log: (...values: unknown[]): void => {
        for(const v of values) {
          if( typeof(v) === 'string' ) {
            output.text += `${v as string}\n`;
          }
        }
      },
      text: '',
    };
    const context = createContext('/test', 'never');
    context.rootScripts = {
      actions: {
        build: {
          arguments: {
            'test': 'this',
          },
          callback: emptyCallback,
          description: 'top build',
        },
        test: {
          arguments: {
            'where': 'when',
          },
          callback: emptyCallback,
          description: 'top test',
        },
      },
      subscripts: {
        subdir: {
          actions: {
            build: {
              arguments: {
                'subtest': 'subthis',
              },
              callback: emptyCallback,
              description: 'sub build',
            },
            lint: {
              arguments: {
                'subwhere': 'subwhen',
              },
              callback: emptyCallback,
              description: 'sub lint',
            },
          },
          subscripts: {
          },
        },
      },
    };
    displayScripts(context, output);
    expect(output.text).to.equal('  Actions\n  -------\n\n  build - top build\n      --test     - this\n    subdir - sub build\n      --subtest  - subthis\n  lint \n    subdir - sub lint\n      --subwhere - subwhen\n  test  - top test\n      --where    - when\n');
  });
});
