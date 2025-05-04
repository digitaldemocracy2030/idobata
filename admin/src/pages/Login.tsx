import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }

    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError("メールアドレスまたはパスワードが正しくありません");
      }
    } catch (err) {
      setError("ログイン処理中にエラーが発生しました。");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">管理画面ログイン</h1>
          <p className="mt-2 text-gray-600">
            アカウント情報を入力してログインしてください
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label
              htmlFor="email"
              className="block text-foreground font-medium mb-2"
            >
              メールアドレス
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
            />
          </div>

          <div className="mb-4">
            <Label
              htmlFor="password"
              className="block text-foreground font-medium mb-2"
            >
              パスワード
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
