import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN
  const currentPlayingUrl = import.meta.env.SPOTIFY_CURRENT_PLAYING

  if (!clientId || !clientSecret || !refreshToken || !currentPlayingUrl) {
    return new Response(JSON.stringify({ error: 'Missing Spotify environment variables' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
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
        headers: { 'Content-Type': 'application/json' },
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
      return new Response(JSON.stringify({ isPlaying: false, album: null, artist: null, image: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!currentPlayingSong.ok) {
      return new Response(JSON.stringify({ error: 'Could not get current playing item' }), {
        status: currentPlayingSong.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await currentPlayingSong.json()

    if (data?.currently_playing_type === 'episode' && data?.item) {
      return new Response(
        JSON.stringify({
          isPlaying: Boolean(data.is_playing),
          album: data.item.show?.name ?? null,
          artist: 'Podcast',
          image: data.item.images?.[0]?.url ?? null,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        isPlaying: Boolean(data?.is_playing),
        album: data?.item?.album?.name ?? null,
        artist: data?.item?.artists?.[0]?.name ?? null,
        image: data?.item?.album?.images?.[0]?.url ?? null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Spotify API route error', error)
    return new Response(JSON.stringify({ error: 'Spotify request failed', isPlaying: false, album: null, artist: null, image: null }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
