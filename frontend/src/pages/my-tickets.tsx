import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import DefaultLayout from "@/layouts/default";
import { apiClient } from "@/utils/apiClient";

interface Ticket {
  row: string;
  seat: string;
  price: number;
  external_code: string;
}

interface SaleLookupResponse {
  secret: string;
  email: string;
  amount: number;
  performance: {
    hall_name: string;
    time: string;
    movie?: {
      name?: string;
    };
  };
  tickets: Ticket[];
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value || 0);

const formatPerformanceDate = (rawDate?: string) => {
  if (!rawDate) return "Дата не указана";

  const parsed = new Date(rawDate);

  if (Number.isNaN(parsed.getTime())) return "Дата не указана";

  return format(parsed, "d MMMM yyyy, HH:mm", { locale: ru });
};

export default function MyTicketsPage() {
  const [searchParams] = useSearchParams();
  const initialSecret = useMemo(
    () => searchParams.get("secret")?.trim() || "",
    [searchParams],
  );

  const [secret, setSecret] = useState(initialSecret);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sale, setSale] = useState<SaleLookupResponse | null>(null);

  const lookupSale = async (secretValue: string) => {
    if (!secretValue.trim()) {
      setError("Введите код заказа из письма");
      setSale(null);

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<SaleLookupResponse>(
        `/api/sales/code?secret=${encodeURIComponent(secretValue.trim())}`,
      );

      setSale(response);
    } catch {
      setSale(null);
      setError("Заказ не найден. Проверьте код и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    lookupSale(secret);
  };

  useEffect(() => {
    if (!initialSecret) return;
    lookupSale(initialSecret);
  }, [initialSecret]);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 pb-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <p className="type-eyebrow text-[var(--text-muted)]">Заказы</p>
          <h1 className="type-display mt-3 text-3xl md:text-4xl">Мои билеты</h1>
          <p className="type-body mt-3 max-w-3xl text-[var(--text-muted)]">
            Введите код заказа (secret) из письма после оплаты, чтобы увидеть
            билеты и детали сеанса.
          </p>

          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <Input
              className="max-w-xl"
              classNames={{
                inputWrapper:
                  "border border-black/10 bg-white/80 data-[hover=true]:border-black/20 group-data-[focus=true]:border-[var(--accent)] dark:border-white/10 dark:bg-white/[0.05]",
                input: "text-[var(--text-primary)]",
              }}
              placeholder="Например: 5f2a8c..."
              value={secret}
              variant="faded"
              onValueChange={setSecret}
            />
            <Button
              className="bg-[var(--accent)] text-white sm:min-w-[160px]"
              isLoading={loading}
              type="submit"
            >
              Найти заказ
            </Button>
          </form>

          {error && <p className="type-body mt-3 text-sm text-red-500">{error}</p>}
        </section>

        {sale && (
          <section className="rounded-3xl border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-[#121925]/80 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
                  Фильм
                </p>
                <h2 className="type-section mt-2 text-[1.3rem]">
                  {sale.performance.movie?.name || "Название недоступно"}
                </h2>
                <p className="type-body mt-3 text-[var(--text-muted)]">
                  {formatPerformanceDate(sale.performance.time)}
                </p>
                <p className="type-body text-[var(--text-muted)]">
                  {sale.performance.hall_name || "Зал не указан"}
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
                  Заказ
                </p>
                <p className="type-title mt-2 text-base">{sale.secret}</p>
                <p className="type-body mt-3 text-[var(--text-muted)]">
                  Email: {sale.email || "не указан"}
                </p>
                <p className="type-label mt-2 text-[var(--accent-strong)]">
                  Сумма: {formatMoney(sale.amount)} ₽
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="type-meta text-[11px] tracking-[0.11em] text-[var(--text-muted)]">
                Билеты
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sale.tickets.length === 0 ? (
                  <p className="type-body text-[var(--text-muted)]">
                    Билеты пока недоступны. Обновите страницу через минуту.
                  </p>
                ) : (
                  sale.tickets.map((ticket) => (
                    <article
                      key={`${ticket.row}-${ticket.seat}-${ticket.external_code}`}
                      className="rounded-2xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <p className="type-title text-base">
                        Ряд {ticket.row}, место {ticket.seat}
                      </p>
                      <p className="type-body mt-1 text-sm text-[var(--text-muted)]">
                        Код: {ticket.external_code || "не указан"}
                      </p>
                      <p className="type-label mt-2 text-[var(--accent-strong)]">
                        {formatMoney(ticket.price)} ₽
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-dashed border-black/15 bg-white/50 p-5 dark:border-white/15 dark:bg-white/[0.02]">
          <p className="type-body text-[var(--text-muted)]">
            Нет кода заказа? Проверьте папку «Спам» в почте или обратитесь на
            страницу{" "}
            <Link className="text-[var(--accent-strong)]" to="/contacts">
              контактов
            </Link>
            .
          </p>
        </section>
      </div>
    </DefaultLayout>
  );
}
