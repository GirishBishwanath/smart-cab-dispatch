import { Route, Routes } from "react-router-dom";

import LandingLayout from "../layouts/LandingLayout.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";

import Home from "../pages/Home.jsx";
import Features from "../pages/Features.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import NotFound from "../pages/NotFound.jsx";

import { ROUTES } from "../utils/constants.js";

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.FEATURES} element={<Features />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
