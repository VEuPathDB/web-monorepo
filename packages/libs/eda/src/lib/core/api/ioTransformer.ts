import { isLeft } from 'fp-ts/lib/Either';
import { Decoder } from 'io-ts';

export function ioTransformer<I, A>(decoder: Decoder<I, A>) {
  return async function decodeOrThrow(value: I): Promise<A> {
    const result = decoder.decode(value);
    if (isLeft(result)) {
      const message = result.left.reduce((message, error) => {
        const context = Array.from(error.context)
          .reverse()
          .map(
            (context) =>
              `${context.key || '[root]'} (type: ${context.type.name})`
          )
          .join('\n  of ');
        return (message += `Invalid value ${JSON.stringify(
          error.value
        )} supplied to ${context}\n\n`);
      }, '');
      throw new Error(message);
    }
    return result.right;
  };
}
