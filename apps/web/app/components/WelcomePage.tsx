import { useNotificationStore } from "@/app/store/notificationStore";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AgentsSection } from "./landing/AgentsSection";
import { ChatGPTSection } from "./landing/ChatGPTSection";
import { CryptoProSection } from "./landing/CryptoProSection";
import { FAQSection } from "./landing/FAQSection";
import { Footer } from "./landing/Footer";
import { BRAIN_TOKEN_ADDRESS, HeroSection } from "./landing/HeroSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { JoinAlphaSection } from "./landing/JoinAlphaSection";

export function WelcomePage({ onLogin }: { onLogin: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addNotification } = useNotificationStore();

  const PUMP_FUN_LINK = `https://pump.fun/coin/${BRAIN_TOKEN_ADDRESS}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BRAIN_TOKEN_ADDRESS);
    addNotification("success", "Contract address copied to clipboard");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen w-screen relative bg-black dark">
      {/* Navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 flex flex-col items-center w-full transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        {/* Contract Address Strip */}
        <div className="flex items-center justify-center w-full gap-2 py-2 bg-black/40 backdrop-blur-sm border-b border-white/10">
          <span className="text-white/60 text-xs sm:text-sm">Contract:</span>
          <span className="text-white/80 font-mono text-xs sm:text-sm">
            {BRAIN_TOKEN_ADDRESS.substring(0, 6)}...
            {BRAIN_TOKEN_ADDRESS.substring(BRAIN_TOKEN_ADDRESS.length - 6)}
          </span>
          <button
            onClick={copyToClipboard}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <Copy size={14} />
          </button>
          <Link
            href={PUMP_FUN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <ExternalLink size={14} />
          </Link>
        </div>

        <nav
          className={`flex items-center w-full max-w-7xl px-6 relative transition-all duration-300 ${
            isScrolled ? "py-3" : "py-4"
          }`}
        >
          <Link href="/" className="flex items-center z-50">
            <Image
              src="/logo-group.svg"
              alt="BrainPower Logo"
              width={140}
              height={30}
              className={`w-auto transition-all duration-300 ${
                isScrolled ? "h-5" : "h-6"
              }`}
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden z-50 text-white hover:text-white/80 transition-all duration-300 ml-auto ${
              isScrolled ? "scale-90" : "scale-100"
            }`}
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
            fixed inset-0 bg-black/95 backdrop-blur-md md:hidden transition-transform duration-300 ease-in-out
            ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
            flex flex-col items-center justify-center gap-8 z-40
          `}
          >
            <button
              onClick={() => scrollToSection("token")}
              className="text-lg font-medium text-white/70 hover:text-white transition-colors"
            >
              Token
            </button>
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
              className="!bg-black/60 border-white/10 hover:!bg-black/40 text-white hover:text-white transition-colors"
            >
              Start Chatting
            </Button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-8 mx-8">
            <button
              onClick={() => scrollToSection("token")}
              className={`font-medium text-white/70 hover:text-white transition-all duration-300 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}
            >
              Token
            </button>
            <button
              onClick={() => scrollToSection("agents")}
              className={`font-medium text-white/70 hover:text-white transition-all duration-300 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => scrollToSection("how")}
              className={`font-medium text-white/70 hover:text-white transition-all duration-300 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}
            >
              How
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className={`font-medium text-white/70 hover:text-white transition-all duration-300 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}
            >
              FAQ
            </button>
          </div>
          <Button
            onClick={onLogin}
            variant="outline"
            className={`hidden md:inline-flex !bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors shadow-[0_4px_15px_-1px] shadow-destructive/30 text-white ml-auto ${
              isScrolled
                ? "scale-90 text-sm px-5 py-2"
                : "scale-100 text-base px-6 py-2.5"
            }`}
          >
            Start Chatting
          </Button>
        </nav>
      </div>
      <HeroSection onLogin={onLogin} />
      {/* Hero Section */}
      <div className="relative w-full">
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
