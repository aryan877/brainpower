import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onLogin: () => void;
}

export function HeroSection({ onLogin }: HeroSectionProps) {
  return (
    <div className="relative z-[30] flex flex-col items-center justify-start gap-8 px-4 max-w-7xl mx-auto pt-40">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-0" />
      <div className="text-center flex flex-col gap-0 relative z-10">
        <h1 className="text-6xl text-transparent text-center mx-auto leading-tight pb-0 bg-gradient-to-r from-muted-foreground via-white via-muted-foreground to-white bg-clip-text">
          Your Solana Agent
        </h1>
        <h2 className="text-6xl text-transparent text-center mx-auto leading-tight pb-4 bg-gradient-to-r from-muted-foreground via-white via-muted-foreground to-white bg-clip-text">
          Chat Smarter, Execute Faster
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground/60 max-w-3xl text-center mx-auto mt-4 tracking-wide">
          AI employee for Solana that&apos;s organized into specialized agents,
          each built to handle a distinct set of crypto operations.
        </p>
      </div>

      <motion.div
        animate={{
          background: [
            "linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.25) 50%, rgba(239, 68, 68, 0.15) 100%)",
            "linear-gradient(90deg, rgba(239, 68, 68, 0.25) 50%, rgba(239, 68, 68, 0.15) 100%, rgba(239, 68, 68, 0.25) 0%)",
          ],
          boxShadow: [
            "0 0 20px -1px rgba(239, 68, 68, 0.2)",
            "0 0 30px -1px rgba(239, 68, 68, 0.3)",
            "0 0 20px -1px rgba(239, 68, 68, 0.2)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="p-[1px] rounded-lg overflow-hidden backdrop-blur-[2px]"
      >
        <Button
          onClick={onLogin}
          size="lg"
          variant="outline"
          className="!bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-all duration-300 px-8 py-6 text-lg font-medium tracking-wide relative z-10 min-w-[200px] shadow-[0_4px_20px_-1px] shadow-destructive/40"
        >
          Get Started Now
        </Button>
      </motion.div>

      {/* App Preview Image */}
      <div className="relative w-full max-w-6xl mt-16 flex justify-center items-center z-10">
        <Image
          src="/landing/hero/hero-bg.svg"
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
