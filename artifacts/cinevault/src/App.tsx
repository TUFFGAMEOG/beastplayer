import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Bookmark, Check, ChevronDown, Clapperboard, Compass, Copy, ExternalLink, Film, Home as HomeIcon, Info, LoaderCircle, Play, Search, ShieldCheck, X } from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { type CatalogItem, catalog } from '@/catalog';

const WATCHLIST_KEY = 'cinevault-watchlist';
const SOURCES_KEY = 'cinevault-sources';
const SAVED_SOURCES_KEY = 'beastplayer-saved-sources';

type SavedSource = {
  id: string;
  url: string;
  label: string;
  mediaType: 'Movie' | 'Series';
  catalogId?: string;
  sourceBase?: string;
  tmdbId?: string;
  season?: string;
  episode?: string;
  savedAt: number;
};

type EmbedDetails = {
  sourceBase?: string;
  tmdbId?: string;
  season?: string;
  episode?: string;
  label?: string;
  savedId?: string;
};

type TmdbLookupResult = {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  year: string | null;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
};

type TmdbLookupType = 'all' | 'movie' | 'tv';

function readIds(): string[] {
  try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]'); } catch { return []; }
}

function readSources(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(SOURCES_KEY) || '{}'); } catch { return {}; }
}

function readSavedSources(): SavedSource[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_SOURCES_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((source): source is SavedSource => (
      source
      && typeof source.id === 'string'
      && typeof source.url === 'string'
      && typeof source.label === 'string'
      && (source.mediaType === 'Movie' || source.mediaType === 'Series')
      && typeof source.savedAt === 'number'
    ));
  } catch {
    return [];
  }
}

function isHttpsSource(value: string) {
  return /^https:\/\//i.test(value.trim());
}

function inferEmbedDetails(url: string): EmbedDetails {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const markerIndex = segments.findIndex((segment) => segment === 'movie' || segment === 'tv');
    if (markerIndex < 0 || !segments[markerIndex + 1]) return {};
    const query = new URLSearchParams(parsed.search);
    return {
      sourceBase: `${parsed.origin}/${segments.slice(0, markerIndex).join('/')}`.replace(/\/$/, ''),
      tmdbId: decodeURIComponent(segments[markerIndex + 1]),
      season: query.get('s') || undefined,
      episode: query.get('e') || undefined,
    };
  } catch {
    return {};
  }
}

function useLibrary() {
  const [savedIds, setSavedIds] = useState<string[]>(readIds);
  const [sources, setSources] = useState<Record<string, string>>(readSources);
  const [savedSources, setSavedSources] = useState<SavedSource[]>(readSavedSources);
  const items = useMemo(() => catalog.map((item) => ({ ...item, sourceUrl: sources[item.id] || item.sourceUrl })), [sources]);
  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
      return next;
    });
  };
  const persistEmbed = (url: string, item?: CatalogItem, details: EmbedDetails = {}) => {
    const normalized = url.trim();
    const record: SavedSource = {
      id: details.savedId || `${item?.id || 'custom'}:${normalized}`,
      url: normalized,
      label: item?.title || details.label || 'Saved embed',
      mediaType: item?.type || 'Movie',
      catalogId: item?.id,
      sourceBase: details.sourceBase?.trim() || undefined,
      tmdbId: details.tmdbId?.trim() || undefined,
      season: details.season || undefined,
      episode: details.episode || undefined,
      savedAt: Date.now(),
    };
    setSavedSources((current) => {
      const next = [
        record,
        ...current.filter((source) => details.savedId
          ? source.id !== details.savedId
          : source.url !== normalized || source.catalogId !== item?.id),
      ].slice(0, 50);
      localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(next));
      return next;
    });
  };
  const removeSavedEmbed = (id: string) => {
    setSavedSources((current) => {
      const next = current.filter((source) => source.id !== id);
      localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(next));
      return next;
    });
  };
  const saveSource = (id: string, url: string, details: EmbedDetails = {}) => {
    setSources((current) => {
      const next = { ...current, [id]: url };
      localStorage.setItem(SOURCES_KEY, JSON.stringify(next));
      return next;
    });
    persistEmbed(url, catalog.find((item) => item.id === id), details);
  };
  const saveEmbed = (url: string, details: EmbedDetails = {}) => persistEmbed(url, undefined, details);
  return { items, savedIds, toggleSaved, saveSource, savedSources, saveEmbed, removeSavedEmbed };
}

