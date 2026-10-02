import { Router, type IRouter } from "express";

const router: IRouter = Router();
const TMDB_API_URL = "https://api.themoviedb.org/3";

type TmdbMediaType = "movie" | "tv";
type TmdbSearchType = "all" | TmdbMediaType;

type TmdbRawResult = {
  id?: number;
  media_type?: string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
};

function normalizeResult(result: TmdbRawResult, mediaType: TmdbMediaType) {
  return {
    id: result.id,
    mediaType,
    title: result.title || result.name || "Untitled",
    year: (result.release_date || result.first_air_date || "").slice(0, 4) || null,
    overview: result.overview || "",
    posterPath: result.poster_path || null,
    backdropPath: result.backdrop_path || null,
    voteAverage: result.vote_average || 0,
    voteCount: result.vote_count || 0,
  };
}

async function tmdbRequest<T>(path: string, params: Record<string, string> = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured on the API server.");
  }

  const url = new URL(`${TMDB_API_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`TMDB request failed (${response.status})${message ? `: ${message.slice(0, 160)}` : ""}`);
  }
  return response.json() as Promise<T>;
}

async function findById(id: string, type: TmdbSearchType) {
  const mediaTypes: TmdbMediaType[] = type === "all" ? ["movie", "tv"] : [type];
  const matches = await Promise.all(mediaTypes.map(async (mediaType) => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) throw new Error("TMDB_API_KEY is not configured on the API server.");

    const url = new URL(`${TMDB_API_URL}/${mediaType}/${encodeURIComponent(id)}`);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US");
    const response = await fetch(url);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`TMDB request failed (${response.status}).`);
    return normalizeResult(await response.json() as TmdbRawResult, mediaType);
  }));
  return matches.filter((result): result is NonNullable<typeof result> => Boolean(result));
}

router.get("/tmdb/search", async (req, res) => {
  const query = String(req.query.q || "").trim();
  const requestedType = String(req.query.type || "all");
  const type: TmdbSearchType = requestedType === "movie" || requestedType === "tv" ? requestedType : "all";

  if (query.length < 2) {
    res.status(400).json({ error: "Enter at least two characters to search TMDB." });
    return;
  }

  try {
    const results = /^\d+$/.test(query)
      ? await findById(query, type)
      : (await tmdbRequest<{ results?: TmdbRawResult[] }>(type === "all" ? "/search/multi" : `/search/${type}`, {
        query,
        include_adult: "false",
        page: "1",
      })).results?.flatMap((result) => {
        const mediaType = result.media_type === "tv" || type === "tv" ? "tv" : result.media_type === "movie" || type === "movie" ? "movie" : null;
        return mediaType ? [normalizeResult(result, mediaType)] : [];
      }) || [];

    res.json({ query, type, results: results.slice(0, 20) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TMDB search failed.";
    req.log.error({ err: error }, "TMDB search failed");
    res.status(502).json({ error: message });
  }
});

export default router;