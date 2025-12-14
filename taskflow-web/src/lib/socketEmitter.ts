import axios from "axios";

type EmitPayload = {
  room?: string;
  data?: any;
};

export async function emitSocketEvent(event: string, payload: EmitPayload) {
  const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_INTERNAL_URL;

  if (!SOCKET_SERVER_URL) {
    console.warn("⚠️ SOCKET_SERVER_INTERNAL_URL not set");
    return;
  }

  try {
    await axios.post(
      `${SOCKET_SERVER_URL}/emit`,
      {
        event,
        payload,
      },
      {
        timeout: 3000, // avoid hanging serverless functions
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Failed to emit socket event:", event, error);
    // Do NOT throw — socket failure should not break API
  }
}
