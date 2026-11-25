import { API_URL } from "../config.js";

// Locally saved images come back as "/uploads/x.jpg"; Cloudinary images are full URLs
export const imageSrc = (url) => (url.startsWith("/") ? API_URL + url : url);

// Every call sends the Clerk login token so the backend knows who the user is
async function call(path, getToken, options = {}) {
  const token = await getToken();
  const res = await fetch(API_URL + path, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    let message = "Something went wrong";
    try {
      message = (await res.json()).detail || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export function predictImage(file, getToken) {
  const form = new FormData();
  form.append("file", file);
  return call("/predict", getToken, { method: "POST", body: form });
}

export const getHistory = (getToken) => call("/history", getToken);

export const deletePrediction = (id, getToken) => call(`/history/${id}`, getToken, { method: "DELETE" });
