import DefaultLayout from "@/layouts/default";

const FAQ_ITEMS = [
  {
    question: "Как купить билет онлайн?",
    answer:
      "Откройте афишу, выберите фильм и сеанс, затем отметьте места в зале и оплатите заказ. Ссылка на билеты придет на email сразу после подтверждения оплаты.",
  },
  {
    question: "Можно ли вернуть билет?",
    answer:
      "Да, возврат доступен до начала сеанса. Если возврат для продажи разрешен, используйте ссылку возврата в письме с билетом или обратитесь в поддержку кинотеатра.",
  },
  {
    question: "Сколько мест можно купить за один раз?",
    answer:
      "В одной покупке доступно до 5 мест. Это ограничение защищает систему от ошибочных массовых броней.",
  },
  {
    question: "Где посмотреть уже купленные билеты?",
    answer:
      "Перейдите на страницу «Мои билеты» и введите код заказа (secret). Код есть в письме после оплаты.",
  },
  {
    question: "Почему не отображаются доступные места?",
    answer:
      "Места могут временно блокироваться во время оформления у других пользователей. Обновите страницу через несколько секунд и попробуйте выбрать другие места.",
  },
];

export default function FAQPage() {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-6 pb-12">
        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <p className="type-eyebrow text-[var(--text-muted)]">Поддержка</p>
          <h1 className="type-display mt-3 text-3xl md:text-4xl">
            Вопросы и ответы
          </h1>
          <p className="type-body mt-3 max-w-3xl text-[var(--text-muted)]">
            Собрали ответы на самые частые вопросы по покупке билетов, возвратам
            и работе личных заказов.
          </p>
        </section>

        <section className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-[#121925]/78"
            >
              <summary className="type-title cursor-pointer list-none pr-8 text-base marker:content-none sm:text-lg">
                {item.question}
              </summary>
              <p className="type-body pt-3 text-[var(--text-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </section>
      </div>
    </DefaultLayout>
  );
}
