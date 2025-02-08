import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onLogin: () => void;
}

export function HeroSection({ onLogin }: HeroSectionProps) {
  return (
    <div className="relative z-[30] flex flex-col items-center justify-start gap-8 px-4 max-w-7xl mx-auto pt-40 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 z-0">
          {/* Divine light effect */}
          <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
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
                times: [0, 0.5, 1],
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
              className="absolute top-40 w-[900px] h-[900px]"
            >
              {/* Neural power nodes */}
              {[...Array(6)].map((_, i) => (
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
                  className={`absolute w-[200px] h-[200px] bg-gradient-radial 
                    ${i % 2 === 0 ? "from-destructive/50 via-destructive/15" : "from-white/30 via-gray-300/10"} 
                    to-transparent blur-[20px]`}
                  style={{
                    left: `${Math.sin(i * (Math.PI / 3)) * 300}px`,
                    top: `${Math.cos(i * (Math.PI / 3)) * 300}px`,
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
            <motion.div
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 2.5,
                delay: 0.8,
              }}
              className="absolute top-1/3 right-1/3 w-[100px] h-[100px] bg-gradient-radial from-destructive/50 via-destructive/15 to-transparent blur-[15px]"
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
              className="absolute top-40 w-[600px] h-[600px] rounded-full bg-gradient-radial from-destructive/25 via-destructive/8 to-transparent blur-[35px] mix-blend-screen"
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
                className="absolute top-1/2 w-[40px] h-[40px] bg-gradient-radial from-white/60 via-destructive/30 to-transparent blur-[8px]"
                style={{
                  left: `${45 + i * 5}%`,
                }}
              />
            ))}
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-black via-black/95 to-transparent" />
        </div>

        {/* Brain image */}
        <div className="absolute inset-0 flex items-start justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="/landing/hero/big-brain.png"
              alt="Brain Background"
              width={1200}
              height={1200}
              className="w-[1200px] h-auto translate-y-8"
              priority
            />
          </motion.div>
        </div>
        {/* Side fades */}
        <div className="absolute inset-0 z-[11]">
          <div className="absolute left-0 w-[35%] h-full bg-gradient-to-r from-black via-black/95 to-transparent" />
          <div className="absolute right-0 w-[35%] h-full bg-gradient-to-l from-black via-black/95 to-transparent" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-0" />

      {/* Content */}
      <div className="text-center flex flex-col gap-0 relative z-10">
        <h1 className="text-6xl text-transparent text-center mx-auto leading-tight pb-0 bg-gradient-to-r from-white/80 via-white via-white/80 to-white bg-clip-text">
          Your Solana Agent
        </h1>
        <h2 className="text-6xl text-transparent text-center mx-auto leading-tight pb-4 bg-gradient-to-r from-white/80 via-white via-white/80 to-white bg-clip-text">
          Chat Smarter, Execute Faster
        </h2>
        <p className="text-lg md:text-xl text-white/60 max-w-3xl text-center mx-auto mt-4 tracking-wide">
          AI employee for Solana that&apos;s organized into specialized agents,
          each built to handle a distinct set of crypto operations.
        </p>
      </div>

      <div className="relative">
        <motion.div
          className="absolute -inset-[1px] rounded-lg"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.8), transparent)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0", "-200% 0"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <Button
          onClick={onLogin}
          size="lg"
          variant="outline"
          className="!bg-[#121212] border-none hover:!bg-[#121212]/90 transition-all duration-300 px-8 py-6 text-lg font-medium tracking-wide relative z-10 min-w-[200px] rounded-lg"
        >
          Chat with Agent
        </Button>
      </div>

      {/* App Preview */}
      <div className="relative w-full max-w-6xl mt-16 flex justify-center items-center z-10">
        <Image
          src="/landing/hero/hero-bg.png"
          alt="BrainPower App Preview"
          width={1200}
          height={675}
          className="w-full h-auto rounded-xl bg-transparent"
          priority
        />
      </div>
    </div>
  );
}
