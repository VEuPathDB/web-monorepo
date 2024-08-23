import {
  isArray,
  isBoolean,
  isNumber,
  isPlainObject,
  isString,
  values,
} from 'lodash';

import { Seq } from '../Utils/IterableUtils';

/**
 * Validate and parse JSON strings into TypeScript/JavaScript objects.
 *
 * Inspired by Elm's Json.Decode library (https://guide.elm-lang.org/interop/json.html).
 *
 * This module exposes:
 * - primitive decoders (`string`, `number`, `boolean`, etc)
 * - higher-order decoders for creating more sophisticated decoders (`oneOf`,
 *   `field`, etc)
 * - a function for using the decoders (`decode`)
 *
 * In most cases, a decoder will be used to describe data we expect to receive
 * from a web service to ensure it conforms to types resident in the client
 * application. If the data does not conform, an error will be thrown describing
 * the first encountered problem.
 */
export type Decoder<T> = (t: any) => Result<T>;

// Get underlying type of Decoder (e.g, T of Decoder<T>)
export type Unpack<T> = T extends Decoder<infer R> ? R : never;

// Decoder return types
// --------------------

export type Ok<T> = {
  status: 'ok';
  value: T;
};

export type Err = {
  status: 'err';
  value: any;
  expected: string;
  context?: string;
};

export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T> {
  return { status: 'ok', value };
}

export function err(value: any, expected: string, context: string = ''): Err {
  return { status: 'err', value, expected, context };
}

// primitives
// ----------

export function string(t: any): Result<string> {
  return isString(t) ? ok(t) : err(t, 'string');
}

export function number(t: any): Result<number> {
  return isNumber(t) ? ok(t) : err(t, 'number');
}

export function boolean(t: any): Result<boolean> {
  return isBoolean(t) ? ok(t) : err(t, 'boolean');
}

export function nullValue(t: any): Result<null> {
  return t === null ? ok(t) : err(t, 'null');
}

export function none(t: any): Result<void> {
  return t === undefined ? ok(t) : err(t, 'undefined');
}

export function unknown(t: unknown): Result<unknown> {
  return ok(t);
}

// higher order decoders
// ---------------------

// Expect a specific value
export function constant<T extends string | number | boolean | null>(
  value: T
): Decoder<T>;
export function constant<T>(value: T) {
  return function constantGuard(t: any): Result<T> {
    return t === value ? ok(t) : err(t, JSON.stringify(value));
  };
}

// Expect an object with string keys and values of a specific type
export function objectOf<T>(decoder: Decoder<T>) {
  return function objectOfDecoder(t: any): Result<Record<string, T>> {
    if (!isPlainObject(t)) return err(t, 'object');
    const e = values(t)
      .map(decoder)
      .find((r) => r.status === 'err') as Err;
    return e == null ? ok(t) : err(e.value, e.expected, `[string]${e.context}`);
  };
}

// Expect an array with elements of a specific type
export function arrayOf<T>(decoder: Decoder<T>) {
  return function arrayOfDecoder(t: any): Result<Array<T>> {
    if (!isArray(t)) return err(t, `Array<${decoder.name}>`);
    const e = t.map(decoder).find((r) => r.status === 'err') as Err;
    return e == null ? ok(t) : err(e.value, e.expected, `[number]${e.context}`);
  };
}

// Expect an object with a specific field whose value is of a specific type.
// Additional fields are ok and will be ignored.
// `field` decoders can be combined using `combine` to describe more properties
// of an object.
export function field<T, S extends string>(fieldName: S, decoder: Decoder<T>) {
  return function fieldDecoder(t: any): Result<{ [K in S]: T }> {
    if (!isPlainObject(t)) return err(t, `object`);
    const r = decoder(t[fieldName]);
    return r.status === 'ok'
      ? ok(t)
      : err(r.value, r.expected, `.${fieldName}${r.context}`);
  };
}

export function record<T>(
  decoderRecord: { [K in keyof T]: Decoder<T[K]> }
): Decoder<T> {
  return function decodeRecord(t: any): Result<T> {
    if (!isPlainObject(t)) return err(t, `object`);
    for (const key in decoderRecord) {
      const r = decoderRecord[key](t[key]);
      if (r.status === 'err')
        return err(r.value, r.expected, `.${key}${r.context}`);
    }
    return ok(t);
  };
}

// Expect a value of a specific type, or `undefined`
export function optional<T>(decoder: Decoder<T>) {
  return function optionalGuard(t?: any): Result<T | undefined> {
    return t === undefined ? ok(t) : decoder(t);
  };
}

// Combine multiple decoders such that all must return Ok
export function combine<T>(decoder1: Decoder<T>): Decoder<T>;
export function combine<T, S>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>
): Decoder<T & S>;
export function combine<T, S, R>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>
): Decoder<T & S & R>;
export function combine<T, S, R, Q>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>
): Decoder<T & S & R & Q>;
export function combine<T, S, R, Q, P>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>
): Decoder<T & S & R & Q & P>;
export function combine<T, S, R, Q, P, O>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>
): Decoder<T & S & R & Q & P & O>;
export function combine<T, S, R, Q, P, O, N>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>
): Decoder<T & S & R & Q & P & O & N>;
export function combine<T, S, R, Q, P, O, N, M>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>
): Decoder<T & S & R & Q & P & O & N & M>;
export function combine<T, S, R, Q, P, O, N, M, L>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>
): Decoder<T & S & R & Q & P & O & N & M & L>;
export function combine<T, S, R, Q, P, O, N, M, L, K>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>,
  decoder10: Decoder<K>
): Decoder<T & S & R & Q & P & O & N & M & L & K>;
export function combine<T>(...decoders: Decoder<T>[]): Decoder<T>;
export function combine(...decoders: any[]) {
  return function combineDecoder(t: any) {
    return (
      Seq.from(decoders)
        .map((d) => d(t))
        .find((r) => r.status === 'err') || ok(t)
    );
  };
}