function Brand() {
  return (
    <Link href="/" className="cv-brand" data-testid="link-brand">
      <span className="cv-logo-mark"><Clapperboard size={13} strokeWidth={2.3} /></span>
      <span className="cv-brand-name">BeastPlayer</span>
    </Link>
  );
}

function Topbar({ location }: { location: string }) {
  return (
    <header className="cv-topbar">
      <Brand />
      <nav className="cv-top-links" aria-label="Primary navigation">
        <a href="#console" data-testid="link-demo">Demo</a>
        <Link href="/watchlist" className={location === '/watchlist' ? 'active' : ''} data-testid="link-watchlist">Watchlist</Link>
      </nav>
    </header>
  );
}

function MobileNavigation({ location }: { location: string }) {
  return (
    <nav className="cv-mobile-nav" aria-label="Mobile navigation">
      <Link href="/" data-active={location === '/'} data-testid="mobile-link-browse"><HomeIcon size={17} /><span>Console</span></Link>
      <Link href="/watchlist" data-active={location === '/watchlist'} data-testid="mobile-link-watchlist"><Bookmark size={17} /><span>Saved</span></Link>
    </nav>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="cv-shell cv-noise">
      <main className="cv-main"><Topbar location={location} />{children}</main>
      <MobileNavigation location={location} />
    </div>
  );
}

function MovieCard({ item, saved, onToggle }: { item: CatalogItem; saved: boolean; onToggle: (id: string) => void }) {
  return (
    <article className="cv-card" data-testid={`card-title-${item.id}`}>
      <div className="cv-poster" style={{ '--poster-image': `url("${item.poster}")` } as CSSProperties}>
        <Link href={`/watch/${item.id}`} aria-label={`Open ${item.title}`} data-testid={`link-title-${item.id}`}>
          <div className="cv-poster-overlay"><span className="cv-play-circle"><Play size={16} fill="currentColor" /></span></div>
        </Link>
        <button className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border border-[hsl(var(--foreground)/.22)] bg-[hsl(var(--background)/.8)] text-[hsl(var(--foreground))]" onClick={() => onToggle(item.id)} aria-label={saved ? `Remove ${item.title} from watchlist` : `Save ${item.title} to watchlist`} data-testid={`button-watchlist-${item.id}`}>
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {item.progress > 0 && <div className="cv-progress" aria-label={`${item.progress}% watched`}><i style={{ width: `${item.progress}%` }} /></div>}
      </div>
      <div className="cv-card-info">
        <Link href={`/watch/${item.id}`} className="cv-card-title block hover:text-[hsl(var(--accent))]" data-testid={`text-title-${item.id}`}>{item.title}</Link>
        <div className="cv-card-meta"><span>{item.year}</span><span>·</span><span>{item.type}</span><span>·</span><span>TMDB {item.tmdbId}</span></div>
      </div>
    </article>
  );
}

