/**
 * Generate a random display name using bird names and numbers
 * @returns {string} Random display name (e.g., "ウグイス12345")
 */
export const generateRandomDisplayName = () => {
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
