
import { TMDBResponse, Movie, TVShow, Person, ContentDetails, MediaType, PersonDetails } from '../types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Normaliza y extrae el ID de YouTube desde distintas formas (key, url completa, etc)
 */
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const s = input.trim();

  // Si ya es solo el ID (11 caracteres alfanum), devolverlo directamente
  // YouTube IDs tienen exactamente 11 caracteres
  const maybeId = s.match(/^[A-Za-z0-9_-]{11}$/);
  if (maybeId) return maybeId[0];

  // Intentar extraer de distintas formas de URL
  // 1) youtu.be/ID
  let m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (m && m[1]) return m[1];

  // 2) youtube.com/watch?v=ID
  m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (m && m[1]) return m[1];

  // 3) youtube.com/embed/ID
  m = s.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (m && m[1]) return m[1];

  // 4) Caso general para strings que contienen el ID entre otros caracteres (como parámetros ?si=)
  m = s.match(/([A-Za-z0-9_-]{11})/);
  if (m && m[1]) return m[1];

  return null;
}

export class TMDBService {
  private apiKey: string;
  private language: string = 'es-ES';
  private region: string = 'ES';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetcher<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      language: this.language,
      region: this.region,
      ...params,
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
    
    if (response.status === 401) {
      throw new Error('API Key inválida o expirada.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.status_message || 'Error al conectar con TMDB.');
    }

    return response.json();
  }

  getPosterUrl(path: string | null, size: 'w342' | 'w500' | 'original' = 'w500') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
  }

  getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : 'https://via.placeholder.com/1280x720?text=No+Image';
  }

  async getTrending(type: MediaType | 'all' = 'all', timeWindow: 'day' | 'week' = 'day'): Promise<TMDBResponse<any>> {
    return this.fetcher(`/trending/${type}/${timeWindow}`);
  }

  async getMovies(category: 'popular' | 'top_rated' | 'upcoming' | 'now_playing'): Promise<TMDBResponse<Movie>> {
    return this.fetcher(`/movie/${category}`);
  }

  async getTVShows(category: 'popular' | 'top_rated' | 'on_the_air' | 'airing_today'): Promise<TMDBResponse<TVShow>> {
    return this.fetcher(`/tv/${category}`);
  }

  async getDetails(type: 'movie' | 'tv', id: number): Promise<ContentDetails> {
    const data: ContentDetails = await this.fetcher(`/${type}/${id}`, {
      append_to_response: 'videos,credits,recommendations,watch/providers'
    });
    
    // Normalizar las keys de los videos de YouTube
    if (data.videos && data.videos.results) {
      data.videos.results = data.videos.results.map(v => {
        if (v.site.toLowerCase() === 'youtube') {
          const cleanKey = extractYouTubeId(v.key);
          return { ...v, key: cleanKey || v.key };
        }
        return v;
      });
    }

    return data;
  }

  async getPersonDetails(id: number): Promise<PersonDetails> {
    return this.fetcher(`/person/${id}`, {
      append_to_response: 'combined_credits,images'
    });
  }

  async search(query: string, page: number = 1): Promise<TMDBResponse<any>> {
    return this.fetcher('/search/multi', { query, page: page.toString() });
  }

  async searchPerson(query: string): Promise<TMDBResponse<Person>> {
    return this.fetcher('/search/person', { query });
  }

  async discover(type: 'movie' | 'tv', filters: Record<string, string>): Promise<TMDBResponse<any>> {
    const processedFilters = { ...filters };
    if (type === 'tv' && processedFilters.primary_release_year) {
      processedFilters.first_air_date_year = processedFilters.primary_release_year;
      delete processedFilters.primary_release_year;
    }
    return this.fetcher(`/discover/${type}`, processedFilters);
  }

  async getGenres(type: 'movie' | 'tv'): Promise<{ genres: { id: number; name: string }[] }> {
    return this.fetcher(`/genre/${type}/list`);
  }
}
