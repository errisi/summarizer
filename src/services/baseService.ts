import { StoreApi } from 'zustand';

export interface IBaseService<T> {
  setState: (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean | undefined
  ) => void;
  getState: () => T;
}

export class BaseService<T> implements IBaseService<T> {
  setState: (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean | undefined
  ) => void;
  getState: () => T;

  constructor(store: StoreApi<T>) {
    this.setState = store.setState as (
      partial: T | Partial<T> | ((state: T) => T | Partial<T>),
      replace?: boolean | undefined
    ) => void;

    this.getState = store.getState;
  }
}
