import React, { useState, useEffect } from "react";
import type { ChangeEvent, FC, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/api/apiClient";
import { ApiErrorType } from "../../services/api/apiError";
import type {
  SiteConfig,
  UpdateSiteConfigPayload,
} from "../../services/api/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SiteConfigFormProps {
  siteConfig?: SiteConfig;
}

const SiteConfigForm: FC<SiteConfigFormProps> = ({ siteConfig }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateSiteConfigPayload>({
    title: "",
    aboutMessage: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (siteConfig) {
      setFormData({
        title: siteConfig.title,
        aboutMessage: siteConfig.aboutMessage || "",
      });
    }
  }, [siteConfig]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = "サイト名は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const result = await apiClient.updateSiteConfig(formData);

    result.match(
      () => {
        navigate("/dashboard");
      },
      (error) => {
        console.error("Form submission error:", error);

        if (error.type === ApiErrorType.VALIDATION_ERROR) {
          setErrors({ form: error.message });
        } else {
          alert(`エラーが発生しました: ${error.message}`);
        }
      }
    );

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {errors.form && (
        <div className="bg-destructive/20 text-destructive-foreground p-4 rounded mb-4">
          {errors.form}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-foreground font-medium mb-2"
        >
          サイト名
          <span className="text-destructive ml-1">*</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-destructive text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="aboutMessage"
          className="block text-foreground font-medium mb-2"
        >
          サイト説明（マークダウン形式）
        </label>
        <textarea
          id="aboutMessage"
          name="aboutMessage"
          value={formData.aboutMessage}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          rows={10}
        />
        <p className="text-sm text-muted-foreground mt-1">
          マークダウン形式で入力できます。
        </p>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : "更新"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/dashboard")}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
};

export default SiteConfigForm;
