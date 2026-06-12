import { useEffect, useState, CSSProperties, useCallback } from "react";

export function useHeroAnimation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getStyle = useCallback(
    (delay: number): CSSProperties => ({
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `all 700ms ease-out ${delay}ms`,
    }),
    [visible],
  );

  return { getStyle };
}
