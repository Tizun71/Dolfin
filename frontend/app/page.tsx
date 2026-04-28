"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="mx-auto">
      <h1>Spam</h1>
      <button
        className="w-fit border px-3 py-1 mt-10 rounded active:scale-95"
        onClick={() => setCount(count + 1)}
      >
        {count}
      </button>
    </div>
  );
}
