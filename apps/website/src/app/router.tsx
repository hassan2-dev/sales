import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { CorporateLayout } from '@/layouts/CorporateLayout';
import { RouteTransition } from '@/components/PageTransition';
import { HomePage } from '@/pages/corporate/HomePage';
import {
  AboutPage,
  ServicesPage,
  ServiceDetailPage,
  ContactPage,
  BrandsPage,
  BrandDetailPage,
  ProjectsPage,
  ProjectDetailPage,
} from '@/pages/corporate/CmsPages';

function ServiceDetailRoute() {
  const { slug = '' } = useParams();
  return <ServiceDetailPage slug={slug} />;
}

function BrandDetailRoute() {
  const { slug = '' } = useParams();
  return <BrandDetailPage slug={slug} />;
}

function ProjectDetailRoute() {
  const { slug = '' } = useParams();
  return <ProjectDetailPage slug={slug} />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <RouteTransition>
        {(loc) => (
          <Routes location={loc}>
            <Route element={<CorporateLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:slug" element={<ServiceDetailRoute />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="brands/:slug" element={<BrandDetailRoute />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:slug" element={<ProjectDetailRoute />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </RouteTransition>
    </BrowserRouter>
  );
}
