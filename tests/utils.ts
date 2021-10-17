export const runshell = (_cmd: string): Promise<string> => {
  return new Promise<string>((res: (value: string) => void, rej: (value: unknown) => void) => {
    try {
      res('test');
    } catch(e: unknown) {
      rej(e);
    }
  });
};
