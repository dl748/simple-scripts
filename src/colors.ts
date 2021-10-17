const foregroundColors = {
  black: 30,
  blue: 34,
  brightblack: 90,
  brightblue: 94,
  brightcyan: 96,
  brightgreen: 92,
  brightmagenta: 95,
  brightred: 91,
  brightwhite: 97,
  brightyellow: 93,
  cyan: 36,
  green: 32,
  magenta: 35,
  red: 31,
  white: 37,
  yellow: 33,
};

const backgroundColors = {
  black: 40,
  blue: 44,
  brightblack: 100,
  brightblue: 104,
  brightcyan: 106,
  brightgreen: 102,
  brightmagenta: 105,
  brightred: 101,
  brightwhite: 107,
  brightyellow: 103,
  cyan: 46,
  green: 42,
  magenta: 45,
  red: 41,
  white: 47,
  yellow: 43,
};

type ColorCall = (s: string) => string;

type BackgroundColors<T> = {
  /* eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members */
  [P in keyof T & string as `bg${Capitalize<P>}`]: ColorCall;
};

type ForegroundColors<T> = {
  /* eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members */
  [P in keyof T & string as `fg${Capitalize<P>}`]: ColorCall;
};

export type ExportColors = BackgroundColors<typeof backgroundColors> & ForegroundColors<typeof foregroundColors>;

export const getColors = (colors: string, isTTY: boolean): ExportColors => {
  const showColors = (colors === 'always') || (colors === 'auto' && isTTY);
  return {
    ...(Object.entries(backgroundColors).reduce((a: Record<string, ColorCall>, [k, v]: [string, number]) => {
      const value = v.toString(10);
      a[`bg${k.charAt(0).toUpperCase()}${k.slice(1)}`] = showColors?(s: string): string => {
        return `\u001B[${value}m${s}\u001B[49m`;
      }:(s: string): string => s;
      return a;
    }, {}) as BackgroundColors<typeof backgroundColors>),
    ...(Object.entries(foregroundColors).reduce((a: Record<string, ColorCall>, [k, v]: [string, number]) => {
      const value = v.toString(10);
      a[`fg${k.charAt(0).toUpperCase()}${k.slice(1)}`] = showColors?(s: string): string => {
        return `\u001B[${value}m${s}\u001B[39m`;
      }:(s: string): string => s;
      return a;
    }, {}) as ForegroundColors<typeof foregroundColors>),
  };
};
