/**
 * Execute a fetch request, with retry logic. `maxRetry` specifies the maximum number of times to retry the request.
 * When this maximum is reached, any thrown errors are propagated to the caller.
 * There is a delay between tries in an attempt to allow external conditions to settle.
 */
export async function fetchWithRetry(
  maxRetry: number,
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  for (let i = 0; i < maxRetry; i++) {
    try {
      return await fetch(input, appendRetryHeader(i, init));
    } catch {
      // Add a delay in case the user's network is in a temporary bad state.
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  return fetch(input, appendRetryHeader(maxRetry, init));
}

function appendRetryHeader(retryNum: number, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers ?? ({} as HeadersInit));
  headers.append('x-client-retry-count', retryNum.toString());
  return { ...init, headers };
}
