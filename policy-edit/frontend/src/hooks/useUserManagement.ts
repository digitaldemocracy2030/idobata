import { useCallback, useEffect, useState } from "react";

export interface UseUserManagementReturn {
  userName: string | null;
  setUserName: (name: string) => void;
  promptForName: () => Promise<string>;
}

export function useUserManagement(): UseUserManagementReturn {
  const [userName, setUserNameState] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserNameState(storedName);
    }
  }, []);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem("userName", name);
  }, []);

  const promptForName = useCallback(async (): Promise<string> => {
    const name = prompt(
      "お名前を入力してください（あなたの提案の記名に使用されます）："
    );

    if (name) {
      setUserName(name);
      return name;
    }

    console.warn("ユーザーが名前を提供しませんでした。");
    const defaultName = "匿名ユーザー";
    setUserName(defaultName);
    return defaultName;
  }, [setUserName]);

  return {
    userName,
    setUserName,
    promptForName,
  };
}
