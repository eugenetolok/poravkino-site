import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import DefaultLayout from "@/layouts/default";
import { Calendar } from "@/components/calendar/calendar";
import { Movie } from "@/types";
import { apiClient, getImageUrl } from "@/utils/apiClient";

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 900'%3E%3Crect width='600' height='900' fill='%23181818'/%3E%3Ctext x='50%25' y='48%25' text-anchor='middle' fill='%23f6f6f6' font-size='52' font-family='Arial' font-weight='700'%3EПОРА В КИНО%3C/text%3E%3C/svg%3E";

const sectionOrder = [
  { id: "about", label: "О фильме" },
  { id: "crew", label: "Команда" },
  { id: "sessions", label: "Сеансы" },
];

export default function MoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    setLoading(true);
    setError(null);

    apiClient
      .get<Movie>(`/api/movies/${id}?date=${date}`)
      .then((data) => {
        if (!isMounted) return;
        setMovie(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setMovie(null);
        setError("Фильм не найден или временно недоступен.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [date, id]);

  const sortedPerformances = useMemo(
    () =>
      [...(movie?.performances || [])].sort(
        (a, b) => +new Date(a.time) - +new Date(b.time),
      ),
    [movie?.performances],
  );

  const posterSrc = getImageUrl(movie?.poster || "") || FALLBACK_POSTER;
  const backdropSrc = getImageUrl(movie?.backdrop || "") || posterSrc;

  const primaryGenres = useMemo(
    () =>
      (movie?.genres || "")
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean),
    [movie?.genres],
  );

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);

    if (!element) return;

    const offset = 110;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: "smooth" });
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <Spinner label="Загрузка фильма" size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (!movie || error) {
    return (
      <DefaultLayout>
        <section className="mx-auto flex h-[60vh] max-w-xl flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-black/15 bg-white/60 px-8 text-center dark:border-white/15 dark:bg-white/[0.03]">
          <h1 className="type-section text-2xl">Фильм недоступен</h1>
          <p className="type-body text-[var(--text-muted)]">
            {error || "Проверьте ссылку или вернитесь в расписание."}
          </p>
          <Button
            className="bg-[var(--accent)]"
            color="primary"
            onPress={() => navigate("/")}
          >
            Вернуться в афишу
          </Button>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 pb-12">
        <section className="relative overflow-hidden rounded-[32px] border border-black/10 bg-black text-white shadow-[0_28px_80px_-35px_rgba(0,0,0,0.75)] dark:border-white/10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropSrc})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          <div className="relative z-10 p-5 md:p-8 lg:p-10">
            <div className="type-meta mb-5 flex flex-wrap items-center gap-3 text-[11px] tracking-[0.11em] text-white/75">
              <Button
                className="bg-white/10 text-white"
                radius="full"
                size="sm"
                variant="flat"
                onPress={() => navigate(-1)}
              >
                Назад
              </Button>
              <Link className="transition-colors hover:text-white" to="/">
                Афиша
              </Link>
              <span>•</span>
              <span className="text-white">{movie.name}</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-end">
              <img
                alt={movie.name}
                className="hidden aspect-[2/3] w-[240px] rounded-2xl border border-white/20 object-cover shadow-2xl lg:block"
                src={posterSrc}
              />

              <div>
                <h1 className="type-display mb-4 text-3xl uppercase md:text-5xl">
                  {movie.name}
                </h1>

                <div className="mb-4 flex flex-wrap gap-2">
                  {primaryGenres.map((genre) => (
                    <span
                      key={genre}
                      className="type-meta rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] tracking-[0.08em]"
                    >
                      {genre}
                    </span>
                  ))}
                  <span className="type-meta rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] tracking-[0.08em]">
                    {movie.age}+
                  </span>
                  <span className="type-meta rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] tracking-[0.08em]">
                    {movie.duration} мин
                  </span>
                </div>

                <p className="type-body max-w-3xl text-white/80">
                  {movie.description || "Описание скоро будет опубликовано."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {sectionOrder.map((section) => (
                    <Button
                      key={section.id}
                      className="border border-white/20 bg-white/10 text-white"
                      radius="full"
                      size="sm"
                      variant="flat"
                      onPress={() => scrollToSection(section.id)}
                    >
                      {section.label}
                    </Button>
                  ))}
                  {movie.youtube && (
                    <Button
                      as="a"
                      className="bg-[var(--accent)] text-white"
                      href={`https://youtu.be/${movie.youtube}`}
                      radius="full"
                      rel="noreferrer"
                      size="sm"
                      target="_blank"
                    >
                      Трейлер
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <article
              className="rounded-3xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-[#121925]/75"
              id="about"
            >
              <h2 className="type-section mb-3">О фильме</h2>
              <p className="type-body text-[var(--text-muted)]">
                {movie.description || "Описание пока недоступно."}
              </p>
            </article>

            <article
              className="rounded-3xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-[#121925]/75"
              id="crew"
            >
              <h2 className="type-section mb-4">Съёмочная группа</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="type-meta text-[11px] tracking-[0.1em] text-[var(--text-muted)]">
                    Режиссёр
                  </p>
                  <p className="type-title pt-1 text-base">
                    {movie.director || "Нет данных"}
                  </p>
                </div>
                <div>
                  <p className="type-meta text-[11px] tracking-[0.1em] text-[var(--text-muted)]">
                    Актёры
                  </p>
                  <p className="type-body pt-1 md:text-base">
                    {movie.actors || "Нет данных"}
                  </p>
                </div>
                <div>
                  <p className="type-meta text-[11px] tracking-[0.1em] text-[var(--text-muted)]">
                    Страна
                  </p>
                  <p className="type-title pt-1 text-base">
                    {movie.country || "Нет данных"}
                  </p>
                </div>
                <div>
                  <p className="type-meta text-[11px] tracking-[0.1em] text-[var(--text-muted)]">
                    Длительность
                  </p>
                  <p className="type-title pt-1 text-base">
                    {movie.duration} минут
                  </p>
                </div>
              </div>
            </article>

            <article
              className="rounded-3xl border border-black/10 bg-white/80 p-6 dark:border-white/10 dark:bg-[#121925]/75"
              id="sessions"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="type-section">Сеансы</h2>
                <p className="type-meta text-[11px] tracking-[0.1em] text-[var(--text-muted)]">
                  {format(new Date(date), "d MMMM, EEEE", { locale: ru })}
                </p>
              </div>

              {sortedPerformances.length === 0 ? (
                <div className="type-body rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-[var(--text-muted)] dark:border-white/15">
                  На выбранную дату сеансов нет
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedPerformances.map((performance) => {
                    const performanceId =
                      performance.id || performance.performance_id;

                    return (
                      <Link
                        key={performanceId}
                        className="group rounded-2xl border border-black/10 bg-black/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] dark:border-white/10 dark:bg-white/[0.03]"
                        to={`/performance/${performanceId}`}
                      >
                        <p className="type-numeric text-2xl font-black leading-none">
                          {format(new Date(performance.time), "HH:mm")}
                        </p>
                        <p className="type-meta pt-2 text-[11px] tracking-[0.08em] text-[var(--text-muted)]">
                          Зал {performance.hall_name}
                        </p>
                        <p className="type-numeric pt-3 text-lg font-bold text-[var(--accent-strong)]">
                          {performance.price} ₽
                        </p>
                        <p className="type-label pt-3 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]">
                          Выбрать места
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </article>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <section className="glass-panel rounded-3xl p-3">
              <p className="type-eyebrow px-2 pb-2 text-[var(--text-muted)]">
                Выберите дату
              </p>
              <Calendar initialDate={date} onDateChange={setDate} />
            </section>

            <section className="rounded-3xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-[#121925]/75">
              <p className="type-eyebrow text-[var(--text-muted)]">
                Быстрая навигация
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {sectionOrder.map((section) => (
                  <Button
                    key={section.id}
                    className="justify-start"
                    radius="lg"
                    variant="flat"
                    onPress={() => scrollToSection(section.id)}
                  >
                    {section.label}
                  </Button>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </DefaultLayout>
  );
}
