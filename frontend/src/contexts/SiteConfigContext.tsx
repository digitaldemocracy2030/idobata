import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";

interface SiteConfig {
  _id: string;
  title: string;
  aboutMessage: string;
}

interface SiteConfigContextType {
  siteConfig: SiteConfig | null;
  loading: boolean;
  error: string | null;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  siteConfig: null,
  loading: true,
  error: null,
});

export const useSiteConfig = () => useContext(SiteConfigContext);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      const result = await apiClient.getSiteConfig();

      result.match(
        (data) => {
          setSiteConfig(data);
          setError(null);
        },
        (error) => {
          console.error("Failed to fetch site config:", error);
          setError("サイト設定の取得に失敗しました");
          setSiteConfig({
            _id: "default",
            title: "XX党 みんなの政策フォーラム",
            aboutMessage: "",
          });
        }
      );

      setLoading(false);
    };

    fetchSiteConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ siteConfig, loading, error }}>
      {children}
    </SiteConfigContext.Provider>
  );
};
