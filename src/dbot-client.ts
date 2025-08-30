import 'dotenv/config';

const BASE_URL = process.env.DBOT_BASE_URL!;

interface AccessToken {
  access: string;
}

interface Tokens {
  access: string;
  refresh: string;
}

let currentTokens: Tokens | null = null;

/**
 * Small helper to POST JSON with fetch
 */
async function postJson<T>(
  url: string,
  body: any,
  headers: Record<string, string> = {},
): Promise<{ status: number; data: T }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body ?? {}),
  });

  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    /* ignore non-JSON bodies */
  }

  return { status: res.status, data: data as T };
}

const getTokens = async () => {
  try {
    console.log('Trying to get tokens.');
    const { status, data } = await postJson<Tokens>(BASE_URL + 'token', {
      username: process.env.DBOT_USERNAME,
      password: process.env.DBOT_PASSWORD,
    });
    if (status >= 200 && status < 300) {
      currentTokens = data;
    }
  } catch (e) {
    currentTokens = null;
    console.log('Failed to get tokens.', e);
    setTimeout(getTokens, 10000);
  }
};

const refreshAccessToken = async () => {
  if (!currentTokens) return;
  try {
    const { status, data } = await postJson<AccessToken>(
      BASE_URL + 'token/refresh',
      { refresh: currentTokens.refresh },
    );
    if (status >= 200 && status < 300) {
      currentTokens.access = data.access;
    }
  } catch (e) {
    currentTokens = null;
    console.log('Failed to refresh access tokens.', e);
    setTimeout(getTokens, 5000);
  }
};

export const getWsToken = async () => {
  if (!currentTokens) return null;
  try {
    const { status, data } = await postJson<{ token: string }>(
      BASE_URL + 'token/ws',
      {},
      { Authorization: `Bearer ${currentTokens.access}` },
    );
    if (status >= 200 && status < 300) {
      return data.token;
    }
  } catch (e) {
    console.log('Failed to get ws token.', e);
  }
  return null;
};

export const initialiseDbotClient = async () => {
  await getTokens();
  setInterval(getTokens, 21600000);
  setInterval(refreshAccessToken, 150000);
};

export const play = async (
  ytUrl: string,
  volume?: number | null,
): Promise<boolean> => {
  if (!currentTokens) return false;
  try {
    const { status } = await postJson(
      BASE_URL + 'bot/play_yt',
      { yt_url: ytUrl, volume },
      { Authorization: `Bearer ${currentTokens.access}` },
    );
    console.log('Response status for play: ' + status);
    return status >= 200 && status < 300;
  } catch (e) {
    console.log('Play failed', e);
    return false;
  }
};

export const welcome = async (userId: string): Promise<boolean> => {
  if (!currentTokens) return false;
  try {
    const { status } = await postJson(
      BASE_URL + 'bot/discord_event/welcome',
      { user_id: userId },
      { Authorization: `Bearer ${currentTokens.access}` },
    );
    console.log('Response status for welcome: ' + status);
    return status >= 200 && status < 300;
  } catch (e) {
    console.log('welcome failed', e);
    return false;
  }
};

export const greetings = async (): Promise<boolean> => {
  if (!currentTokens) return false;
  try {
    const { status } = await postJson(
      BASE_URL + 'bot/discord_event/greetings',
      {},
      { Authorization: `Bearer ${currentTokens.access}` },
    );
    console.log('Response status for greetings: ' + status);
    return status >= 200 && status < 300;
  } catch (e) {
    console.log('greetings failed', e);
    return false;
  }
};
