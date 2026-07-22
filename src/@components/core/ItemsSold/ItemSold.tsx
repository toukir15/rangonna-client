import { useState, useEffect } from "react";

const getMonthlyRandomNumber = (): number => {
  const now = new Date();
  const storageKey = `randomNumber-${now.getFullYear()}-${now.getMonth()}`;

  const cached = localStorage.getItem(storageKey);
  if (cached) return parseInt(cached, 10);

  const newRandom = Math.floor(Math.random() * 701) + 300;
  localStorage.setItem(storageKey, newRandom.toString());
  return newRandom;
};

const ItemsSold = () => {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);

  useEffect(() => {
    setRandomNumber(getMonthlyRandomNumber());
  }, []);

  return (
    <p>
      {randomNumber ?? "..."}
      <span className="text-gray-600"> Items sold in last month</span>
    </p>
  );
};

export default ItemsSold;
