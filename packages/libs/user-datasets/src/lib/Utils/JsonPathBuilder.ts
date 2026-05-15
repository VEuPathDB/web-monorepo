/**
 * Naive JSONPath string constructor loosely based on Java's Path interface API.
 */
export class JsonPathBuilder {
  public static readonly Root = new JsonPathBuilder('$');

  private readonly parentRef: JsonPathBuilder;
  private readonly self: string | number;

  private constructor(path: string | number, parent?: JsonPathBuilder) {
    this.parentRef = parent ?? this;
    this.self = path;
  }

  get parent(): JsonPathBuilder {
    return this.parentRef;
  }

  /**
   * Creates a new `JsonPathBuilder` instance with the given subpath value
   * appended to it.
   */
  append<T extends object>(subpath: keyof T): JsonPathBuilder;
  append(subpath: string): JsonPathBuilder;
  append(subpath: number): JsonPathBuilder;
  append(subpath: string | number): JsonPathBuilder {
    return new JsonPathBuilder(subpath, this);
  }

  /**
   * Returns a JSONPath string containing the value of this `JsonPathBuilder`
   * instance with the given subpath value appended to it.
   */
  appendToString<T extends object>(subpath: keyof T): string;
  appendToString(subpath: string): string;
  appendToString(subpath: number): string;
  appendToString(subpath: string | number): string {
    return this.toString() + JsonPathBuilder.toString(subpath);
  }

  /**
   * Renders this `JsonPathBuilder` instance as a JSONPath string.
   */
  toString(): string {
    return this === JsonPathBuilder.Root
      ? (this.self as string)
      : this.parentRef.toString() + JsonPathBuilder.toString(this.self);
  }

  private static toString(child: string | number): string {
    return typeof child === 'number' ? `[${child}]` : `.${child}`;
  }
}
