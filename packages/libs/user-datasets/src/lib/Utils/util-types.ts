import { Dispatch, SetStateAction } from "react";

export type FieldSetter<T> = Dispatch<SetStateAction<T>>;

export type StateField<T> = [ T, FieldSetter<T> ];