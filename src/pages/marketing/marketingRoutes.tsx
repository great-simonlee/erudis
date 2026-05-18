import { Route } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { MarketingPage } from './MarketingPage';

/** Public marketing pages linked from the landing footer. */
export const marketingPublicRoutes = (
  <>
    <Route path={ROUTES.about} element={<MarketingPage slug="about" />} />
    <Route path={ROUTES.news} element={<MarketingPage slug="news" />} />
    <Route
      path={ROUTES.schoolsInstitutions}
      element={<MarketingPage slug="schools-institutions" />}
    />
    <Route path={ROUTES.services} element={<MarketingPage slug="services" />} />
    <Route path={ROUTES.career} element={<MarketingPage slug="career" />} />
    <Route path={ROUTES.roadmap} element={<MarketingPage slug="roadmap" />} />
    <Route path={ROUTES.contact} element={<MarketingPage slug="contact" />} />
  </>
);
