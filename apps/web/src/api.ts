export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(
    `/api${path}`,
    body === undefined
      ? undefined
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server is unavailable. Check your connection and try again.",
    );
  }
  if (!response.ok)
    throw Object.assign(new Error(data.error || "Please try again."), {
      status: response.status,
    });
  return data as T;
}
