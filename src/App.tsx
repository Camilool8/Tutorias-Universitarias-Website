import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Componente de carga
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-indigo-800 font-medium">Cargando...</p>
    </div>
  </div>
);

// Lazy loading de las páginas
const LandingPage = lazy(() => import("./pages/LandingPage"));
const UploadForm = lazy(() => import("./pages/UploadForm"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Turnitin = lazy(() => import("./pages/Turnitin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PromoPage = lazy(() => import("./pages/PromoPage"));
const NotFound = lazy(() => import("./components/NotFound"));
const EmailStatus = lazy(() => import("./pages/EmailStatus"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-16">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/cotizar" element={<UploadForm />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/turnitin" element={<Turnitin />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route
                    path="/admin/login"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminLogin />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route path="/admin/email-status" element={<EmailStatus />} />
                  <Route path="/promo" element={<PromoPage />} />
                  <Route path="/unsubscribe" element={<UnsubscribePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </ScrollToTop>
      </Router>
    </HelmetProvider>
  );
}

export default App;
