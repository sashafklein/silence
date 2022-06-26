import { useEffect } from "react";

type LogType = "error" | "log" | "warn" | "info";

const og = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
};

const allLogTypes = Object.keys(og) as LogType[];

const getLogTypesAndMatchers = (
  logTypesOrMatchers: Array<LogType | RegExp>
) => {
  const logTypes: LogType[] = [];
  const matchers: RegExp[] = [];
  logTypesOrMatchers.forEach((el) => {
    if (typeof el === "string") {
      logTypes.push(el);
    } else {
      matchers.push(el);
    }
  });
  return { logTypes, matchers };
};

/**
 * Turns off the console for the given log types and any text matching the given matchers.
 * Will remain off until a matching `unsilence` call.
 * */
export const silence = (...logTypesOrMatchers: Array<LogType | RegExp>) => {
  const { logTypes, matchers } = getLogTypesAndMatchers(logTypesOrMatchers);
  logTypes.forEach((logType) => {
    console.error = (...args: string[]) => {
      // Do nothing if no matchers or matchers match
      if (!matchers) return;
      if (matchers.some((reg) => reg.test(args[0]))) return;

      og[logType](...args);
    };
  });
};

/**
 * Restores normal console functionality. If given types, restores for that type.
 * By default, unsilences all console log types.
 * */
export const unsilence = (...logTypes: LogType[]) => {
  (logTypes || allLogTypes).forEach((logType) => {
    console[logType] = og[logType];
  });
};

/**
 * Turns silence on in a before block in the describe, and then unsilences after.
 * */
export const silenceDescribe = (
  ...logTypesOrMatchers: Array<LogType | RegExp>
) => {
  const { logTypes } = getLogTypesAndMatchers(logTypesOrMatchers);
  beforeAll(() => {
    silence(...logTypesOrMatchers);
  });

  afterAll(() => {
    unsilence(...logTypes);
  });
};

/**
 * Turns silence on and off for the code run within the callback passed as a first argument.
 * */
export const silenceWithin = (
  action: () => void,
  ...logTypesOrMatchers: Array<LogType | RegExp>
) => {
  const { logTypes } = getLogTypesAndMatchers(logTypesOrMatchers);
  silence(...logTypesOrMatchers);
  action();
  unsilence(...logTypes);
};

/** Creates an returns set of silencer functions configured to the same set of log types and matchers. */
export const silenceFor = (...logTypesOrMatchers: Array<LogType | RegExp>) => {
  const { logTypes } = getLogTypesAndMatchers(logTypesOrMatchers);
  return {
    silence: () => silence(...logTypesOrMatchers),
    unsilence: () => unsilence(...logTypes),
    silenceDescribe: () => silenceDescribe(...logTypesOrMatchers),
    silenceWithin: (action) => silenceWithin(action, ...logTypesOrMatchers),
  };
};

/** Silences within the body of a React component. */
export const useSilence = (...logTypesOrMatchers: Array<LogType | RegExp>) => {
  const { logTypes } = getLogTypesAndMatchers(logTypesOrMatchers);
  silence(...logTypesOrMatchers);

  useEffect(() => {
    unsilence(...logTypes);
  });
};

export const matchers = {
  reactKeysError: /Each child in a list should have a unique "key" prop/,
  jestActError: /inside a test was not wrapped in act/,
  deprecationWarning:
    /is deprecated and will be removed in a future major release/,
};
