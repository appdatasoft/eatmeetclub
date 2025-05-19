// lib/fetcher.ts

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const errorBody = await res.json();
      message += `: ${errorBody?.message || JSON.stringify(errorBody)}`;
    } catch {
      const text = await res.text();
      message += `: ${text}`;
    }
    throw new Error(message);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error('Invalid JSON response');
  }
}
