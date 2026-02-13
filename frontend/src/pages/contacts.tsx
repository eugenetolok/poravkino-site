import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import DefaultLayout from "@/layouts/default";
import { apiClient } from "@/utils/apiClient";

interface CinemaContacts {
  cinemaName?: string;
  cityName?: string;
  address?: string;
  support?: string;
  emailName?: string;
  workUrl?: string;
  mapUrl?: string;
  vk?: string;
  telegram?: string;
  contactPerson?: string;
  contactPersonJob?: string;
  contactPersonConnection?: string;
}

const normalizeUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  return `https://${url}`;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<CinemaContacts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<CinemaContacts>("/api/cinema")
      .then((data) => {
        if (!isMounted) return;
        setContacts(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setContacts(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Spinner label="Загрузка контактов" size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 pb-12">
        <section className="cinema-card p-6 md:p-8">
          <p className="type-eyebrow text-[var(--text-muted)]">Связь</p>
          <h1 className="type-display mt-3 text-3xl md:text-4xl">Контакты</h1>
          <p className="type-body mt-3 max-w-3xl text-[var(--text-muted)]">
            {contacts?.cinemaName || "Кинотеатр"}{" "}
            {contacts?.cityName ? `• ${contacts.cityName}` : ""}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="cinema-card p-5">
            <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
              Адрес
            </p>
            <p className="type-title mt-2 text-lg">
              {contacts?.address || "Адрес временно недоступен"}
            </p>
            {contacts?.mapUrl && (
              <Button
                as="a"
                className="cinema-card-soft mt-4 text-[var(--text-primary)]"
                href={normalizeUrl(contacts.mapUrl)}
                rel="noreferrer"
                target="_blank"
                variant="flat"
              >
                Открыть на карте
              </Button>
            )}
          </article>

          <article className="cinema-card p-5">
            <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
              Поддержка
            </p>
            <p className="type-title mt-2 text-lg">
              {contacts?.support || "Контакт поддержки не указан"}
            </p>
            {contacts?.emailName && (
              <p className="type-body mt-2 text-[var(--text-muted)]">
                Email: {contacts.emailName}
              </p>
            )}
            {contacts?.workUrl && (
              <Button
                as="a"
                className="mt-4 bg-[var(--accent)] text-white"
                href={normalizeUrl(contacts.workUrl)}
                rel="noreferrer"
                target="_blank"
              >
                Перейти на сайт
              </Button>
            )}
          </article>

          <article className="cinema-card p-5">
            <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
              Соцсети
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {contacts?.vk && (
                <Button
                  as="a"
                  className="cinema-card-soft text-[var(--text-primary)]"
                  href={normalizeUrl(contacts.vk)}
                  rel="noreferrer"
                  target="_blank"
                  variant="flat"
                >
                  VK
                </Button>
              )}
              {contacts?.telegram && (
                <Button
                  as="a"
                  className="cinema-card-soft text-[var(--text-primary)]"
                  href={normalizeUrl(contacts.telegram)}
                  rel="noreferrer"
                  target="_blank"
                  variant="flat"
                >
                  Telegram
                </Button>
              )}
              {!contacts?.vk && !contacts?.telegram && (
                <p className="type-body text-[var(--text-muted)]">
                  Ссылки пока не добавлены.
                </p>
              )}
            </div>
          </article>

          <article className="cinema-card p-5">
            <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
              Контактное лицо
            </p>
            <p className="type-title mt-2 text-lg">
              {contacts?.contactPerson || "Не указано"}
            </p>
            {contacts?.contactPersonJob && (
              <p className="type-body mt-2 text-[var(--text-muted)]">
                {contacts.contactPersonJob}
              </p>
            )}
            {contacts?.contactPersonConnection && (
              <p className="type-body mt-1 text-[var(--text-muted)]">
                {contacts.contactPersonConnection}
              </p>
            )}
          </article>
        </section>
      </div>
    </DefaultLayout>
  );
}
