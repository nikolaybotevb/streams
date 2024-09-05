/**
 * An object containing factory methods for AsyncStream.
 *
 * ```
 * AsyncStream.from([1, 2, 3]).map(x => x * 2).forEach(console.log);
 * ```
 */
export const AsyncStream = {
  from: asyncStreamFrom,
  fromAsyncIterable: asyncStreamFromAsyncIterable,
  fromIterable: asyncStreamFromIterable,
  fromIterator: asyncStreamFromIterator,
};

/**
 * An asynchronous stream that produces elements of type `T` on demand.
 *
 * This is an extension of the built-in `AsyncIterable<T>` protocol.
 *
 * The operations defined here in AsyncStream are a superset of the operations
 * described in the [Async Iterator Helpers](https://github.com/tc39/proposal-async-iterator-helpers)
 * proposal.
 *
 * The behavior of all operations here that correspond to operations in the
 * `Async Iterator Helpers` proposal are defined (as best as possible) to match
 * exactly with the behavior of the corresponding `Async Iterator Helpers`
 * operations. This is intended to allow users of this library to seamlessly
 * switch between this library and the `Async Iterator Helpers` once those are
 * implemented and available.
 *
 * However, this library is NOT a polyfill for `Async Iterator Helpers`. To use
 * this library, an async iterable iterator or generator needs to be explicitly
 * wrapped in an AsyncStream like in this example:
 *
 * ```
 * import "streams/asyncGenerator";
 *
 * async function* generator() {
 *   yield* [1, 2, 3];
 * }
 *
 * generator()               // returns an AsyncGenerator
 *   .stream()               // convert to AsyncStream first!
 *   .forEach(console.log);  // use the AsyncStream APIs
 * ```
 */
export interface AsyncStream<T> extends AsyncIterableIterator<T> {
  //
  // Intermediate operations
  //

  /**
   * Returns a new stream that skips elements of this stream not matched by the
   * `predicate`.
   *
   * See also [IteratorHelpers#filter](https://github.com/tc39/proposal-iterator-helpers#filterfiltererfn).
   *
   * @param predicate a function that decides whether to include each element
   * in the new stream (true) or to exclude the element (false)
   */
  filter(predicate: (_: T) => boolean): AsyncStream<T>;

  /**
   * Returns a new stream that transforms each element of this stream
   * using the provided function.
   *
   * See also [IteratorHelpers#map](https://github.com/tc39/proposal-iterator-helpers#mapmapperfn).
   *
   * @alias
   * @param transform a function to apply to each element of this stream
   */
  map<U>(transform: (_: T) => U): AsyncStream<U>;

  /**
   * Like `map` but the `transform` is an async function that returns a Promise
   * and is awaited before producing the next transformed element.
   *
   * @param transform an async function to apply to each element of this stream
   */
  mapAwait<U>(transform: (_: T) => Promise<U>): AsyncStream<U>;

  /**
   *
   * See also [IteratorHelpers#flatMap](https://github.com/tc39/proposal-iterator-helpers#flatmapmapperfn).
   *
   * @param transform
   */
  flatMap<U>(transform: (_: T) => AsyncIterable<U>): AsyncStream<U>;

  flatMapAwait<U>(
    transform: (_: T) => Promise<AsyncIterable<U>>,
  ): AsyncStream<U>;

  batch(batchSize: number): AsyncStream<T[]>;

  /**
   * Returns a new stream that produces up to the first `limit` number of
   * elements of this stream.
   *
   * See also [IteratorHelpers#take](https://github.com/tc39/proposal-iterator-helpers#takelimit).
   *
   * @param limit the maximum number of items to produce
   */
  take(limit: number): AsyncStream<T>;

  /**
   * An alias for `take`.
   *
   * @alias take
   * @param maxSize the maximum number of items to produce
   */
  limit(maxSize: number): AsyncStream<T>;

  /**
   *
   * See also [IteratorHelpers#drop](https://github.com/tc39/proposal-iterator-helpers#droplimit).
   *
   * @param n
   */
  drop(n: number): AsyncStream<T>;

