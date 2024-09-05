import { AsyncIterableStream } from "../index";

declare global {
  interface Map<K, V> {
    asyncStream(): AsyncIterableStream<[K, V]>;
    asyncStreamKeys(): AsyncIterableStream<K>;
    asyncStreamValues(): AsyncIterableStream<V>;
  }
}

Map.prototype.asyncStream = function () {
  return AsyncIterableStream.from(this);
};

Map.prototype.asyncStreamKeys = function () {
  return AsyncIterableStream.from(this.keys());
};

Map.prototype.asyncStreamValues = function () {
  return AsyncIterableStream.from(this.values());
};
