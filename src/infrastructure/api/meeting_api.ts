import { apiCall } from "./client";
import type {
  Meeting, Message, MeetingResponse, MeetingDetailResponse,
  MeetingJoinResponse, MeetingParticipant, MeetingPurpose, MessagesResponse,
} from "@/shared/types";

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

export async function getMeetingDetail(id: string): Promise<MeetingDetailResponse> {
  return apiCall<MeetingDetailResponse>(`/api/meetings/${id}`, { method: "GET" });
}

export async function assignRole(meetingId: string, accountId: string, role: string): Promise<MeetingParticipant> {
  const res = await apiCall<{ participant: MeetingParticipant }>(`/api/meetings/${meetingId}/roles`, {
    method: "POST",
    body: JSON.stringify({ account_id: accountId, role }),
  });
  return res.participant;
}

export async function revokeRole(meetingId: string, accountId: string, role: string): Promise<MeetingParticipant> {
  const res = await apiCall<{ participant: MeetingParticipant }>(`/api/meetings/${meetingId}/roles`, {
    method: "DELETE",
    body: JSON.stringify({ account_id: accountId, role }),
  });
  return res.participant;
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
