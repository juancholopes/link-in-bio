import type { APIRoute } from 'astro'

export const prerender = false

const jsonHeaders = { 'Content-Type': 'application/json' }

const defaultPayload = {
  isPlaying: false,
  currentlyPlayingType: null,
  timestamp: null,
  progressMs: null,
  track: {
    title: null,
    artist: null,
    album: null,
    durationMs: null,
    id: null,
    uri: null,
    url: null,
  },
  artwork: {
    url: null,
    width: null,
    height: null,
  },
  context: {
    type: null,
    uri: null,
    url: null,
  },
}

function buildSpotifyPayload(data: any) {
  const isEpisode = data?.currently_playing_type === 'episode'
  const item = data?.item
  const artwork = isEpisode ? item?.images?.[0] : item?.album?.images?.[0]

  return {
    isPlaying: Boolean(data?.is_playing),
    currentlyPlayingType: data?.currently_playing_type ?? null,
    timestamp: data?.timestamp ?? null,
    progressMs: data?.progress_ms ?? null,
    track: {
      title: item?.name ?? null,
      artist: isEpisode ? (item?.show?.publisher ?? 'Podcast') : (item?.artists?.[0]?.name ?? null),
      album: isEpisode ? (item?.show?.name ?? null) : (item?.album?.name ?? null),
      durationMs: item?.duration_ms ?? null,
      id: item?.id ?? null,
      uri: item?.uri ?? null,
      url: item?.external_urls?.spotify ?? null,
    },
    artwork: {
      url: artwork?.url ?? null,
      width: artwork?.width ?? null,
      height: artwork?.height ?? null,
    },
    context: {
      type: data?.context?.type ?? null,
      uri: data?.context?.uri ?? null,
      url: data?.context?.external_urls?.spotify ?? null,
    },
  }
}

export const GET: APIRoute = async () => {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN
  const currentPlayingUrl = import.meta.env.SPOTIFY_CURRENT_PLAYING

  if (!clientId || !clientSecret || !refreshToken || !currentPlayingUrl) {
    return new Response(JSON.stringify({ error: 'Missing Spotify environment variables' }), {
      status: 500,
      headers: jsonHeaders,
    })
  }

  try {
    const basicAuth = btoa(`${clientId}:${clientSecret}`)

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ error: 'Could not get Spotify access token' }), {
        status: tokenRes.status,
        headers: jsonHeaders,
      })
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const currentPlayingSong = await fetch(currentPlayingUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (currentPlayingSong.status === 204) {
      return new Response(JSON.stringify(defaultPayload), {
        status: 200,
        headers: jsonHeaders,
      })
    }

    if (!currentPlayingSong.ok) {
      return new Response(JSON.stringify({ error: 'Could not get current playing item' }), {
        status: currentPlayingSong.status,
        headers: jsonHeaders,
      })
    }

    const data = await currentPlayingSong.json()
    return new Response(JSON.stringify(buildSpotifyPayload(data)), {
      status: 200,
      headers: jsonHeaders,
    })
  } catch (error) {
    console.error('Spotify API route error', error)
    return new Response(JSON.stringify({ error: 'Spotify request failed', ...defaultPayload }), {
      status: 503,
      headers: jsonHeaders,
    })
  }
}
