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
        "Brainpower is your AI employee for Solana that's organized into specialized agents, each built to handle specific crypto operations like token launches, analysis, staking, and trading.",
    },
    {
      question: "How does it work?",
      answer:
        "Simply chat with our AI agents in plain English. Whether you want to launch a token, analyze contracts, or manage liquidity, our agents understand your intent and execute the necessary actions.",
    },
    {
      question: "Is it secure?",
      answer:
        "Yes, we prioritize security. Our guardrails prevent common mistakes and protect against sketchy contracts. All transactions require your explicit approval.",
    },
    {
      question: "Do I need to be a crypto expert?",
      answer:
        "Not at all! Brainpower is designed for everyone. Use plain English commands, and our teach mode explains everything in simple terms.",
    },
    {
      question: "What chains are supported?",
      answer:
        "Currently, we focus exclusively on Solana to provide the best possible experience and deepest integration with the ecosystem.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Contact us for pricing details. We offer flexible plans suitable for both individual traders and professional teams.",
    },
  ];

  return (
    <div
      id="faq"
      className="z-[30] flex flex-col items-center justify-start gap-8 px-4 max-w-7xl mx-auto pt-24 pb-0"
    >
      <SectionHeader
        title="Let's Answer Your Questions"
        description="Everything you need to know about Brainpower and how it can transform your Solana experience."
        titleSize="md"
      />

      <div className="w-full max-w-3xl bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-destructive/20">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
