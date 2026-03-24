import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/i18n/locale";
import { AuthProvider } from "@/auth/AuthProvider";
import Header from "@/components/Header";
import Index from "./pages/Index";
import NewSheet from "./pages/NewSheet";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sheetType = searchParams.get("type");
  const isDashboard =
    location.pathname === "/sheets/new" && (sheetType === "RPG" || sheetType === "STORY");
  const isCatalogDashboard = location.pathname === "/catalog";
  const isAuthFullScreen = location.pathname === "/login";
  const isSettingsFullScreen = location.pathname === "/settings";

  return (
    <>
      {!isDashboard && !isCatalogDashboard && !isAuthFullScreen && !isSettingsFullScreen && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sheets/new" element={<NewSheet />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocaleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </LocaleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
