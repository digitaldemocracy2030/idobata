import React from "react";
import type { FC } from "react";
import { Link } from "react-router-dom";
import type { Theme } from "../../services/api/types";
import Button from "../ui/Button";

interface ThemeTableProps {
  themes: Theme[];
  onDelete: (id: string) => void;
}

const ThemeTable: FC<ThemeTableProps> = ({ themes, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("ja-JP");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-background border border-border">
        <thead>
          <tr className="bg-muted">
            <th className="py-2 px-4 border-b text-left">タイトル</th>
            <th className="py-2 px-4 border-b text-left">スラッグ</th>
            <th className="py-2 px-4 border-b text-left">ステータス</th>
            <th className="py-2 px-4 border-b text-left">作成日時</th>
            <th className="py-2 px-4 border-b text-center">アクション</th>
          </tr>
        </thead>
        <tbody>
          {themes.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-muted-foreground">
                テーマがありません
              </td>
            </tr>
          ) : (
            themes.map((theme) => (
              <tr key={theme._id} className="hover:bg-muted/50">
                <td className="py-2 px-4 border-b">{theme.title}</td>
                <td className="py-2 px-4 border-b">{theme.slug}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      theme.isActive
                        ? "bg-success/20 text-success-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {theme.isActive ? "アクティブ" : "非アクティブ"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  {formatDate(theme.createdAt)}
                </td>
                <td className="py-2 px-4 border-b flex justify-center space-x-2">
                  <Link to={`/themes/${theme._id}`}>
                    <Button variant="secondary">編集</Button>
                  </Link>
                  <Button variant="danger" onClick={() => onDelete(theme._id)}>
                    削除
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ThemeTable;
