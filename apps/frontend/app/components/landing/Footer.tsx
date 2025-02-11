import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Footer() {
  const [imageHeight, setImageHeight] = useState<number>(0);

  // Memoize the image load handler
  const handleImageLoad = useCallback((image: HTMLImageElement) => {
    setImageHeight(image.height);
  }, []);

  // Effect to handle image loading
  useEffect(() => {
    const image = document.createElement("img");
    image.src = "/landing/footer/big-brain-cropped.png";
    image.onload = () => handleImageLoad(image);
  }, [handleImageLoad]);

  // Memoize the footer style
  const footerStyle = useMemo(
    () => ({
      minHeight: imageHeight ? `${Math.min(imageHeight, 300)}px` : "auto",
      paddingTop: "4rem",
      paddingBottom: "2rem",
    }),
    [imageHeight]
  );

  return (
    <footer className="relative z-[30] text-white" style={footerStyle}>
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/20 via-destructive to-white/20 z-[2]" />

      {/* Divine light effect */}
      <div className="absolute inset-0 flex items-start justify-center overflow-hidden z-[1]">
        {/* Side gradients - static */}
        <div className="absolute left-0 w-[35%] h-full bg-gradient-to-r from-black via-black to-transparent z-[2]" />
        <div className="absolute right-0 w-[35%] h-full bg-gradient-to-l from-black via-black to-transparent z-[2]" />

        {/* Static light effects */}
        <div className="absolute -top-20 w-[200px] h-[1200px] bg-gradient-to-b from-white/20 via-destructive/10 to-transparent rotate-180 scale-y-[-1] blur-[45px] mix-blend-screen" />

        {/* Static power nodes */}
        <div className="absolute top-40 w-[140px] h-[140px]">
          <div className="absolute w-[40px] h-[40px] left-[50px] top-0 bg-gradient-radial from-destructive/20 via-destructive/5 to-transparent blur-[20px]" />
          <div className="absolute w-[40px] h-[40px] right-[50px] top-0 bg-gradient-radial from-white/10 via-gray-300/5 to-transparent blur-[20px]" />
          <div className="absolute w-[40px] h-[40px] left-[50px] bottom-0 bg-gradient-radial from-destructive/20 via-destructive/5 to-transparent blur-[20px]" />
          <div className="absolute w-[40px] h-[40px] right-[50px] bottom-0 bg-gradient-radial from-white/10 via-gray-300/5 to-transparent blur-[20px]" />
        </div>

        {/* Static power core */}
        <div className="absolute top-40 w-[100px] h-[100px] rounded-full bg-gradient-radial from-destructive/15 via-destructive/5 to-transparent blur-[35px] mix-blend-screen" />

        {/* Static energy dots */}
        <div className="absolute top-1/3 left-[49%] w-[10px] h-[10px] bg-gradient-radial from-white/20 via-destructive/10 to-transparent blur-[8px]" />
        <div className="absolute top-1/3 left-[50%] w-[10px] h-[10px] bg-gradient-radial from-white/20 via-destructive/10 to-transparent blur-[8px]" />
        <div className="absolute top-1/3 left-[51%] w-[10px] h-[10px] bg-gradient-radial from-white/20 via-destructive/10 to-transparent blur-[8px]" />
      </div>

      {/* Background Brain Effect */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {/* Background gradients and brain - bottom layer */}
        <div className="absolute inset-0">
          {/* Brain image */}
          <div className="absolute inset-x-0 top-2 flex justify-center">
            <div>
              <Image
                src="/landing/footer/big-brain-cropped.png"
                alt="Background Brain"
                width={400}
                height={400}
                className="w-[400px] h-auto opacity-35"
                priority
                onLoad={(e) => {
                  if (e.target instanceof HTMLImageElement) {
                    handleImageLoad(e.target);
                  }
                }}
              />
            </div>
          </div>

          {/* Black gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Overall dark overlay */}
          <div className="absolute inset-0 bg-background/20" />
        </div>
      </div>

      <div className="relative z-[3] flex flex-col items-center text-center px-4 max-w-7xl mx-auto mb-12">
        <Image
          src="/logo-group.svg"
          alt="BrainPower Logo"
          width={180}
          height={40}
          className="h-8 w-auto mb-6"
        />
        <SectionHeader
          title=""
          description="Forget tradingview tabs. Your Solana empire starts with a chat."
          titleSize="sm"
          className="mb-2"
        />
        <p className="text-muted-foreground mb-8">
          Agentic. Effortless. Yours.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <Link
            href="https://x.com/brainpower009"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <Image
              src="/landing/footer/twitter.svg"
              alt="X (Twitter)"
              width={48}
              height={48}
            />
          </Link>
          <div className="opacity-30 cursor-not-allowed transition-opacity hover:opacity-40">
            <Image
              src="/landing/footer/discord.svg"
              alt="Discord (Coming Soon)"
              width={48}
              height={48}
              className="grayscale"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
