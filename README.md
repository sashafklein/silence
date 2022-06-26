# React Silence

A lightweight set of utils for silencing console output in a variety of contexts, including React components.

- [silence](#silence)
- [unsilence](#unsilence)
- [silenceDescribe](#silenceDescribe)
- [silenceWithin](#silenceWithin)
- [silenceFor](#silenceFor)
- [useSilence](#useSilence)
- [matchers](#matchers)

## Getting started

```bash
npm install -D react-silence
```

```ts
import { silence, unsilence } from 'react-silence';

// Defaults to silencing errors
silence();
// Nothing will be logged
console.error('Annoying and unsuppressible message');
unsilence();
```

## Utils

Most of the following utils follow a similar interface, taking spread arguments of one of two types:

- `logTypes` - Available console methods: `"error"`, `"log"`, `"warn"`, or `"info"`.
- `matchers` - Regular Expressions to match against. If they match console output of the specified logType, they will be blocked. If no matchers are provided, all logs of that output type will be blocked.

> Note: If no log types are passed, `"error"` is provided as a default. If no matchers are passed, all logs of the specified type(s) are silenced by default.

By convention, log type args precede matcher args, but any order works.

## silence

Simply turns off the console for the given types and any text matching the given matchers:

```ts
import { silence } from 'react-silence';

// Silence all errors - 'error' is default types argument
silence();
silence('error');

// Silence all warnings
silence('warn');

// Silence all warnings and errors
silence('warn', 'error');

// Silence all errors matching a regex
silence('error', /matches/);
console.error("This one matches and will be silenced");
console.error("This one doesn't and won't");

// Go crazy
silence('warn', 'error', 'info', /any/, /phrase/, /I/, /want/);

// Unsilence all console errors
unsilence('error')

// Or just unsilence everything
unsilence()
```

> All calls to `silence` should be followed by a call to `unsilence`.

## unsilence

Restores the log functions to their normal state. See above for examples.

## silenceDescribe

In a Jest testing context, applies the silencing rules within a describe block, and unsilences when the tests are complete.

```ts
describe("some functionality", () => {
  silenceDescribe("errors", /matches/);
  //...
});
```

## silenceWithin

The equivalent of sandwiching behavior between `silence` and `unsilence` calls:

```ts
silenceWithin(() => {
  console.warn("I'm silenced because I match.");
}, "warn", /match/);

console.warn("I'm not silenced, even though I match, because I'm outside the `silenceWithin` context.");
```

## silenceFor

A convenience method for pre-applying the same logTypes and matchers to `silence`'s methods:

```ts
const { silence, unsilence, /* etc */ } = silenceFor("warn", /match/);
silence();
console.warn("I'm silenced because I match.");
console.warn("I'm not because I don't.");
console.error("Although I match the regex, I'm not silenced, since I'm an error.");
unsilence();
```

## useSilence

A React hook for silencing in a component context:

```tsx
const QuietComponent = () => {
  useSilence("error", /SomeError/);

  return (
    <div>
      <MayLogSomeError />
      <p>Ahh... Silence.</p>
    </div>
  );
}
```

## matchers

The library also exports a small matchers object defining a handful of regex matchers for convenience.
