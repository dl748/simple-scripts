import type { ISimpleScripts } from '../../src/index';

export default async(scripts: ISimpleScripts): Promise<void> => {
  await scripts.register('build', async(): Promise<void> => {
    console.log('ts build');
  });
};
