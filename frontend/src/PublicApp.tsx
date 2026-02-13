import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Spinner } from "@heroui/spinner";

// Public Pages
const IndexPage = lazy(() => import("@/pages/index"));
const MoviePage = lazy(() => import("@/pages/movie"));
const PerformancePage = lazy(() => import("@/pages/performance"));

const FullPageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Spinner color="primary" label="Загрузка..." size="lg" />
  </div>
);

function PublicApp() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<MoviePage />} path="/movie/:id" />
        <Route element={<PerformancePage />} path="/performance/:id" />
      </Routes>
    </Suspense>
  );
}

export default PublicApp;
