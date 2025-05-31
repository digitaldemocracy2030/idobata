import type React from "react";
import { Button } from "../ui/button";

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
}

function ConnectionStatus({
  isConnected,
  isLoading,
  onConnect,
}: ConnectionStatusProps): React.ReactElement {
  if (isConnected) {
    return (
      <span className="text-sm text-accent-dark font-medium">
        ✓ 接続済み
      </span>
    );
  }

  return (
    <Button
      onClick={onConnect}
      disabled={isLoading}
      variant="default"
      size="sm"
      className="bg-accent hover:bg-accent-dark"
    >
      {isLoading ? "接続中..." : "サーバーに接続"}
    </Button>
  );
}

export default ConnectionStatus;
