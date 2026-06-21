import { apiFetch } from "@/lib/api-client";

export type NewsletterResponse = { success?: boolean; message?: string };

export async function subscribeToNewsletter(email: string) {
  return apiFetch<NewsletterResponse>("/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}
