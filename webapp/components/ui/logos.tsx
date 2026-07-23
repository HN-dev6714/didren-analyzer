"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Didren from "@/public/images/didren.png";
import Ceref from "@/public/images/technique.png";
import Helha from "@/public/images/helha.png";
import { Card } from "@/components/ui/card";

export function Logos() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-8 w-20" />;

  return (
    <Card className="fixed bottom-0 right-0 m-8 h-24 flex flex-row justify-center items-center gap-6 p-4 bg-white/80 border border-zinc-200">
      <Image
        src={Didren}
        alt="Didren logo"
        className="h-full w-auto object-contain"
      />
      <Image
        src={Ceref}
        alt="Ceref logo"
        className="h-full w-auto object-contain"
      />
      <Image
        src={Helha}
        alt="Helha logo"
        className="h-full w-auto object-contain"
      />
    </Card>
  );
}