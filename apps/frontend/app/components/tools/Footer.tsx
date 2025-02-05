import Image from "next/image";
import Link from "next/link";
import { Twitter, Headphones, Linkedin, MessageSquare } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

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
    <footer className="relative z-[30]" style={footerStyle}>
      {/* Top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-muted-foreground/20 via-destructive to-muted-foreground/20 z-[2]" />

      {/* Divine light effect */}
      <div className="absolute inset-0 flex items-start justify-center overflow-hidden z-[1]">
        {/* Side gradients - static */}
        <div className="absolute left-0 w-[45%] h-full bg-gradient-to-r from-black via-black to-transparent z-[2]" />
        <div className="absolute right-0 w-[45%] h-full bg-gradient-to-l from-black via-black to-transparent z-[2]" />

        {/* Main power surge beam */}
        <motion.div
          animate={{
            opacity: [0.15, 0.35, 0.15],
            scale: [1, 1.05, 1],
            y: [-10, -5, -10],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 w-[800px] h-[1200px] bg-gradient-to-b from-white/50 via-destructive/30 to-transparent rotate-180 scale-y-[-1] blur-[45px] mix-blend-screen"
        />

        {/* Neural lightning network */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-40 w-[600px] h-[600px]"
        >
          {/* Neural power nodes */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
              className={`absolute w-[150px] h-[150px] bg-gradient-radial 
                ${i % 2 === 0 ? "from-destructive/50 via-destructive/15" : "from-white/30 via-gray-300/10"} 
                to-transparent blur-[20px]`}
              style={{
                left: `${Math.sin(i * (Math.PI / 2)) * 200}px`,
                top: `${Math.cos(i * (Math.PI / 2)) * 200}px`,
              }}
            />
          ))}
        </motion.div>

        {/* Power surge flashes */}
        <motion.div
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 2,
          }}
          className="absolute top-1/4 left-1/3 w-[120px] h-[120px] bg-gradient-radial from-destructive/60 via-destructive/20 to-transparent blur-[12px]"
        />

        {/* Brain power core */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 w-[400px] h-[400px] rounded-full bg-gradient-radial from-destructive/25 via-destructive/8 to-transparent blur-[35px] mix-blend-screen"
        />

        {/* Quick energy sparks */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0.8, 1, 0.8],
              x: [0, (i - 1) * 20, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2.5,
              delay: i * 0.5,
            }}
            className="absolute top-1/3 w-[40px] h-[40px] bg-gradient-radial from-white/60 via-destructive/30 to-transparent blur-[8px]"
            style={{
              left: `${45 + i * 5}%`,
            }}
          />
        ))}
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
          <div className="absolute inset-0 bg-black/20" />
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
        <p className="text-lg text-muted-foreground mb-2">
          Forget tradingview tabs. Your Solana empire starts with a chat.
        </p>
        <p className="text-muted-foreground mb-8">
          Agentic. Effortless. Yours.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <Link
            href="https://twitter.com/brainpowerai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Twitter className="h-6 w-6" />
          </Link>
          <Link
            href="https://discord.gg/brainpower"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-6 w-6" />
          </Link>
          <Link
            href="https://linkedin.com/company/brainpower"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-6 w-6" />
          </Link>
          <Link
            href="https://t.me/brainpower"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Headphones className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
