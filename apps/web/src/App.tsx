import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingState } from '@/components/ui/States';

/* Public routes */
const Home = lazy(() => import('@/pages/Home'));
const AboutPage = lazy(() => import('@/pages/About'));
const ProjectsPage = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage'));
const ContactPage = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/* Admin routes */
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProjects = lazy(() => import('@/pages/admin/Projects'));
const AdminProjectForm = lazy(() => import('@/pages/admin/ProjectForm'));
const AdminExperience = lazy(() => import('@/pages/admin/Experience'));
const AdminSkills = lazy(() => import('@/pages/admin/Skills'));
const AdminMessages = lazy(() => import('@/pages/admin/Messages'));
const AdminProfile = lazy(() => import('@/pages/admin/Profile'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ---------------- Public ---------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ---------------- Admin ---------------- */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<LoadingState label="Loading" className="min-h-dvh" />}>
              <AdminLogin />
            </Suspense>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<AdminProjectForm mode="create" />} />
          <Route path="projects/:id/edit" element={<AdminProjectForm mode="edit" />} />
          <Route path="experience" element={<AdminExperience />} />
          <Route path="skills" element={<AdminSkills />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
