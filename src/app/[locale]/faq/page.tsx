import { getWebsiteContent } from "@/app/[locale]/admin/settings/actions";
import FAQClient from "./FAQClient";

import { getTranslations } from "next-intl/server";

export default async function FAQPage() {
  const content = await getWebsiteContent();
  const t = await getTranslations("FAQ");

  const faqHeroBadge = content.faqHeroBadge || t("heroBadge");
  const faqHeroTitle = content.faqHeroTitle || t("heroTitle");
  const faqHeroSubtitle = content.faqHeroSubtitle || t("heroSubtitle");

  const defaultCategories = [
    { name: t("catSelection"), icon: "🎯", color: "from-[#6366F1] to-[#8B5CF6]" },
    { name: t("catSecurity"), icon: "🔒", color: "from-[#10B981] to-[#059669]" },
    { name: t("catServices"), icon: "📋", color: "from-[#8B5CF6] to-[#D946EF]" },
    { name: t("catScheduling"), icon: "📅", color: "from-[#F59E0B] to-[#D97706]" },
    { name: t("catPricing"), icon: "💰", color: "from-[#EC4899] to-[#E11D48]" },
    { name: t("catFollowup"), icon: "📞", color: "from-[#0EA5E9] to-[#0284C7]" },
  ];

  const defaultFaqs = [
    {
      question: t("q1"),
      answer: t("a1"),
      category: t("catSelection"),
    },
    {
      question: t("q2"),
      answer: t("a2"),
      category: t("catSecurity"),
    },
    {
      question: t("q3"),
      answer: t("a3"),
      category: t("catServices"),
    },
    {
      question: t("q4"),
      answer: t("a4"),
      category: t("catScheduling"),
    },
    {
      question: t("q5"),
      answer: t("a5"),
      category: t("catPricing"),
    },
    {
      question: t("q6"),
      answer: t("a6"),
      category: t("catFollowup"),
    },
  ];

  const faqItems = content.faqItems && content.faqItems.length > 0 ? content.faqItems : defaultFaqs;
  const faqCategories = content.faqCategories && content.faqCategories.length > 0 ? content.faqCategories : defaultCategories;

  return (
    <FAQClient
      faqHeroBadge={faqHeroBadge}
      faqHeroTitle={faqHeroTitle}
      faqHeroSubtitle={faqHeroSubtitle}
      faqItems={faqItems}
      faqCategories={faqCategories}
    />
  );
}