function HomePage({ items, onSaveSource, savedSources, onSaveEmbed, onRemoveSavedEmbed }: { items: CatalogItem[]; onSaveSource: (id: string, url: string, details?: EmbedDetails) => void; savedSources: SavedSource[]; onSaveEmbed: (url: string, details?: EmbedDetails) => void; onRemoveSavedEmbed: (id: string) => void }) {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [activeId, setActiveId] = useState('');
  const [source, setSource] = useState('');
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('1');
  const [loadedSource, setLoadedSource] = useState('');
  const [loadedItemId, setLoadedItemId] = useState('');
  const [editingSavedId, setEditingSavedId] = useState('');
  const [titleQuery, setTitleQuery] = useState('');
  const [lookupType, setLookupType] = useState<TmdbLookupType>('all');
  const [lookupResults, setLookupResults] = useState<TmdbLookupResult[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [selectedLookup, setSelectedLookup] = useState<TmdbLookupResult | null>(null);
  const [loadedLookup, setLoadedLookup] = useState<TmdbLookupResult | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const activeItem = items.find((item) => item.id === activeId);
  const loadedItem = items.find((item) => item.id === loadedItemId);
  const selectedLabel = selectedLookup?.title || activeItem?.title;

  const chooseType = (nextType: 'movie' | 'tv') => {
    setMediaType(nextType);
    setActiveId('');
    setSource('');
    setLoadedSource('');
    setLoadedItemId('');
    setLoadedLookup(null);
    setEditingSavedId('');
    setSelectedLookup(null);
    setMessage('');
    setHasError(false);
  };

  const chooseLocal = (item: CatalogItem) => {
    const saved = savedSources.find((candidate) => candidate.catalogId === item.id);
    setActiveId(item.id);
    setSource(item.sourceUrl || saved?.url || '');
    setSeason(saved?.season || '1');
    setEpisode(saved?.episode || '1');
    setLoadedSource('');
    setLoadedItemId('');
    setLoadedLookup(null);
    setEditingSavedId(saved?.id || '');
    setSelectedLookup(null);
    setTitleQuery(item.title);
    setLookupResults([]);
    setMessage(`${item.title} is selected. TMDB ${item.tmdbId}.`);
    setHasError(false);
  };

  const chooseSaved = (saved: SavedSource) => {
    const catalogItem = saved.catalogId ? items.find((item) => item.id === saved.catalogId) : undefined;
    setMediaType(saved.mediaType === 'Series' ? 'tv' : 'movie');
    setActiveId(catalogItem?.id || '');
    setSource(saved.url);
    setSeason(saved.season || '1');
    setEpisode(saved.episode || '1');
    setLoadedSource(saved.url);
    setLoadedItemId(catalogItem?.id || '');
    setLoadedLookup(null);
    setEditingSavedId(saved.id);
    setSelectedLookup(null);
    setMessage(`${saved.label} source reopened.`);
    setHasError(false);
  };

  const searchTmdb = async (event: FormEvent) => {
    event.preventDefault();
    const query = titleQuery.trim();
    if (query.length < 2) {
      setLookupError('Enter at least two characters to search TMDB.');
      setLookupResults([]);
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    try {
      const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}&type=${lookupType}`);
      const payload = await response.json() as { results?: TmdbLookupResult[]; error?: string };
      if (!response.ok) throw new Error(payload.error || 'TMDB search failed.');
      setLookupResults(payload.results || []);
      if (!payload.results?.length) setLookupError('No TMDB matches found. Try a different title or ID.');
    } catch (error) {
      setLookupResults([]);
      setLookupError(error instanceof Error ? error.message : 'TMDB search failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  const clearLookup = () => {
    setTitleQuery('');
    setLookupResults([]);
    setLookupError('');
    setSelectedLookup(null);
    setCopiedId(null);
  };

  const selectLookup = (result: TmdbLookupResult) => {
    const catalogItem = items.find((item) => item.tmdbId === String(result.id) && (result.mediaType === 'movie' ? item.type === 'Movie' : item.type === 'Series'));
    if (catalogItem) {
      chooseLocal(catalogItem);
      return;
    }
    setSelectedLookup(result);
    setActiveId('');
    setMediaType(result.mediaType);
    setSource('');
    setSeason('1');
    setEpisode('1');
    setLoadedSource('');
    setLoadedItemId('');
    setLoadedLookup(null);
    setEditingSavedId('');
    setMessage(`${result.title} is selected. TMDB ${result.id}. Add an authorized source URL to play it.`);
    setHasError(false);
  };

  const copyTmdbId = async (id: number) => {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 1800);
    } catch {
      setLookupError('Copy was blocked by the browser. Select the ID manually.');
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = source.trim();
    if (trimmed && !isHttpsSource(trimmed)) {
      setMessage('Only HTTPS video or embed URLs are accepted.');
      setHasError(true);
      return;
    }
    if (!trimmed && !activeItem && !selectedLookup) {
      setMessage('Search for a title or paste an HTTPS source URL.');
      setHasError(true);
      return;
    }
    const inferred = inferEmbedDetails(trimmed);
    const details: EmbedDetails = {
      sourceBase: inferred.sourceBase,
      tmdbId: inferred.tmdbId,
      season: inferred.season || season,
      episode: inferred.episode || episode,
      label: selectedLabel,
      savedId: editingSavedId || undefined,
    };
    if (trimmed && activeItem) onSaveSource(activeItem.id, trimmed, details);
    if (trimmed && !activeItem) onSaveEmbed(trimmed, details);
    setLoadedSource(trimmed);
    setLoadedItemId(activeId);
    setLoadedLookup(selectedLookup);
    setMessage(trimmed ? 'Source loaded in the player.' : `${selectedLabel || 'Title'} is ready for a permitted source.`);
    setHasError(false);
  };

  return (
    <div className="cv-console" id="console">
      <section className="cv-console-hero" aria-labelledby="console-title">
        <div className="cv-console-orbit" aria-hidden="true"><span /><i /><b /></div>
        <p className="cv-console-kicker">Personal playback console</p>
        <h1 id="console-title">Your private cinema<br />is in motion.</h1>
        <p className="cv-console-copy">Save a permitted source once, give it a title, and return to the story whenever you want.</p>
        <a className="cv-scroll-cue" href="#source-controls" aria-label="Jump to source controls" data-testid="link-scroll-controls"><ChevronDown size={17} /></a>
      </section>

      <section className="cv-console-form" id="source-controls" aria-label="Player source controls">
        <form className="cv-control-strip" onSubmit={submit}>
          <select className="cv-control cv-type-select" value={mediaType} onChange={(event) => chooseType(event.target.value as 'movie' | 'tv')} aria-label="Media type" data-testid="select-media-type">
            <option value="movie">Movie</option>
            <option value="tv">TV</option>
          </select>
          <input className="cv-source-input" value={source} onChange={(event) => { setSource(event.target.value); setMessage(''); setHasError(false); }} placeholder="https://your-authorized-source.example/embed" aria-label="HTTPS video or embed source" type="url" data-testid="input-console-source" />
          <div className="cv-control cv-season-control" aria-label="Season and episode">
            <span>S</span><input value={season} onChange={(event) => setSeason(event.target.value)} aria-label="Season" inputMode="numeric" min="1" data-testid="input-season" />
            <span>E</span><input value={episode} onChange={(event) => setEpisode(event.target.value)} aria-label="Episode" inputMode="numeric" min="1" data-testid="input-episode" />
          </div>
          <button className="cv-load-button" type="submit" aria-label="Load player" data-testid="button-load-player"><Play size={15} fill="currentColor" /></button>
        </form>
        <div className="cv-console-hint" data-error={hasError} data-testid="status-console-source">{message || 'Paste an HTTPS source, or search for a title to see its TMDB ID.'}</div>
        <div className="cv-title-lookup" aria-label="Live TMDB lookup">
          <div className="cv-lookup-heading"><span><Search size={13} /> TMDB ID lookup</span><small>Live movie and show search</small></div>
          <form className="cv-lookup-form" onSubmit={searchTmdb}>
            <div className="cv-lookup-input-wrap">
              <Search size={15} aria-hidden="true" />
              <input value={titleQuery} onChange={(event) => setTitleQuery(event.target.value)} placeholder="Search by title or TMDB ID" aria-label="Search by title or TMDB ID" data-testid="input-title-lookup" />
            </div>
            <button className="cv-button cv-button-primary" type="submit" disabled={lookupLoading} data-testid="button-tmdb-search">{lookupLoading ? <LoaderCircle className="cv-spin-icon" size={14} /> : <Search size={14} />} Search</button>
            <button className="cv-button cv-button-ghost" type="button" onClick={clearLookup} data-testid="button-tmdb-clear">Clear</button>
          </form>
          <div className="cv-lookup-filters" role="tablist" aria-label="TMDB result type">
            {([['all', 'All'], ['movie', 'Movies'], ['tv', 'TV Series']] as const).map(([value, label]) => (
              <button className="cv-lookup-filter" key={value} type="button" role="tab" aria-selected={lookupType === value} data-active={lookupType === value} onClick={() => { setLookupType(value); setLookupResults([]); setLookupError(''); }} data-testid={`button-tmdb-filter-${value}`}>{label}</button>
            ))}
          </div>
          <p className="cv-lookup-note">Search TMDB by name or numeric ID, then copy the ID or use the title in your player.</p>
          {lookupError && <p className="cv-lookup-error" data-testid="status-tmdb-error">{lookupError}</p>}
          {lookupResults.length > 0 && (
            <div className="cv-lookup-results" aria-live="polite">
              {lookupResults.map((result) => (
                <article className="cv-lookup-result-card" key={`${result.mediaType}-${result.id}`}>
                  <div className="cv-lookup-poster">
                    {result.posterPath ? <img src={`https://image.tmdb.org/t/p/w185${result.posterPath}`} alt="" loading="lazy" /> : <Film size={18} />}
                  </div>
                  <div className="cv-lookup-result-content">
                    <div className="cv-lookup-result-kicker">{result.mediaType === 'tv' ? 'TV SERIES' : 'MOVIE'}{result.year ? ` · ${result.year}` : ''}</div>
                    <h3>{result.title}</h3>
                    <p>{result.overview || 'No overview available.'}</p>
                    <div className="cv-lookup-result-actions">
                      <strong>TMDB {result.id}</strong>
                      <button className="cv-inline-action" type="button" onClick={() => copyTmdbId(result.id)} data-testid={`button-copy-tmdb-${result.id}`}>{copiedId === result.id ? <Check size={13} /> : <Copy size={13} />} {copiedId === result.id ? 'Copied' : 'Copy ID'}</button>
                      <button className="cv-inline-action cv-inline-action-accent" type="button" onClick={() => selectLookup(result)} data-testid={`button-use-tmdb-${result.id}`}>Use in player</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        {savedSources.length > 0 && (
          <div className="cv-saved-sources" aria-label="Saved sources">
            <span className="cv-local-picker-label">Saved sources · {savedSources.length}</span>
            {savedSources.slice(0, 8).map((saved) => (
              <div className="cv-saved-source" key={saved.id}>
                <button className="cv-local-title" type="button" onClick={() => chooseSaved(saved)} data-testid={`button-reopen-source-${saved.id}`}>
                  <span>{saved.label}</span>
                  <small>{saved.mediaType}{saved.tmdbId ? ` · TMDB ${saved.tmdbId}` : ''}</small>
                </button>
                <button className="cv-saved-source-remove" type="button" onClick={() => onRemoveSavedEmbed(saved.id)} aria-label={`Remove saved source ${saved.label}`} data-testid={`button-remove-source-${saved.id}`}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="cv-player-console" data-testid="player-console">
          {loadedSource && isHttpsSource(loadedSource) ? (
            <iframe src={loadedSource} title={`${loadedItem?.title || loadedLookup?.title || 'BeastPlayer'} player`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen data-testid="iframe-console-player" />
          ) : (
            <div className="cv-player-empty">
              <Film size={23} />
              <h2>{loadedItem?.title || loadedLookup?.title ? `${loadedItem?.title || loadedLookup?.title} is ready` : 'Your player is ready'}</h2>
              <p>{loadedItem?.title || loadedLookup?.title ? 'Add an authorized HTTPS source above to open this title here.' : 'Search TMDB for a title or paste an authorized HTTPS video or embed URL above.'}</p>
            </div>
          )}
          <div className="cv-player-caption"><span>{loadedItem ? `LOCAL / ${loadedItem.type.toUpperCase()}` : loadedLookup ? `TMDB / ${loadedLookup.mediaType.toUpperCase()}` : 'NO SOURCE LOADED'}</span><span>{loadedSource ? 'USER-PROVIDED SOURCE' : 'WAITING FOR INPUT'}</span></div>
        </div>
        <p className="cv-permission-note" id="permission-note"><ShieldCheck size={12} className="mr-1 inline text-[hsl(var(--accent))]" /><strong>Permission note.</strong> Use only video or embed URLs you own or are authorized to view. BeastPlayer does not host, proxy, discover, or provide streams.</p>
      </section>
    </div>
  );
}

function WatchlistPage({ items, savedIds, onToggle }: { items: CatalogItem[]; savedIds: string[]; onToggle: (id: string) => void }) {
  const saved = items.filter((item) => savedIds.includes(item.id));
  return <div className="cv-content"><div className="cv-page-heading"><div className="cv-eyebrow">Your private collection</div><h1 className="cv-display">Watchlist</h1><p>Titles you want to make time for.</p></div>{saved.length ? <div className="cv-results-grid">{saved.map((item) => <MovieCard key={item.id} item={item} saved onToggle={onToggle} />)}</div> : <div className="cv-empty"><Bookmark size={25} /><h2>A shelf waiting for a story</h2><p>Save a title while browsing and it will live here, ready for the next quiet night in.</p><Link href="/" className="cv-button cv-button-primary" data-testid="button-browse-empty"><Compass size={15} /> Browse the console</Link></div>}</div>;
}

function SearchPage({ items, savedIds, onToggle }: { items: CatalogItem[]; savedIds: string[]; onToggle: (id: string) => void }) {
  const [location, setLocation] = useLocation();
  const query = new URLSearchParams(location.split('?')[1] || '').get('q') || '';
  const [input, setInput] = useState(query);
  const results = items.filter((item) => [item.title, item.imdbId, item.tmdbId, item.synopsis, ...item.genres].join(' ').toLowerCase().includes(query.toLowerCase()));
  return <div className="cv-content"><div className="cv-page-heading"><div className="cv-eyebrow">Private library</div><h1 className="cv-display">{query ? `“${query}”` : 'Find a title'}</h1><p>{query ? `${results.length} titles matched your search.` : 'Search the catalog by title, mood, or genre.'}</p></div><form className="cv-search-page-form" onSubmit={(event) => { event.preventDefault(); setLocation(input.trim() ? `/search?q=${encodeURIComponent(input.trim())}` : '/search'); }}><input className="cv-source-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Try mystery or series" data-testid="input-search-page" /><button className="cv-button cv-button-primary" type="submit" data-testid="button-submit-search"><Search size={15} /> Search</button></form>{results.length ? <div className="cv-results-grid">{results.map((item) => <MovieCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggle={onToggle} />)}</div> : <div className="cv-empty"><Search size={25} /><h2>No title found</h2><p>Try a broader title, genre, or another corner of the catalog.</p><button className="cv-button cv-button-ghost" onClick={() => { setInput(''); setLocation('/search'); }} data-testid="button-reset-search">Clear search</button></div>}</div>;
}

function WatchPage({ items, savedIds, onToggle, onSaveSource }: { items: CatalogItem[]; savedIds: string[]; onToggle: (id: string) => void; onSaveSource: (id: string, url: string) => void }) {
  const { id } = useParams<{ id: string }>();
  const item = items.find((candidate) => candidate.id === id);
  const [source, setSource] = useState(item?.sourceUrl || '');
  const [saved, setSaved] = useState(Boolean(item?.sourceUrl));
  const [error, setError] = useState('');
  useEffect(() => { setSource(item?.sourceUrl || ''); setSaved(Boolean(item?.sourceUrl)); setError(''); }, [item?.id, item?.sourceUrl]);
  if (!item) return <div className="cv-content"><div className="cv-empty mt-12"><Info size={25} /><h2>That title is missing</h2><p>This title isn't in your local archive.</p><Link href="/" className="cv-button cv-button-primary">Return to console</Link></div></div>;
  const submitSource = (event: FormEvent) => {
    event.preventDefault();
    if (!isHttpsSource(source)) { setError('Please enter an HTTPS URL you are authorized to use.'); return; }
    onSaveSource(item.id, source.trim());
    setSaved(true);
    setError('');
  };
  return <div className="cv-watch-layout"><div className="mb-5 flex items-center justify-between"><Link href="/" className="cv-watch-back" data-testid="link-back-browse">← Back to console</Link><span className="cv-mono text-[.58rem] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Now showing / {item.type}</span></div><div className="cv-player">{item.sourceUrl && isHttpsSource(item.sourceUrl) ? <iframe src={item.sourceUrl} title={`${item.title} player`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen data-testid="iframe-player" /> : <div className="cv-player-empty"><div><Film size={25} /><h2>{item.title} is ready</h2><p className="mt-2">Add a lawful HTTPS video or embed URL below to open this title in your private player.</p></div></div>}</div><div className="cv-detail"><div><div className="cv-eyebrow mb-4">{item.genres.join(' / ')}</div><h1 className="cv-display">{item.title}</h1><div className="mb-5 flex items-center gap-3 text-[.7rem] text-[hsl(var(--muted-foreground))]"><span>{item.year}</span><span>·</span><span>{item.duration}</span><span className="rounded border border-[hsl(var(--border))] px-1.5 py-0.5">{item.maturity}</span></div><a className="cv-imdb-link" href={`https://www.imdb.com/title/${item.imdbId}/`} target="_blank" rel="noreferrer">IMDb · {item.imdbId}</a><p className="cv-detail-copy">{item.synopsis}</p><div className="mt-6"><button className="cv-button cv-button-ghost" onClick={() => onToggle(item.id)} data-testid="button-toggle-detail-watchlist"><Bookmark size={15} fill={savedIds.includes(item.id) ? 'currentColor' : 'none'} /> {savedIds.includes(item.id) ? 'Saved to watchlist' : 'Save for later'}</button></div></div><aside className="cv-detail-side"><h3>Connect a source</h3><form onSubmit={submitSource}><label className="mb-2 block text-[.7rem] text-[hsl(var(--muted-foreground))]" htmlFor="source-url">Authorized video or embed URL</label><input id="source-url" className="cv-source-input" value={source} onChange={(event) => { setSource(event.target.value); setSaved(false); setError(''); }} placeholder="https://your-authorized-source.example" type="url" data-testid="input-source-url" />{error && <p className="cv-note text-[hsl(var(--destructive))]" data-testid="status-source-error">{error}</p>}<button className="cv-button cv-button-primary mt-3 w-full" type="submit" disabled={!source.trim()} data-testid="button-save-source">{saved ? <Check size={15} /> : <ExternalLink size={15} />} {saved ? 'Source saved' : 'Save source'}</button></form><p className="cv-note"><ShieldCheck size={12} className="mr-1 inline text-[hsl(var(--accent))]" /> Only use URLs you own or have permission to embed. BeastPlayer does not host, proxy, or provide streams.</p></aside></div></div>;
}

function Router() {
  const library = useLibrary();
  return <Shell><Switch><Route path="/watch/:id"><WatchPage items={library.items} savedIds={library.savedIds} onToggle={library.toggleSaved} onSaveSource={library.saveSource} /></Route><Route path="/watchlist"><WatchlistPage items={library.items} savedIds={library.savedIds} onToggle={library.toggleSaved} /></Route><Route path="/search"><SearchPage items={library.items} savedIds={library.savedIds} onToggle={library.toggleSaved} /></Route><Route path="/"><HomePage items={library.items} onSaveSource={library.saveSource} savedSources={library.savedSources} onSaveEmbed={library.saveEmbed} onRemoveSavedEmbed={library.removeSavedEmbed} /></Route><Route><div className="cv-content"><div className="cv-empty mt-12"><Info size={25} /><h2>Page not found</h2><p>The archive has no record of this address.</p><Link href="/" className="cv-button cv-button-primary">Return to console</Link></div></div></Route></Switch></Shell>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter>;
}

export default App;