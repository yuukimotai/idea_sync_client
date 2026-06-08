import { apiCall } from "./client";
import type { IdeasResponse, Idea } from "@/shared/types";

export async function listIdeas(): Promise<IdeasResponse> {
  return apiCall("/api/ideas");
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
  id: number,
  title: string,
  description: string
): Promise<{ status: string; idea: Idea }> {
  return apiCall(`/api/ideas/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title, description }),
  });
}

export async function deleteIdea(id: number): Promise<{ status: string }> {
  return apiCall(`/api/ideas/${id}`, {
    method: "DELETE",
  });
}
