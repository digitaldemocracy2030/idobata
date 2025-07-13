export const generateRandomDisplayName = (): string => {
  const birdNames = [
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

  const randomBird = birdNames[Math.floor(Math.random() * birdNames.length)];
  const randomNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `${randomBird}${randomNumber}`;
};
