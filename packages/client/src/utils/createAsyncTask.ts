export interface AsyncTask<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function createAsyncTask<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const asyncTask = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  }) as AsyncTask<T>;
  asyncTask.resolve = resolve;
  asyncTask.reject = reject;

  return asyncTask;
}
