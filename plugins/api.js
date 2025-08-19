import { ofetch } from 'ofetch';
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const token = useCookie('token', { sameSite: 'lax' });
  const api = ofetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const t = token.value;
      if (t) options.headers = { ...options.headers, Authorization: `Bearer ${t}` };
    }
  });
  return { provide: { api } };
});
