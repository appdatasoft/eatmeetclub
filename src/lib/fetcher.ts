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

  let data: T;
  try {
    data = await res.json(); // ✅ read body once
  } catch (e) {
    throw new Error(`Invalid JSON response: ${(e as Error).message}`);
  }

  if (!res.ok) {
    const message = (data as any)?.message || JSON.stringify(data);
    throw new Error(`Error ${res.status}: ${message}`);
  }

  return data;
}
