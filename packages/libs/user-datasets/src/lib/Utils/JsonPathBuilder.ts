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

  append<T extends object>(subpath: keyof T): JsonPathBuilder;
  append(subpath: string): JsonPathBuilder;
  append(subpath: number): JsonPathBuilder;
  append(subpath: string | number): JsonPathBuilder {
    return new JsonPathBuilder(subpath, this);
  }

  appendToString<T extends object>(subpath: keyof T): string;
  appendToString(subpath: string): string;
  appendToString(subpath: number): string;
  appendToString(subpath: string | number): string {
    return this.parentRef.toString() + JsonPathBuilder.toString(subpath);
  }

  toString(): string {
    return this.parentRef.toString() + JsonPathBuilder.toString(this.self);
  }

  private static toString(child: string | number): string {
    return typeof child === 'number' ? `[${child}]` : `.${child}`;
  }
}
