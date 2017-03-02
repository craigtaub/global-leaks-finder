# Global Leaks finder

A testing tool to help find tests which are leaking globals.

Its aim is to help catch and avoid tests with unexpected side-effects.

It does add significant time to the job so best run only occasionally. See below for explanation how it works.

## Why?
Take this example. Before each test the browser is set and after it is reset. However we do not know what the value was before this unit test ran or if `false` is a reliable value for after. This is an example of a global leakage
```js
beforeEach(() => {
  process.browser = true;
});
afterEach(() => {
  process.browser = false;
});
```

Running the tool on this test would throw an error to the console `Error: Global has changed` on the test spec which has leaked, allowing you to catch and manage the problem.
The test has now been improved.

```js
let cached;
beforeEach(() => {
  cached = process.browser;
  process.browser = true;
});
afterEach(() => {
  process.browser = cached;
});
```

## Install
- does not require any additional dependencies
```
npm install global-leaks-finder
```

## Usage

    mocha --check-leaks node_modules/global-leak-finder/index.js <your test files here>

## Mocha's check-leaks options
I recommend running in conjunction with Mocha's `check-leaks` flag. It checks for additional globals (i.e. `global.newVariable = 'some-value';` // throws leak error.`) but would not catch something like `process.execPath = 'GLOBAL LEAK';` which this tool would catch.

## How does it work

It runs a global beforeEach and afterEach.
For each test it hashes globals at the start, hashes globals at end and fails if the hash has changed.
