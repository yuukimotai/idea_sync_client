import { apiCall } from "./client";
import type { IdeasResponse, Idea } from "@/shared/types";

export type IdeaSort = "created_at" | "updated_at" | "title";

export type ListIdeasParams = {
  q?: string;
  sort?: IdeaSort;
  order?: "asc" | "desc";
};

export async function listIdeas(params: ListIdeasParams = {}): Promise<IdeasResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  const qs = query.toString();
  return apiCall(`/api/ideas${qs ? `?${qs}` : ""}`);
}

export async function createIdea(
  title: string,
  description: string
): Promise<{ status: string; idea: Idea }> {
  return apiCall("/api/ideas", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export async function updateIdea(
  id: string,
  title: string,
  description: string
): Promise<{ status: string; idea: Idea }> {
  return apiCall(`/api/ideas/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title, description }),
  });
}

export async function deleteIdea(id: string): Promise<{ status: string }> {
  return apiCall(`/api/ideas/${id}`, {
    method: "DELETE",
  });
}
