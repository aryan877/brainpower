import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function FAQSection() {
  const faqs = [
    {
      question: "What is Brainpower?",
      answer:
        "Brainpower is like your personal crypto sidekick on Solana. It’s got a squad of AI agents ready to handle everything—from launching tokens and deep dives to staking and trading. Think of it as your go-to crypto companion.",
    },
    {
      question: "How does it work?",
      answer:
        "Just talk to it like you’d chat with a friend. Whether you're looking to launch a token, swap tokens, stake, or search for tweets, our AI understands you and gets things done—no BS.",
    },
    {
      question: "wen launch?",
      answer:
        "Mark your calendar! We’re dropping our token on Pump.fun in February 2025.",
    },
    {
      question: "What's coming next?",
      answer:
        "Next up, we're cooking up an epic AI-powered crypto onboarding. Think fun mini-games to learn the ropes, one-click swaps, and seamless DeFi moves—all designed to make crypto less of a headache.",
    },
    {
      question: "Is it secure?",
      answer:
        "Absolutely. We maintain rock-solid security with rigorous safeguards—no careless mistakes or shady contracts. Every move requires your explicit go-ahead.",
    },
    {
      question: "Do I need to be a crypto expert?",
      answer:
        "Nah, you don’t need to be a crypto wizard. Just use plain talk and let Brainpower break it down for you—it’s built for everyone.",
    },
    {
      question: "What chains are supported?",
      answer:
        "Right now, we’re fully committed to Solana. That’s where the magic happens, giving you the most integrated experience available.",
    },
    {
      question: "How much does it cost?",
      answer:
        "It’s free, man. Dive in and try our Pump.fun token launcher and all our other slick features without dropping a dime.",
    },
  ];

  return (
    <div
      id="faq"
      className="z-[30] flex flex-col items-center justify-start gap-8 px-4 max-w-7xl mx-auto pt-24 pb-0 text-white"
    >
      <SectionHeader
        title="Got Questions? Let's Cut the Crap."
        description="Here are the no-nonsense answers about Brainpower and how it’s set to transform your Solana experience."
        titleSize="md"
      />

      <div className="w-full max-w-3xl bg-[#1a1a1a] backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-white/90 hover:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/70">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
