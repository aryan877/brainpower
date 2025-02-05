import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { HeroSection } from "./tools/HeroSection";
import { ChatGPTSection } from "./tools/ChatGPTSection";
import { AgentsSection } from "./tools/AgentsSection";
import { HowItWorksSection } from "./tools/HowItWorksSection";
import { CryptoProSection } from "./tools/CryptoProSection";
import { FAQSection } from "./tools/FAQSection";
import { JoinAlphaSection } from "./tools/JoinAlphaSection";
import { Footer } from "./tools/Footer";

export function WelcomePage({ onLogin }: { onLogin: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen w-screen bg-background relative overflow-hidden">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full bg-transparent">
        <nav className="flex items-center px-6 py-4 w-full max-w-7xl relative">
          <Link href="/" className="flex items-center z-50">
            <Image
              src="/logo-group.svg"
              alt="BrainPower Logo"
              width={140}
              height={30}
              className="h-6 w-auto"
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden z-50 text-foreground hover:text-muted-foreground transition-colors ml-auto"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Mobile Menu */}
          <div
            className={`
            fixed inset-0 bg-background/95 backdrop-blur-sm md:hidden transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
            flex flex-col items-center justify-center gap-8 z-40
          `}
          >
            <Link
              href="/agents"
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Agents
            </Link>
            <Link
              href="/how"
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How
            </Link>
            <Link
              href="/faq"
              className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                onLogin();
              }}
              variant="outline"
              className="!bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors shadow-[0_4px_20px_-1px] shadow-destructive/40"
            >
              Get Started Now
            </Button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8 mx-8">
            <Link
              href="/agents"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Agents
            </Link>
            <Link
              href="/how"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How
            </Link>
            <Link
              href="/faq"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
          </div>
          <Button
            onClick={onLogin}
            variant="outline"
            className="hidden md:inline-flex !bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors shadow-[0_4px_20px_-1px] shadow-destructive/40"
          >
            Get Started Now
          </Button>
        </nav>
      </div>

      {/* Background Brain SVG */}
      <div className="absolute inset-0">
        {/* Background gradients and divine light - bottom layer */}
        <div className="absolute inset-0 z-0">
          {/* Divine light effect - behind brain */}
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

          {/* Bottom black gradient */}
          <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-black via-black/95 to-transparent" />
        </div>

        {/* Brain image - middle layer */}
        <div className="absolute inset-0 flex items-start justify-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
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

        {/* Side gradients - between brain and content */}
        <div className="absolute inset-0 z-[11]">
          {/* Left black gradient */}
          <motion.div
            animate={{
              translateX: [-50, 0, -50],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-0 w-[45%] h-full bg-gradient-to-r from-black via-black/95 to-transparent"
          />
          {/* Right black gradient */}
          <motion.div
            animate={{
              translateX: [50, 0, 50],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute right-0 w-[45%] h-full bg-gradient-to-l from-black via-black/95 to-transparent"
          />
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection onLogin={onLogin} />

      {/* ChatGPT Section */}
      <ChatGPTSection />

      {/* Agents Section */}
      <AgentsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Not a Crypto Pro Section */}
      <CryptoProSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Join Alpha Section */}
      <JoinAlphaSection onLogin={onLogin} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
