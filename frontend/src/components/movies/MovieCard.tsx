import type { CSSProperties } from "react";
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

const PRICE_FORMATTER = new Intl.NumberFormat("ru-RU");

const formatPrice = (price: number, compact?: boolean): string =>
  compact
    ? `${PRICE_FORMATTER.format(price)}₽`
    : `${PRICE_FORMATTER.format(price)}\u00A0₽`;

const hallLabel = (performance: Performance): string => {
  const rawHallName = (performance.hall_name || "").replace(/\s+/g, " ").trim();

  if (!rawHallName) return "Зал не указан";
  if (/^\d+$/.test(rawHallName)) return `Зал ${rawHallName}`;
  return rawHallName;
};

const SessionButton = ({
  performance,
  compact,
}: {
  performance: Performance;
  compact?: boolean;
}) => {
  const performanceId = getPerformanceId(performance);
  const timeLabel = format(toDate(performance.time), "HH:mm");
  const hall = hallLabel(performance);
  const priceLabel = formatPrice(performance.price, compact);
  const needsHallTicker = hall.length > (compact ? 10 : 16);
  const hallTickerStyle = needsHallTicker
    ? ({
      "--hall-marquee-duration": `${Math.max(7, hall.length * 0.45)}s`,
    } as CSSProperties)
    : undefined;

  if (!performanceId) return null;

  return (
    <Link
      aria-label={`Сеанс ${timeLabel}, ${hall}, ${priceLabel}`}
      className={`group/session relative flex min-w-0 flex-col rounded-lg transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/45 hover:shadow-[0_14px_26px_-20px_rgba(255,110,66,0.68)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/55 ${compact ? "min-h-[54px] gap-0.5 p-1" : "min-h-[60px] gap-0.5 p-1.5"
        }`}
      title={`${timeLabel} · ${hall} · ${priceLabel}`}
      to={`/performance/${performanceId}`}
    >
      <div
        className={`relative z-10 flex flex-col items-center justify-center overflow-hidden rounded-[8px] border border-black/15 bg-white/55 text-center transition-[border-color,background-color,box-shadow] duration-300 group-hover/session:border-[var(--accent)]/35 group-hover/session:bg-[var(--accent-soft)] group-hover/session:shadow-[0_10px_18px_-16px_rgba(255,110,66,0.65)] dark:border-white/15 dark:bg-white/[0.08] dark:group-hover/session:bg-[rgba(255,110,66,0.16)] ${compact ? "h-[34px] px-1.5 py-0.5" : "h-[40px] px-2 py-1"
          }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#ff4f1f] via-[#ff7a2f] to-[#f0a640] opacity-75 transition-opacity duration-300 group-hover/session:opacity-100"
        />
        <span
          className={`type-numeric relative z-10 font-black leading-none tracking-[0.014em] text-[var(--text-primary)] transition-colors duration-300 group-hover/session:text-[var(--accent-strong)] dark:text-white dark:group-hover/session:text-[#ffb499] ${compact ? "text-[11px]" : "text-[13px]"
            }`}
        >
          {timeLabel}
        </span>
        <span
          className={`type-numeric relative z-10 mt-0.5 whitespace-nowrap font-bold leading-none text-[var(--accent-strong)] transition-colors duration-300 group-hover/session:text-[var(--accent-strong)] dark:group-hover/session:text-[#ffb499] ${compact ? "text-[8px]" : "text-[9px]"
            }`}
        >
          {priceLabel}
        </span>
      </div>

      <div
        className={`relative z-10 overflow-hidden px-0.5 text-center leading-[1.1] text-[var(--text-muted)] transition-colors duration-300 group-hover/session:text-[var(--text-primary)] dark:text-white/75 dark:group-hover/session:text-white ${compact ? "text-[8px]" : "text-[9px]"
          }`}
        style={hallTickerStyle}
        title={hall}
      >
        {needsHallTicker ? (
          <span className="hall-marquee">
            <span className="hall-marquee-track">
              <span>{hall}</span>
              <span aria-hidden>{hall}</span>
            </span>
          </span>
        ) : (
          <span className="block truncate">{hall}</span>
        )}
      </div>
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
      <article className="group cinema-card flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-[0_26px_50px_-34px_rgba(255,110,66,0.65)]">
        <Link
          className="relative z-10 block aspect-[3/4] overflow-hidden"
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

        <div className="relative z-10 flex flex-1 flex-col gap-3 p-4">
          <div className="type-meta flex items-center justify-between text-[11px] tracking-[0.06em] text-[var(--text-muted)]">
            <span>{movie.duration} мин</span>
            <span>{movie.country || "Страна не указана"}</span>
          </div>

          {sortedPerformances.length === 0 ? (
            <div className="cinema-card-soft rounded-2xl border-dashed px-3 py-4 text-center text-sm text-[var(--text-muted)]">
              На выбранную дату сеансов нет
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1.5">
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
    <article className="cinema-card p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <Link
          className="group relative z-10 block w-[108px] shrink-0 overflow-hidden rounded-2xl sm:w-[124px]"
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

        <div className="relative z-10 min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="type-meta rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] tracking-[0.08em] text-[var(--accent-strong)]">
              {getPrimaryGenre(movie.genres)}
            </span>
            <span className="type-meta rounded-full border border-black/15 bg-white/45 px-2 py-0.5 text-[10px] tracking-[0.08em] text-[var(--text-muted)] dark:border-white/15 dark:bg-white/[0.08]">
              {movie.duration} мин
            </span>
            <span className="type-meta rounded-full border border-black/15 bg-white/45 px-2 py-0.5 text-[10px] tracking-[0.08em] text-[var(--text-muted)] dark:border-white/15 dark:bg-white/[0.08]">
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
        <div className="cinema-card-soft relative z-10 mt-4 rounded-2xl border-dashed px-3 py-4 text-sm text-[var(--text-muted)]">
          Нет доступных сеансов на выбранную дату
        </div>
      ) : (
        <div className="relative z-10 mt-3 grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-1.5">
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