  /**
   * An alias for `drop`.
   *
   * @alias drop
   * @param n the number of elements to skip from the start of this stream
   */
  skip(n: number): AsyncStream<T>;

  dropWhile(predicate: (_: T) => boolean): AsyncStream<T>;

  takeWhile(predicate: (_: T) => boolean): AsyncStream<T>;

  peek(observer: (_: T) => void): AsyncStream<T>;

  //
  // Terminal operations
  //

  /**
   *
   * See also [IteratorHelpers#forEach](https://github.com/tc39/proposal-iterator-helpers#foreachfn).
   *
   * @param block
   */
  forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void>;
  collect<A, R>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R>;
  reduceLeft<R>(initial: R, accumulator: (r: R, t: T) => R): Promise<R>;

  /**
   *
   * See also [IteratorHelpers#reduce](https://github.com/tc39/proposal-iterator-helpers#reducereducer--initialvalue-).
   *
   * @param accumulator
   * @param initial
   */
  reduce(accumulator: (a: T, b: T) => T, initial?: T): Promise<T>;

  /**
   * Like {@link AsyncStream#reduce()} but returns `undefined` if this stream is
   * empty instead of throwing `TypeError`.
   *
   * @param accumulator
   * @param initial
   */
  fold(accumulator: (a: T, b: T) => T, initial?: T): Promise<T | undefined>;

  /**
   *
   * See also [IteratorHelpers#every](https://github.com/tc39/proposal-iterator-helpers#everyfn).
   *
   * @param predicate
   */
  every(predicate: (_: T) => boolean): Promise<boolean>;

  /**
   * An alias for `every`.
   *
   * @param predicate
   */
  all(predicate: (_: T) => boolean): Promise<boolean>;

  /**
   * See also [IteratorHelpers#some](https://github.com/tc39/proposal-iterator-helpers#somefn).
   *
   * @param predicate
   */
  some(predicate: (_: T) => boolean): Promise<boolean>;

  /**
   * An alias for `some`.
   *
   * @param predicate
   */
  any(predicate: (_: T) => boolean): Promise<boolean>;
  none(predicate: (_: T) => boolean): Promise<boolean>;
  count(): Promise<number>;

  /**
   * An alias for `first`.
   *
   * See also [IteratorHelpers#find](https://github.com/tc39/proposal-iterator-helpers#findfn).
   *
   * @param predicate
   */
  find(predicate: (_: T) => boolean): Promise<T | undefined>;

  first(predicate?: (_: T) => boolean): Promise<T | undefined>;
  last(predicate?: (_: T) => boolean): Promise<T | undefined>;
  max(comparator: (a: T, b: T) => number): Promise<T | undefined>;
  min(comparator: (a: T, b: T) => number): Promise<T | undefined>;

  /**
   * See also [IteratorHelpers#toArray](https://github.com/tc39/proposal-iterator-helpers#toarray).
   */
  toArray(): Promise<T[]>;
}

//
// AsyncStream Implementation
//

