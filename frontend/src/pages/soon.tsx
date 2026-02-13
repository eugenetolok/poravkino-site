import { Link } from "react-router-dom";
import { addDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@heroui/button";

import DefaultLayout from "@/layouts/default";

interface SoonMovie {
  title: string;
  genre: string;
  releaseDate: Date;
  note: string;
}

const UPCOMING_MOVIES: SoonMovie[] = [
  {
    title: "Линия горизонта",
    genre: "триллер",
    releaseDate: addDays(new Date(), 6),
    note: "Премьера недели с вечерними сеансами в большом зале.",
  },
  {
    title: "Город ветров",
    genre: "драма",
    releaseDate: addDays(new Date(), 12),
    note: "Фильм-участник фестивалей, показы в оригинале с субтитрами.",
  },
  {
    title: "Космический рейс",
    genre: "фантастика",
    releaseDate: addDays(new Date(), 18),
    note: "Семейный релиз в формате 2D и 3D.",
  },
  {
    title: "Миссия: Предел",
    genre: "боевик",
    releaseDate: addDays(new Date(), 25),
    note: "Ночные премьерные сеансы в выходные.",
  },
];

export default function SoonPage() {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 pb-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <p className="type-eyebrow text-[var(--text-muted)]">Анонсы</p>
          <h1 className="type-display mt-3 text-3xl md:text-4xl">
            Скоро в кино
          </h1>
          <p className="type-body mt-3 max-w-3xl text-[var(--text-muted)]">
            Подборка ближайших премьер. Актуальные сеансы появятся в афише
            сразу после открытия предпродажи.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button as={Link} className="bg-[var(--accent)] text-white" to="/">
              Перейти в афишу
            </Button>
            <Button
              as="a"
              className="border border-black/10 dark:border-white/15"
              href="/contacts"
              variant="flat"
            >
              Уточнить по контактам
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {UPCOMING_MOVIES.map((movie) => (
            <article
              key={movie.title}
              className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_20px_45px_-32px_rgba(0,0,0,0.45)] dark:border-white/10 dark:bg-[#121925]/80"
            >
              <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
                {movie.genre}
              </p>
              <h2 className="type-section mt-2 text-[1.25rem]">{movie.title}</h2>
              <p className="type-label mt-4 text-[var(--accent-strong)]">
                С {format(movie.releaseDate, "d MMMM", { locale: ru })}
              </p>
              <p className="type-body mt-3 text-sm text-[var(--text-muted)]">
                {movie.note}
              </p>
            </article>
          ))}
        </section>
      </div>
    </DefaultLayout>
  );
}
