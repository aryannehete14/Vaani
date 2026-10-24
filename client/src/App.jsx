import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ToastProvider } from './components/ui/Toast.jsx';
import { BuilderPage } from './pages/BuilderPage.jsx';
import { StorefrontPage } from './pages/StorefrontPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash, key]);
  return null;
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<BuilderPage />} />
          <Route path="/s/:slug" element={<StorefrontPage />} />
          <Route path="/dashboard/:slug" element={<DashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </MotionConfig>
  );
}
