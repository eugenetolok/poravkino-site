import { format } from "date-fns";
import { Link } from "react-router-dom";

import { Movie, Performance } from "@/types";
import { getImageUrl } from "@/utils/apiClient";

interface MovieCardProps {
  movie: Movie;
  viewMode?: "list" | "grid";
}

const FALLBACK_POSTER = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#151515"/><stop offset="100%" stop-color="#2f2f2f"/></linearGradient></defs><rect width="600" height="900" fill="url(#g)"/><circle cx="510" cy="110" r="130" fill="#ff5d2e" fill-opacity="0.35"/><text x="50%" y="48%" text-anchor="middle" fill="#f6f6f6" font-size="56" font-family="Arial, sans-serif" font-weight="700">ПОРА В КИНО</text><text x="50%" y="54%" text-anchor="middle" fill="#b7b7b7" font-size="24" font-family="Arial, sans-serif">Постер скоро появится</text></svg>`,
)}`;

const getPrimaryGenre = (genres?: string) => {
  if (!genres) return "Без жанра";

  const first = genres
    .split(",")
    .map((genre) => genre.trim())
    .find(Boolean);

  return first || "Без жанра";
};

const toDate = (value: string) => new Date(value);

const getPerformanceId = (performance: Performance): number =>
  performance.id || performance.performance_id || 0;

const hallLabel = (performance: Performance): string => {
  if (!performance.hall_name) return "Зал";

  return `Зал ${performance.hall_name}`;
};

const SessionButton = ({
  performance,
  compact,
}: {
  performance: Performance;
  compact?: boolean;
}) => {
  const performanceId = getPerformanceId(performance);

  if (!performanceId) return null;

  return (
    <Link
      className={`group rounded-xl border border-black/10 bg-black/[0.03] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] dark:border-white/10 dark:bg-white/[0.04] ${
        compact ? "min-h-[56px] px-2 py-1.5" : "min-h-[62px] px-2.5 py-2"
      }`}
      to={`/performance/${performanceId}`}
    >
      <span
        className={`type-numeric block font-black leading-none ${compact ? "text-[15px]" : "text-base"}`}
      >
        {format(toDate(performance.time), "HH:mm")}
      </span>
      <span className="type-meta mt-0.5 block truncate text-[9px] tracking-[0.08em] text-[var(--text-muted)]">
        {hallLabel(performance)}
      </span>
      <span
        className={`type-numeric mt-0.5 block font-bold text-[var(--accent-strong)] ${compact ? "text-[11px]" : "text-[13px]"}`}
      >
        {performance.price} ₽
      </span>
    </Link>
  );
};

export const MovieCard = ({ movie, viewMode = "grid" }: MovieCardProps) => {
  const posterSrc = getImageUrl(movie.poster) || FALLBACK_POSTER;
  const sortedPerformances = [...(movie.performances || [])].sort(
    (a, b) => toDate(a.time).getTime() - toDate(b.time).getTime(),
  );

  if (viewMode === "grid") {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/85 shadow-[0_16px_50px_-28px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/30 hover:shadow-[0_28px_60px_-28px_rgba(226,57,0,0.45)] dark:border-white/10 dark:bg-[#121925]/85">
        <Link
          className="relative block aspect-[3/4] overflow-hidden"
          to={`/movie/${movie.id}`}
        >
          <img
            alt={movie.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            src={posterSrc}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
            {movie.age}+
          </div>
          {movie.is_pushkin && (
            <div className="absolute right-3 top-3 rounded-full bg-amber-300/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
              Пушкинская
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="type-meta text-[10px] tracking-[0.1em] text-white/85">
              {getPrimaryGenre(movie.genres)}
            </p>
            <h3 className="type-section line-clamp-2 text-[1.3rem] text-white">
              {movie.name}
            </h3>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="type-meta flex items-center justify-between text-[11px] tracking-[0.06em] text-[var(--text-muted)]">
            <span>{movie.duration} мин</span>
            <span>{movie.country || "Страна не указана"}</span>
          </div>

          {sortedPerformances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 px-3 py-4 text-center text-sm text-[var(--text-muted)] dark:border-white/15">
              На выбранную дату сеансов нет
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {sortedPerformances.map((performance) => (
                <SessionButton
                  key={getPerformanceId(performance) || performance.time}
                  compact
                  performance={performance}
                />
              ))}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-black/10 bg-white/90 p-3 shadow-[0_20px_60px_-32px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-[#121925]/88 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <Link
          className="group relative block w-[108px] shrink-0 overflow-hidden rounded-2xl sm:w-[124px]"
          to={`/movie/${movie.id}`}
        >
          <div className="aspect-[2/3]">
            <img
              alt={movie.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              src={posterSrc}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="type-meta rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] tracking-[0.08em] text-[var(--accent-strong)]">
              {getPrimaryGenre(movie.genres)}
            </span>
            <span className="type-meta rounded-full border border-black/10 px-2 py-0.5 text-[10px] tracking-[0.08em] text-[var(--text-muted)] dark:border-white/10">
              {movie.duration} мин
            </span>
            <span className="type-meta rounded-full border border-black/10 px-2 py-0.5 text-[10px] tracking-[0.08em] text-[var(--text-muted)] dark:border-white/10">
              {movie.age}+
            </span>
          </div>

          <Link className="hover:opacity-85" to={`/movie/${movie.id}`}>
            <h3 className="type-section line-clamp-2 text-[1.24rem] text-[var(--text-primary)] sm:text-[1.38rem]">
              {movie.name}
            </h3>
          </Link>

          <p className="type-body mt-2 line-clamp-2 text-[var(--text-muted)] sm:text-sm">
            {movie.description || "Описание скоро появится"}
          </p>
        </div>
      </div>

      {sortedPerformances.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-black/10 px-3 py-4 text-sm text-[var(--text-muted)] dark:border-white/15">
          Нет доступных сеансов на выбранную дату
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sortedPerformances.map((performance) => (
            <SessionButton
              key={getPerformanceId(performance) || performance.time}
              performance={performance}
            />
          ))}
        </div>
      )}
    </article>
  );
};
