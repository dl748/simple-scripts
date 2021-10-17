import * as path from 'path';
import * as utils from '../src/utils';

describe('getNormalizedPath', () => {
  it('basic', async() => {
    const rootPath = path.resolve('.');
    const fullPath = path.resolve(path.join('this', 'that'));
    const nPath = utils.getNormalizedPath(rootPath, fullPath, '/');
    expect(nPath).to.equal('this/that');
  });
});

describe('pathToArray', () => {
  it('basic', async() => {
    const emptyPath = utils.pathToArray('');
    expect(emptyPath).to.deep.equal([]);
    const singlePath = utils.pathToArray('this');
    expect(singlePath).to.deep.equal(['this']);
    const multiplePath = utils.pathToArray('this/that');
    expect(multiplePath).to.deep.equal(['this', 'that']);
  });
});

describe('getStack', () => {
  it('basic', async() => {
    const stack = ((): NodeJS.CallSite[] => utils.getStack())();
    expect(stack).to.have.lengthOf(10);
    const lastPath = path.dirname(stack[0]?.getFileName() ?? '');
    expect(lastPath).to.equal(__dirname);
  });
});

describe('getCaller', () => {
  it('basic', async() => {
    const lastPath = ((): NodeJS.CallSite => ((): NodeJS.CallSite => utils.getCaller())())();
    expect(lastPath.getFileName).to.not.equal(undefined);
    expect(path.dirname(lastPath.getFileName() ?? '')).to.equal(__dirname);
  });
});

describe('getCallerPath', () => {
  it('basic', async() => {
    const lastPath = ((): string => ((): string => utils.getCallerPath())())();
    expect(lastPath).to.equal(__dirname);
  });
});

describe('fileExists', () => {
  it('basic', async() => {
    expect(await utils.fileExists(__filename)).to.equal(true);
    expect(await utils.fileExists(`${__filename}1`)).to.equal(false);
  });
});

describe('normalizeArguments', () => {
  it('basic', async() => {
    const args = [ 'myscript:test', '--where=when', '--what=who'];
    expect(utils.normalizeArguments(args)).to.deep.equal({
      arguments: {
        what: 'who',
        where: 'when',
      },
      script: 'myscript:test',
    });
  });
});

describe('wordWrap', () => {
  it('basic', async() => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam finibus mauris dolor, sit amet luctus massa cursus sed. Duis ornare rhoncus suscipit. Aliquam non nibh tortor. Integer in turpis faucibus, viverra ipsum vitae, condimentum mi. Nunc auctor lectus dapibus vulputate rhoncus. Sed a fermentum leo. Duis vestibulum eros at leo maximus, sed tempus augue cursus. Proin convallis tellus nec justo tempor, id volutpat purus ultricies. Nunc porta congue justo, vel imperdiet nisl consectetur non. Donec et ultrices nibh. Praesent lacinia, ligula at commodo accumsan, leo erat faucibus ante, nec fermentum libero tortor a tellus. Fusce pharetra tincidunt euismod. Curabitur ipsum nibh, blandit vel pretium nec, mollis et orci.';
    expect(utils.wordWrap(text, process.stdout.columns - 50)).to.deep.equal([
      'Lorem ipsum dolor sit amet, consectetur adipiscing',
      'elit. Aliquam finibus mauris dolor, sit amet',
      'luctus massa cursus sed. Duis ornare rhoncus',
      'suscipit. Aliquam non nibh tortor. Integer in',
      'turpis faucibus, viverra ipsum vitae, condimentum',
      'mi. Nunc auctor lectus dapibus vulputate rhoncus.',
      'Sed a fermentum leo. Duis vestibulum eros at leo',
      'maximus, sed tempus augue cursus. Proin convallis',
      'tellus nec justo tempor, id volutpat purus',
      'ultricies. Nunc porta congue justo, vel imperdiet',
      'nisl consectetur non. Donec et ultrices nibh.',
      'Praesent lacinia, ligula at commodo accumsan, leo',
      'erat faucibus ante, nec fermentum libero tortor a',
      'tellus. Fusce pharetra tincidunt euismod.',
      'Curabitur ipsum nibh, blandit vel pretium nec,',
      'mollis et orci.',
    ]);
  });
});

describe('divideBigInt', () => {
  it('basic', async() => {
    const values = utils.divideBigInt(BigInt(125), 100);
    expect(values[0]).to.equal(BigInt(1));
    expect(values[1]).to.equal(BigInt(25));
  });
});

describe('displayTime', () => {
  it('basic', async() => {
    expect(utils.displayTime(BigInt('1'))).to.equal('1.000ns');
    expect(utils.displayTime(BigInt('12'))).to.equal('12.000ns');
    expect(utils.displayTime(BigInt('123'))).to.equal('123.000ns');
    expect(utils.displayTime(BigInt('1234'))).to.equal('1.234μs');
    expect(utils.displayTime(BigInt('12345'))).to.equal('12.345μs');
    expect(utils.displayTime(BigInt('123456'))).to.equal('123.456μs');
    expect(utils.displayTime(BigInt('1234567'))).to.equal('1.235ms');
    expect(utils.displayTime(BigInt('12345678'))).to.equal('12.346ms');
    expect(utils.displayTime(BigInt('123456789'))).to.equal('123.457ms');
    expect(utils.displayTime(BigInt('1234567890'))).to.equal('1.235s');
    expect(utils.displayTime(BigInt('12345678901'))).to.equal('12.346s');
    expect(utils.displayTime(BigInt('123456789012'))).to.equal('2.058m');
    expect(utils.displayTime(BigInt('1234567890123'))).to.equal('20.576m');
    expect(utils.displayTime(BigInt('12345678901234'))).to.equal('3.429h');
    expect(utils.displayTime(BigInt('123456789012345'))).to.equal('1.429d');
  });
});

describe('getFileType', () => {
  it('basic', async() => {
    expect(await utils.getFileType(__filename)).to.equal('file');
    expect(await utils.getFileType(__dirname)).to.equal('directory');
    expect(await utils.getFileType('1')).to.equal(undefined);
  });
});
