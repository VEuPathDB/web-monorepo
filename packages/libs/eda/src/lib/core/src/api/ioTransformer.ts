import { isLeft } from 'fp-ts/lib/Either';
import { Decoder } from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';

export function ioTransformer<I, A>(decoder: Decoder<I, A>) {
  return async function decodeOrThrow(value: I): Promise<A> {
    const result = decoder.decode(value);
    if (isLeft(result)) {
      const message = PathReporter.report(result).join('\n');
      throw new Error(message);
    }
    return result.right;
  };
}
