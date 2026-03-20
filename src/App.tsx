import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Index from "./pages/Index";
import NewSheet from "./pages/NewSheet";
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sheetType = searchParams.get("type");
  const isDashboard =
    location.pathname === "/sheets/new" && (sheetType === "RPG" || sheetType === "STORY");

  return (
    <>
      {!isDashboard && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/sheets/new" element={<NewSheet />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
