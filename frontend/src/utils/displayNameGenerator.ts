export const generateRandomDisplayName = (): string => {
  const nameOptions = [
    "ウグイス",
    "メジロ",
    "ツバメ",
    "カワセミ",
    "ツル",
    "キジ",
    "ヒバリ",
    "カッコウ",
    "ムクドリ",
    "ヤマガラ",
  ];

  const randomName =
    nameOptions[Math.floor(Math.random() * nameOptions.length)];
  const randomNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `${randomName}${randomNumber}`;
};
