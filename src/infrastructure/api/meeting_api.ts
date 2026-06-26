import { apiCall } from "./client";
import type { Meeting, Message, MeetingResponse, MeetingJoinResponse, MeetingPurpose, MessagesResponse } from "@/shared/types";

export async function createMeeting(params: {
  title: string;
  purpose: MeetingPurpose;
  idea_id?: string;
}): Promise<Meeting> {
  const res = await apiCall<MeetingResponse>("/api/meetings", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res.meeting;
}

export async function getMeeting(id: string): Promise<Meeting> {
  const res = await apiCall<MeetingResponse>(`/api/meetings/${id}`, {
    method: "GET",
  });
  return res.meeting;
}

export async function joinMeeting(id: string, passcode: string): Promise<MeetingJoinResponse> {
  return apiCall<MeetingJoinResponse>(`/api/meetings/${id}/join`, {
    method: "POST",
    body: JSON.stringify({ passcode }),
  });
}

export async function listMeetingMessages(roomCode: string): Promise<Message[]> {
  const res = await apiCall<MessagesResponse>(`/api/meetings/${roomCode}/messages`, {
    method: "GET",
  });
  return res.messages;
}
