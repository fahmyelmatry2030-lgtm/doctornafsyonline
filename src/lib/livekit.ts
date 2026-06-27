import { AccessToken } from "livekit-server-sdk";
import { getSettings } from "@/app/[locale]/admin/settings/actions";

export async function createLiveKitToken(
  roomName: string,
  participantName: string,
  participantId: string
): Promise<string | null> {
  const settings = await getSettings();
  const apiKey = settings.livekitApiKey && settings.livekitApiKey !== "API_***" ? settings.livekitApiKey : process.env.LIVEKIT_API_KEY;
  const apiSecret = settings.livekitKey && settings.livekitKey !== "lk_secret_***" ? settings.livekitKey : process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) return null;

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    ttl: "2h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await token.toJwt();
}

export async function isLiveKitConfigured(): Promise<boolean> {
  const settings = await getSettings();
  const apiKey = settings.livekitApiKey && settings.livekitApiKey !== "API_***" ? settings.livekitApiKey : process.env.LIVEKIT_API_KEY;
  const apiSecret = settings.livekitKey && settings.livekitKey !== "lk_secret_***" ? settings.livekitKey : process.env.LIVEKIT_API_SECRET;
  const url = settings.livekitUrl && settings.livekitUrl !== "wss://your-livekit.livekit.cloud" ? settings.livekitUrl : process.env.LIVEKIT_URL;

  return Boolean(apiKey && apiSecret && url);
}
