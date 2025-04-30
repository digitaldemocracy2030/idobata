import React from "react";
import { useEffect, useState } from "react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import SiteConfigForm from "../components/siteConfig/SiteConfigForm";
import { apiClient } from "../services/api/apiClient";
import type { SiteConfig } from "../services/api/types";

const SiteConfigEdit: FC = () => {
  const navigate = useNavigate();
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      setLoading(true);
      const result = await apiClient.getSiteConfig();

      result.match(
        (data) => {
          setSiteConfig(data);
          setError(null);
        },
        (error) => {
          console.error(`Failed to fetch site config:`, error);
          setError("サイト設定の取得に失敗しました。");
        }
      );

      setLoading(false);
    };

    fetchSiteConfig();
  }, []);

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">サイト設定</h1>
      <SiteConfigForm siteConfig={siteConfig || undefined} />
    </div>
  );
};

export default SiteConfigEdit;
