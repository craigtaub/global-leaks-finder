# Global Leaks finder

A mocha-based testing tool to help find tests which are leaking globals. 

The aim is to help catch and avoid tests with unexpected side-effects.

It does add significant time to the job so best run only occasionally. See below for explanation how it works.

## Why?
Take this example. Before each test the `browser` is set and after it is reset. *However* we do not know what the value was before this unit test ran or if `false` is a reliable value for later tests. This is an example of a global leakage and is easily missed.
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

Ideally its best to use something like [Sinon.js Sandboxing](https://gist.github.com/jgable/fd7fbd0516c849731404), but it is not always possible.

## Install
Does not require any additional dependencies, just itself.
```
npm install global-leaks-finder
```

## Usage

    mocha --check-leaks node_modules/global-leak-finder/index.js <your test files here>

## Mocha's check-leaks options
I recommend running in conjunction with Mocha's `check-leaks` flag. It compares against a small list of non-enumerable globals (i.e. `global.newVariable = 'some-value';` would be caught) but would not catch something like `process.execPath = 'GLOBAL LEAK';` which this tool would catch.

## How does it work

It runs a global `beforeEach` and `afterEach`.
For each test it hashes the globals at the start, hashes the globals at the end, and compares the 2 failing if the hash has changed. Hence why it has a hefty performance hit, but hopefully does its job.
