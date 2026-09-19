import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useReveal } from "@/hooks/reveal";

export function FAQ() {
  const { t } = useTranslation();
  const revealRef = useReveal<HTMLElement>({ y: 26, step: 70, duration: 800 });

  const entries = [
    { id: "free", question: t("pages:landing.faqFreeQuestion"), answer: t("pages:landing.faqFreeAnswer") },
    { id: "scope", question: t("pages:landing.faqScopeQuestion"), answer: t("pages:landing.faqScopeAnswer") },
    { id: "import", question: t("pages:landing.faqImportQuestion"), answer: t("pages:landing.faqImportAnswer") },
    { id: "leave", question: t("pages:landing.faqLeaveQuestion"), answer: t("pages:landing.faqLeaveAnswer") },
    {
      id: "self-host",
      question: t("pages:landing.faqSelfHostQuestion"),
      answer: t("pages:landing.faqSelfHostAnswer"),
    },
  ];

  return (
    <section ref={revealRef} className="py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 data-reveal className="anim-hidden mb-3 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {t("pages:landing.faqTitle")}
          </h2>
          <p data-reveal className="anim-hidden text-muted-foreground text-balance">
            {t("pages:landing.faqDescription")}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {entries.map((entry) => (
            <AccordionItem
              key={entry.id}
              value={entry.id}
              data-reveal
              className="anim-hidden border-border/60 px-1 transition-colors duration-300 hover:border-primary/40"
            >
              <AccordionTrigger className="text-base no-underline hover:no-underline data-[state=open]:text-primary">
                {entry.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {entry.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
