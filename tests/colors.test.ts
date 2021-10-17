import { getColors } from '../src/colors';

describe('getColors', () => {
  it('always with tty', () => {
    const colors = getColors('always', true);
    expect(colors.bgRed('test')).to.equal('\u001b[41mtest\u001b[49m');
  });
  it('always no tty', () => {
    const colors = getColors('always', false);
    expect(colors.bgRed('test')).to.equal('\u001b[41mtest\u001b[49m');
  });
  it('auto with tty', () => {
    const colors = getColors('auto', true);
    expect(colors.bgRed('test')).to.equal('\u001b[41mtest\u001b[49m');
  });
  it('auto no tty', () => {
    const colors = getColors('auto', false);
    expect(colors.bgRed('test')).to.equal('test');
  });
  it('never with tty', () => {
    const colors = getColors('never', true);
    expect(colors.bgRed('test')).to.equal('test');
  });
  it('never no tty', () => {
    const colors = getColors('never', false);
    expect(colors.bgRed('test')).to.equal('test');
  });
});
