import * as fun from './types';
import { useState } from 'react';

type Setter<T> = fun.Consumer<T | fun.Function<T, T>>;

export function useSimpleState<T>(): SimpleState<T | undefined>;
export function useSimpleState<T>(value: T | fun.Producer<T>): SimpleState<T>;
export function useSimpleState<T>(value?: T | fun.Producer<T>): SimpleState<T> | SimpleState<T | undefined> {
  return new SimpleState(useState<T | undefined>(value));
}

export class SimpleState<T> {
  private readonly _value: T;
  private readonly _setter: Setter<T>;

  constructor([ value, setter ]: fun.Tuple<T, Setter<T>>) {
    this._value = value;
    this._setter = setter;
  }

  public get isUndefined(): boolean {
    return this._value === undefined;
  }

  public get(): T {
    return this._value;
  }

  public set(val: T) {
    this._setter(val);
  }

  public update(fn: fun.Function<T, T>) {
    this._setter(fn);
  }
}