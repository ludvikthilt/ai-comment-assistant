import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import CommentsPage from './pages/CommentsPage';
import TemplatesPage from './pages/TemplatesPage';
import SettingsPage from './pages/SettingsPage';
import FacebookPagesPage from './pages/FacebookPagesPage';
import WhatsAppPage from './pages/WhatsAppPage';
import HistoryPage from './pages/HistoryPage';
import QuestionsPage from './pages/QuestionsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/comments" element={<PrivateRoute><CommentsPage /></PrivateRoute>} />
      <Route path="/templates" element={<PrivateRoute><TemplatesPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/facebook-pages" element={<PrivateRoute><FacebookPagesPage /></PrivateRoute>} />
      <Route path="/whatsapp" element={<PrivateRoute><WhatsAppPage /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
      <Route path="/questions" element={<PrivateRoute><QuestionsPage /></PrivateRoute>} />
    </Routes>
  );
}
