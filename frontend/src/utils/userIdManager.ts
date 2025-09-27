import { v4 as uuidv4 } from "uuid";

const USER_ID_KEY = "idobataUserId";

export const userIdManager = {
  getUserId(): string {
    let userId = localStorage.getItem(USER_ID_KEY);

    // 存在しない場合は新規作成して保存
    if (!userId) {
      userId = uuidv4();
      this.setUserId(userId);
    }

    return userId;
  },

  setUserId(userId: string): void {
    localStorage.setItem(USER_ID_KEY, userId);
  },
};
