export type ActionResult<T = void> = {
  ok: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string>;
};

export function successResult<T>(message: string, data?: T): ActionResult<T> {
  return {
    ok: true,
    message,
    data,
  };
}

export function errorResult(message: string, fieldErrors?: Record<string, string>): ActionResult {
  return {
    ok: false,
    message,
    fieldErrors,
  };
}
