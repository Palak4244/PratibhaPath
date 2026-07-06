import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ResumeProvider } from "./api/ResumeContext";
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import ResultsPage from "./pages/ResultsPage";
import JobsPage from "./pages/JobsPage";
import ResumeEditor from "./pages/ResumeEditor";
import NotFound from "./pages/NotFound";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Home /></PageWrap>} />
        <Route path="/upload" element={<PageWrap><UploadPage /></PageWrap>} />
        <Route path="/results" element={<PageWrap><ResultsPage /></PageWrap>} />
        <Route path="/jobs" element={<PageWrap><JobsPage /></PageWrap>} />
        {/* Editor has its own full-screen layout — no Navbar/Footer */}
        <Route path="/editor" element={<ResumeEditor />} />
        <Route path="*" element={<PageWrap><NotFound /></PageWrap>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrap({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}

// Editor page uses full screen — don't show Navbar/Footer for it
function Layout() {
  const location = useLocation();
  const isEditor = location.pathname === "/editor";
  return (
    <>
      <AnimatedBackground />
      {!isEditor && <Navbar />}
      <main className={`relative z-10 ${isEditor ? "" : "pt-16"}`}>
        <AnimatedRoutes />
      </main>
      {!isEditor && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ResumeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ResumeProvider>
  );
}
