import { apiFetch } from "@/lib/api-client";

export type CommentPayload = Record<string, unknown>;

export async function fetchComments(targetId: string, targetType: string) {
  const query = new URLSearchParams({
    target_id: targetId,
    target_type: targetType,
  });
  const response = await apiFetch<any>(`/comments?${query.toString()}`);
  return response?.data ?? response ?? [];
}

export async function createComment(payload: CommentPayload) {
  return apiFetch<any>("/comments", { method: "POST", body: payload });
}

export async function likeComment(commentId: string) {
  return apiFetch<any>(`/comments/${commentId}/like`, { method: "POST" });
}

export async function fetchAdminComments() {
  const response = await apiFetch<any>("/comments/admin");
  return response?.data ?? response ?? [];
}

export async function deleteComment(commentId: string) {
  return apiFetch<void>(`/comments/${commentId}`, { method: "DELETE" });
}

export async function updateCommentStatus(commentId: string, status: string) {
  return apiFetch<any>(`/comments/${commentId}/status`, {
    method: "PUT",
    body: { status },
  });
}
