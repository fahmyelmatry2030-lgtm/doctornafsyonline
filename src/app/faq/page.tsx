import { getWebsiteContent } from "@/app/admin/settings/actions";
import FAQClient from "./FAQClient";

export default async function FAQPage() {
  const content = await getWebsiteContent();

  const faqHeroBadge = content.faqHeroBadge || "الأسئلة الشائعة";
  const faqHeroTitle = content.faqHeroTitle || "كل الإجابات التي تبحث عنها";
  const faqHeroSubtitle = content.faqHeroSubtitle || "نحن هنا لنزيل أي غموض ولنجعل رحلتك معنا واضحة ومطمئنة من الخطوة الأولى.";

  const defaultCategories = [
    { name: "الاختيار", icon: "🎯", color: "from-[#6366F1] to-[#8B5CF6]" },
    { name: "الأمان", icon: "🔒", color: "from-[#10B981] to-[#059669]" },
    { name: "الخدمات", icon: "📋", color: "from-[#8B5CF6] to-[#D946EF]" },
    { name: "الجدولة", icon: "📅", color: "from-[#F59E0B] to-[#D97706]" },
    { name: "التسعير", icon: "💰", color: "from-[#EC4899] to-[#E11D48]" },
    { name: "المتابعة", icon: "📞", color: "from-[#0EA5E9] to-[#0284C7]" },
  ];

  const defaultFaqs = [
    {
      question: "كيف أختار الأخصائي النفسي الأنسب لحالتي؟",
      answer: "يمكنك استخدام صفحة الأخصائيين وتصفية النتائج بناءً على التخصص الدقيق (مثل القلق، الاكتئاب، أو العلاقات)، سنوات الخبرة، والتكلفة. ننصحك بقراءة النبذة التعريفية لكل أخصائي والاطلاع على تقييمات العملاء السابقين لتتخذ القرار الذي يشعرك بالراحة والثقة.",
      category: "الاختيار",
    },
    {
      question: "هل جلساتي محمية وتتمتع بالسرية التامة؟",
      answer: "بالتأكيد. السرية هي جوهر عملنا. كافة الجلسات تتم داخل بيئتنا المشفرة (تشفير عسكري) ولا نشارك أي تفاصيل مع أي جهة خارجية. يمكنك أيضاً اختيار جلسات نصية أو صوتية إن كنت تفضل عدم الكشف عن هويتك البصرية.",
      category: "الأمان",
    },
    {
      question: "ما هي طرق التواصل المتاحة أثناء الجلسات؟",
      answer: "نوفر ثلاث وسائل لتلائم راحتك التامة: جلسات فيديو (لتواصل إنساني مباشر)، جلسات صوتية (لمرونة وخصوصية أعلى)، وجلسات عبر الدردشة النصية (لتوثيق أفكارك بوضوح وفي أي وقت).",
      category: "الخدمات",
    },
    {
      question: "هل يمكنني تعديل موعد الجلسة أو إلغاؤه؟",
      answer: "نتفهم تغير الظروف. يمكنك تعديل موعدك أو إلغاؤه من خلال لوحة التحكم الخاصة بك أو بالتواصل المباشر مع الأخصائي، وذلك بدون أي رسوم إضافية شريطة الإبلاغ قبل الموعد بوقت كافٍ (حسب سياسة الأخصائي الموضحة في حسابه).",
      category: "الجدولة",
    },
    {
      question: "كيف يتم تحديد أسعار الجلسات وهل توجد تكاليف خفية؟",
      answer: "الشفافية مبدأ أساسي لدينا. تختلف التكلفة من أخصائي لآخر بناءً على خبرته وتخصصه، وتبدأ الجلسات من 50 ريال. السعر الذي تراه قبل الحجز هو السعر النهائي، ولا توجد أي رسوم اشتراك أو تكاليف خفية.",
      category: "التسعير",
    },
    {
      question: "هل من الأفضل الاستمرار مع الأخصائي نفسه؟",
      answer: "نعم، يُنصح دائماً بالاستمرار مع نفس الأخصائي لبناء علاقة علاجية مبنية على الثقة والفهم العميق لحالتك. يمكنك بسهولة جدولة جلسات متابعة دورية عبر ملفك الشخصي لضمان استمرارية التقدم والتعافي.",
      category: "المتابعة",
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
