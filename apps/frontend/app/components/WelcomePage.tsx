import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { HeroSection } from "./landing/HeroSection";
import { ChatGPTSection } from "./landing/ChatGPTSection";
import { AgentsSection } from "./landing/AgentsSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { CryptoProSection } from "./landing/CryptoProSection";
import { FAQSection } from "./landing/FAQSection";
import { JoinAlphaSection } from "./landing/JoinAlphaSection";
import { Footer } from "./landing/Footer";

export function WelcomePage({ onLogin }: { onLogin: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen w-screen relative overflow-hidden bg-black dark">
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
            className="md:hidden z-50 text-white hover:text-white/80 transition-colors ml-auto"
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
            fixed inset-0 bg-black/95 backdrop-blur-sm md:hidden transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
            flex flex-col items-center justify-center gap-8 z-40
          `}
          >
            <button
              onClick={() => scrollToSection("agents")}
              className="text-lg font-medium text-white/70 hover:text-white transition-colors"
            >
              Agents
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="text-lg font-medium text-white/70 hover:text-white transition-colors"
            >
              How
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-lg font-medium text-white/70 hover:text-white transition-colors"
            >
              FAQ
            </button>
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                onLogin();
              }}
              variant="outline"
              className="!bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors shadow-[0_4px_20px_-1px] shadow-destructive/40"
            >
              Chat with Agent
            </Button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8 mx-8">
            <button
              onClick={() => scrollToSection("agents")}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Agents
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              How
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              FAQ
            </button>
          </div>
          <Button
            onClick={onLogin}
            variant="outline"
            className="hidden md:inline-flex !bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors shadow-[0_4px_20px_-1px] shadow-destructive/40"
          >
            Chat with Agent
          </Button>
        </nav>
      </div>
      <HeroSection onLogin={onLogin} />
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden">
        {/* Light ray effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary rays */}
          <div className="absolute top-0 left-0 w-[200px] h-[70vh] bg-gradient-to-br from-white/20 via-white/5 to-transparent blur-[35px] mix-blend-screen transform -rotate-45" />
          <div className="absolute top-[10%] left-[5%] w-[150px] h-[50vh] bg-gradient-to-br from-white/15 via-white/10 to-transparent blur-[45px] mix-blend-overlay transform -rotate-30" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary rays */}
          <div className="absolute top-[120vh] right-0 w-[200px] h-[70vh] bg-gradient-to-bl from-white/20 via-white/5 to-transparent blur-[35px] mix-blend-screen transform rotate-45" />
          <div className="absolute top-[130vh] right-[5%] w-[150px] h-[50vh] bg-gradient-to-bl from-white/15 via-white/10 to-transparent blur-[45px] mix-blend-overlay transform rotate-30" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary rays */}
          <div className="absolute top-[260vh] right-0 w-[200px] h-[70vh] bg-gradient-to-bl from-white/20 via-white/5 to-transparent blur-[35px] mix-blend-screen transform rotate-45" />
          <div className="absolute top-[270vh] right-[5%] w-[150px] h-[50vh] bg-gradient-to-bl from-white/15 via-white/10 to-transparent blur-[45px] mix-blend-overlay transform rotate-30" />
          <div className="absolute top-[260vh] left-0 w-[200px] h-[70vh] bg-gradient-to-br from-white/20 via-white/5 to-transparent blur-[35px] mix-blend-screen transform -rotate-45" />
          <div className="absolute top-[270vh] left-[5%] w-[150px] h-[50vh] bg-gradient-to-br from-white/15 via-white/10 to-transparent blur-[45px] mix-blend-overlay transform -rotate-30" />
        </div>

        <ChatGPTSection />
        <AgentsSection />
        <HowItWorksSection />
        <CryptoProSection />
        <FAQSection />
        <JoinAlphaSection onLogin={onLogin} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
