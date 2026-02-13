import React from "react";
import ReactDOM from "react-dom/client";
import "@/styles/globals.css";

const AdminPlaceholder = () => (
  <main className="flex min-h-screen items-center justify-center bg-[var(--surface-0)] px-6 text-[var(--text-primary)]">
    <section className="glass-panel max-w-xl rounded-3xl p-8 text-center">
      <h1 className="font-display text-3xl uppercase">Панель администратора</h1>
      <p className="pt-4 text-sm text-[var(--text-muted)]">
        Отдельный admin UI пока не подключен в этом репозитории.
      </p>
      <a
        className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white"
        href="/"
      >
        Перейти в публичный интерфейс
      </a>
    </section>
  </main>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminPlaceholder />
  </React.StrictMode>,
);
