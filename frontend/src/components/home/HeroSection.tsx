import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const HeroSection = () => {
  return (
    <div className="relative bg-neutral-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            あなたの声から、政策が動き出す
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            社会をもっと良くするヒントは、あなたの実感にあります。
          </p>
          <div className="w-full h-48 bg-neutral-200 mb-8 rounded-lg flex items-center justify-center">
            <span className="text-neutral-500">仮イメージ</span>
          </div>
          <Button asChild className="px-6 py-2 rounded-md">
            <Link to="/about">このサイトについて</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