class AsyncStreamOfIterator<T>
  implements AsyncStream<T>, AsyncIterableIterator<T>
{
  constructor(private readonly iterator: AsyncIterator<T>) {}

  // The AsyncIterator protocol
  next(...args: [] | [undefined]) {
    return this.iterator.next(...args);
  }

  readonly return = this.iterator.return
    ? (value?: unknown) => {
        return this.iterator.return!(value);
      }
    : undefined;

  readonly throw = this.iterator.throw
    ? (e?: unknown) => {
        return this.iterator.throw!(e);
      }
    : undefined;

  // Aliases
  readonly limit = this.take;
  readonly skip = this.drop;
  readonly find = this.first;
  readonly all = this.every;
  readonly any = this.some;

  /**
   * @returns the AsyncIterator wrapped by this AsyncStream
   */
  [Symbol.asyncIterator]() {
    return this;
  }

  filter(predicate: (_: T) => boolean): AsyncStream<T> {
    async function* filtered(it: AsyncStream<T>) {
      for await (const v of it) {
        if (predicate(v)) {
          yield v;
        }
      }
    }
    return new AsyncStreamOfIterator(filtered(this));
  }

  map<U>(transform: (_: T) => U): AsyncStream<U> {
    function mapResult(sourceResult) {
      return new Promise<IteratorResult<U>>((resolve, reject) => {
        sourceResult.then((result) => {
          if (result.done) {
            resolve(result);
          } else {
            // transform could return a Promise...
            const transformed = transform(result.value);
            Promise.resolve(transformed).then(
              (value) => resolve({ value, done: false }),
              reject,
            );
          }
        }, reject);
      });
    }

    const nextMapped = (...args: [] | [undefined]) => {
      const sourceResult = this.iterator.next(...args);
      return mapResult(sourceResult);
    };

    const mappedIterator: AsyncIterator<U> = { next: nextMapped };

    if (this.iterator.return) {
      mappedIterator.return = (value?) => {
        const sourceResult = this.iterator.return!(value);
        return mapResult(sourceResult);
      };
    }

    if (this.iterator.throw) {
      mappedIterator.throw = (e?) => {
        const sourceResult = this.iterator.throw!(e);
        return mapResult(sourceResult);
      };
    }
    return new AsyncStreamOfIterator(mappedIterator);
  }

  mapAwait<U>(transform: (_: T) => Promise<U>): AsyncStream<U> {
    async function* mapAwaited(it: AsyncStream<T>) {
      for await (const v of it) {
        yield transform(v);
      }
    }
    return new AsyncStreamOfIterator(mapAwaited(this));
  }

  flatMap<U>(transform: (_: T) => AsyncIterable<U>): AsyncStream<U> {
    async function* flatMapped(it: AsyncStream<T>) {
      for await (const nested of it) {
        yield* transform(nested);
      }
    }
    return new AsyncStreamOfIterator(flatMapped(this));
  }

  flatMapAwait<U>(
    transform: (_: T) => Promise<AsyncIterable<U>>,
  ): AsyncStream<U> {
    async function* flatMapAwaited(it: AsyncStream<T>) {
      for await (const nested of it) {
        yield* await transform(nested);
      }
    }
    return new AsyncStreamOfIterator(flatMapAwaited(this));
  }

  batch(batchSize: number): AsyncStream<T[]> {
    if (batchSize < 1) {
      throw new Error("batchSize should be positive");
    }

    async function* batched(it: AsyncStream<T>) {
      let acc: T[] = [];
      for await (const v of it) {
        acc.push(v);
        if (acc.length === batchSize) {
          yield acc;
          acc = [];
        }
      }
      if (acc.length > 0) {
        yield acc;
      }
    }
    return new AsyncStreamOfIterator(batched(this));
  }

  take(maxSize: number): AsyncStream<T> {
    async function* limited(it: AsyncStream<T>) {
      let count = 0;
      if (count >= maxSize) {
        return;
      }
      for await (const v of it) {
        yield v;
        count += 1;
        if (count >= maxSize) {
          return;
        }
      }
    }
    return new AsyncStreamOfIterator(limited(this));
  }

  drop(n: number): AsyncStream<T> {
    async function* skipped(it: AsyncStream<T>) {
      let count = 0;
      for await (const v of it) {
        if (count >= n) {
          yield v;
        }
        count += 1;
      }
    }
    return new AsyncStreamOfIterator(skipped(this));
  }

  dropWhile(predicate: (_: T) => boolean): AsyncStream<T> {
    async function* droppedWhile(it: AsyncStream<T>) {
      let dropping = true;
      for await (const v of it) {
        dropping = dropping && predicate(v);
        if (!dropping) {
          yield v;
        }
      }
    }
    return new AsyncStreamOfIterator(droppedWhile(this));
  }

  takeWhile(predicate: (_: T) => boolean): AsyncStream<T> {
    async function* takenWhile(it: AsyncStream<T>) {
      for await (const v of it) {
        if (!predicate(v)) {
          return;
        }
        yield v;
      }
    }
    return new AsyncStreamOfIterator(takenWhile(this));
  }

  peek(observer: (_: T) => void): AsyncStream<T> {
    async function* peeked(it: AsyncStream<T>) {
      for await (const v of it) {
        observer(v);
        yield v;
      }
    }
    return new AsyncStreamOfIterator(peeked(this));
  }

  async forEach(block: (_: T) => unknown | Promise<unknown>): Promise<void> {
    for await (const v of this) {
      await block(v);
    }
  }

  async collect<A, R>(
    container: A,
    accumulator: (a: A, t: T) => void,
    finisher: (_: A) => R,
  ): Promise<R> {
    for await (const v of this) {
      accumulator(container, v);
    }
    return finisher(container);
  }

  async reduceLeft<R>(initial: R, reducer: (r: R, t: T) => R): Promise<R> {
    let result = initial;
    for await (const v of this) {
      result = reducer(result, v);
    }
    return result;
  }

  async every(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (!(await predicate(v))) {
        return false;
      }
    }
    return true;
  }

  async some(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (await predicate(v)) {
        return true;
      }
    }
    return false;
  }

  async none(predicate: (_: T) => boolean): Promise<boolean> {
    for await (const v of this) {
      if (await predicate(v)) {
        return false;
      }
    }
    return true;
  }

  async count(): Promise<number> {
    let count = 0;
    for await (const _ of this) {
      count += 1;
    }
    return count;
  }

  async first(
    predicate: (_: T) => boolean = (_) => true,
  ): Promise<T | undefined> {
    for await (const v of this) {
      if (await predicate(v)) {
        return v;
      }
    }
    return undefined;
  }

  async last(
    predicate: (_: T) => boolean = (_) => true,
  ): Promise<T | undefined> {
    let result: T | undefined;
    for await (const v of this) {
      if (await predicate(v)) {
        result = v;
      }
    }
    return result;
  }

  async max(comparator: (a: T, b: T) => number): Promise<T | undefined> {
    let result: T | undefined;
    let firstItem = true;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = comparator(result!, v) > 0 ? result : v;
      }
    }
    return result;
  }

  async min(comparator: (a: T, b: T) => number): Promise<T | undefined> {
    let result: T | undefined;
    let firstItem = true;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = comparator(result!, v) < 0 ? result : v;
      }
    }
    return result;
  }

  async reduce(adder: (a: T, b: T) => T, initial?: T): Promise<T> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = adder(result!, v);
      }
    }
    if (firstItem) {
      throw new TypeError("reduce without initial value but stream is empty");
    }
    return result!;
  }

  async fold(adder: (a: T, b: T) => T, initial?: T): Promise<T | undefined> {
    const hasInitial = arguments.length >= 2;
    let firstItem = !hasInitial;
    let result = initial;
    for await (const v of this) {
      if (firstItem) {
        result = v;
        firstItem = false;
      } else {
        result = adder(result!, v);
      }
    }
    return result;
  }

  async toArray(): Promise<T[]> {
    const result = [] as T[];
    for await (const v of this) {
      result.push(v);
    }
    return result;
  }
}

//
// AsyncStream Factories
//

function asyncStreamFromIterable<T>(itrbl: Iterable<T>): AsyncStream<T> {
  async function* iterableSource() {
    for (const e of itrbl) {
      yield e;
    }
  }
  return new AsyncStreamOfIterator(iterableSource());
}

function asyncStreamFromAsyncIterable<T>(
  itrbl: AsyncIterable<T>,
): AsyncStream<T> {
  return new AsyncStreamOfIterator(itrbl[Symbol.asyncIterator]());
}

function asyncStreamFromIterator<T>(
  it: Iterator<T> | AsyncIterator<T>,
): AsyncStream<T> {
  return new AsyncStreamOfIterator(it as AsyncIterator<T>);
}

function asyncStreamFrom<T>(
  it: Iterable<T> | Iterator<T> | AsyncIterable<T> | AsyncIterator<T>,
): AsyncStream<T> {
  if (typeof it[Symbol.asyncIterator] === "function") {
    return asyncStreamFromAsyncIterable(it as AsyncIterable<T>);
  }
  if (typeof it[Symbol.iterator] === "function") {
    return asyncStreamFromIterable(it as Iterable<T>);
  }
  return asyncStreamFromIterator(it as AsyncIterator<T> | Iterator<T>);
}
