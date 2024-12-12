import { BrowserRouter, Routes as RouterRoutes, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";

import { QueryProvider, PolarisProvider } from "./components";
import Index from "./pages/viewer";
import HomePage from "./pages";
import '@shopify/polaris/build/esm/styles.css';

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
            <NavMenu>
              <a href="/" rel="home">{t("NavigationMenu.home")}</a>
              <a href="/pagename">{t("NavigationMenu.pageName")}</a>
            </NavMenu>
          <RouterRoutes>
            {/* Define routes here */}
            <Route path="/" element={<HomePage />} />
            <Route path="/viewer/:productId" element={<Index />} />
            {/* Dynamically load other pages */}
            <Route path="*" element={<Routes pages={pages} />} />
          </RouterRoutes>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}