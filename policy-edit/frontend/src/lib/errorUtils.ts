export const formatUserErrorMessage = (originalError: string): string => {
  return `申し訳ありません、内部でエラーが発生しました。ページをリロードして再度お試しください。（${originalError}）`;
};
