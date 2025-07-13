export interface PageContext {
  type: "theme" | "question";
  title: string;
}

export const generateChangeTopicMessage = (context?: PageContext): string => {
  if (!context) {
    return "話題を変えましょう";
  }

  const contextType = context.type === "theme" ? "テーマ" : "論点";
  return `この${contextType}「${context.title}」に関して別の話題を話しましょう`;
};