// Combine multiple decoders such that at least one must return Ok
export function oneOf<T, S>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>
): Decoder<T | S>;
export function oneOf<T, S, R>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>
): Decoder<T | S | R>;
export function oneOf<T, S, R, Q>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>
): Decoder<T | S | R | Q>;
export function oneOf<T, S, R, Q, P>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>
): Decoder<T | S | R | Q | P>;
export function oneOf<T, S, R, Q, P, O>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>
): Decoder<T | S | R | Q | P | O>;
export function oneOf<T, S, R, Q, P, O, N>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>
): Decoder<T | S | R | Q | P | O | N>;
export function oneOf<T, S, R, Q, P, O, N, M>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>
): Decoder<T | S | R | Q | P | O | N | M>;
export function oneOf<T, S, R, Q, P, O, N, M, L>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>
): Decoder<T | S | R | Q | P | O | N | M | L>;
export function oneOf<T, S, R, Q, P, O, N, M, L, K>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>,
  decoder10: Decoder<K>
): Decoder<T | S | R | Q | P | O | N | M | L | K>;
export function oneOf<T, S, R, Q, P, O, N, M, L, K, J>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>,
  decoder10: Decoder<K>,
  decoder11: Decoder<J>
): Decoder<T | S | R | Q | P | O | N | M | L | K | J>;
export function oneOf<T>(...decoders: Decoder<T>[]): Decoder<T>;
export function oneOf(...decoders: any[]) {
  return function oneOfDecoder(t: any) {
    const results = Seq.from(decoders).map((d) => d(t));
    const okResult = results.find((r) => r.status === 'ok');
    if (okResult) return ok(t);
    // build error message
    return err(
      results.map((e) => e.value).first(),
      `${results.map((e) => e.expected).join(' | ')}`,
      results.map((e) => e.context).first()
    );
  };
}

// Combine multiple decoders such that at least one must return Ok
export function tuple<T, S>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>
): Decoder<[T, S]>;
export function tuple<T, S, R>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>
): Decoder<[T, S, R]>;
export function tuple<T, S, R, Q>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>
): Decoder<[T, S, R, Q]>;
export function tuple<T, S, R, Q, P>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>
): Decoder<[T, S, R, Q, P]>;
export function tuple<T, S, R, Q, P, O>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>
): Decoder<[T, S, R, Q, P, O]>;
export function tuple<T, S, R, Q, P, O, N>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>
): Decoder<[T, S, R, Q, P, O, N]>;
export function tuple<T, S, R, Q, P, O, N, M>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>
): Decoder<[T, S, R, Q, P, O, N, M]>;
export function tuple<T, S, R, Q, P, O, N, M, L>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>
): Decoder<[T, S, R, Q, P, O, N, M, L]>;
export function tuple<T, S, R, Q, P, O, N, M, L, K>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>,
  decoder10: Decoder<K>
): Decoder<[T, S, R, Q, P, O, N, M, L, K]>;
export function tuple<T, S, R, Q, P, O, N, M, L, K, J>(
  decoder1: Decoder<T>,
  decoder2: Decoder<S>,
  decoder3: Decoder<R>,
  decoder4: Decoder<Q>,
  decoder5: Decoder<P>,
  decoder6: Decoder<O>,
  decoder7: Decoder<N>,
  decoder8: Decoder<M>,
  decoder9: Decoder<L>,
  decoder10: Decoder<K>,
  decoder11: Decoder<J>
): Decoder<T | S | R | Q | P | O | N | M | L | K | J>;
export function tuple<T>(...decoders: Decoder<T>[]): Decoder<T>;
export function tuple(...decoders: Decoder<any>[]) {
  return function tupleDecoder(t: any) {
    if (!isArray(t)) return err(t, 'an array');
    const results = decoders.map((d, i) => d(t[i]));
    return results.find((r) => r.status === 'ok')
      ? ok(t)
      : err(t, `[ ${decoders.map((d) => d.name).join(', ')} ]`);
  };
}

// Ensure that a decoder is not evaluated until it is needed. This is useful for
// recursive types (like trees).
export function lazy<T>(decoderThunk: () => Decoder<T>) {
  return function lazyGuard(t: any): Result<T> {
    return decoderThunk()(t);
  };
}

// Decoder
// -------

// Run `decoder` on `jsonString`
export function decode<T>(decoder: Decoder<T>, jsonString: string): T {
  let t: any;
  try {
    t = JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Provided JSON is not valid: ' + error.message);
  }
  const r = decoder(t);
  if (r.status === 'err') {
    throw new Error(`Could not decode string: ${standardErrorReport(r)}`);
  }
  return r.value;
}

export function standardErrorReport(errResult: Err) {
  return `Expected ${errResult.expected}${
    errResult.context ? ' at _' + errResult.context : ''
  }, but got ${JSON.stringify(errResult.value)}.`;
}

export function decodeOrElse<T>(
  decoder: Decoder<T>,
  defaultValue: T,
  jsonString: string
): T {
  try {
    return decode(decoder, jsonString);
  } catch (e) {
    console.warn('Unable to decode value. Falling back to default.', e);
    return defaultValue;
  }
}
