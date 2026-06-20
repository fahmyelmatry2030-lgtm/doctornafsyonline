"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src/data/settings.json");

export type SiteSettings = {
  commission: number;
  minPrice: number;
  maxPrice: number;
  sessionDuration: number;
  platformName: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  allowNewTherapists: boolean;
  allowNewPatients: boolean;
  maintenanceMode: boolean;
  emailOnBooking: boolean;
  emailOnCancel: boolean;
  smsEnabled: boolean;
  twoFactor: boolean;
  sessionTimeout: number;
  stripeKey: string;
  livekitKey: string;
  livekitUrl: string;
  walletVodafone?: string;
  walletInstapay?: string;
  bankAccount?: string;
};

const defaultSettings: Omit<SiteSettings, "stripeKey" | "livekitKey" | "livekitUrl"> & { stripeKey?: string; livekitKey?: string; livekitUrl?: string } = {
  commission: 20,
  minPrice: 100,
  maxPrice: 1000,
  sessionDuration: 50,
  platformName: "دكتور نفسي",
  heroTitle: "رعاية نفسية متخصصة في متناول يدك",
  heroSubtitle: "تواصل مع أفضل الأخصائيين النفسيين المعتمدين من راحة منزلك، عبر جلسات فيديو آمنة وسرية.",
  contactEmail: "support@doctornafsyonline.com",
  allowNewTherapists: true,
  allowNewPatients: true,
  maintenanceMode: false,
  emailOnBooking: true,
  emailOnCancel: true,
  smsEnabled: false,
  twoFactor: false,
  sessionTimeout: 30,
  walletVodafone: "01010423661",
  walletInstapay: "01010423661@instapay",
  bankAccount: "البنك الأهلي المصري - حساب رقم 1234567890123456",
};

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح لك بالقيام بهذا الإجراء. الصلاحية مطلوبة.");
  }
}

export async function getSettings(): Promise<SiteSettings> {
  // We don't verifyAdmin here because some public/patient pages may need platformName or sessionDuration
  let settings: any = {};
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, "utf8");
    settings = JSON.parse(data);
  } catch {
    try {
      await fs.mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true });
      await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(defaultSettings, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to write default settings file:", e);
    }
    settings = { ...defaultSettings };
  }

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  // Always bind credentials from environment variables for maximum security, but only expose to Super Admin
  return {
    ...settings,
    stripeKey: isAdmin ? (process.env.STRIPE_SECRET_KEY || settings.stripeKey || "sk_test_***") : "sk_test_***",
    livekitKey: isAdmin ? (process.env.LIVEKIT_API_SECRET || settings.livekitKey || "lk_secret_***") : "lk_secret_***",
    livekitUrl: process.env.LIVEKIT_URL || settings.livekitUrl || "wss://your-livekit.livekit.cloud",
  };
}

export async function updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  await verifyAdmin();
  const current = await getSettings();
  
  // Extract sensitive keys so we do NOT save them to the JSON file
  const { stripeKey, livekitKey, livekitUrl, ...savableSettings } = settings;
  const { stripeKey: cS, livekitKey: cL, livekitUrl: cU, ...currentSavable } = current;

  const updatedSavable = { ...currentSavable, ...savableSettings };
  
  await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updatedSavable, null, 2), "utf8");
  
  revalidatePath("/admin/settings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/operations");
  
  return {
    ...updatedSavable,
    stripeKey: process.env.STRIPE_SECRET_KEY || stripeKey || current.stripeKey,
    livekitKey: process.env.LIVEKIT_API_SECRET || livekitKey || current.livekitKey,
    livekitUrl: process.env.LIVEKIT_URL || livekitUrl || current.livekitUrl,
  };
}

const CONTENT_FILE_PATH = path.join(process.cwd(), "src/data/website_content.json");

export type WebsiteContent = {
  homeHeroBadge: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutContent: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;

  // Therapists / Booking
  therapistsHeroBadge?: string;
  therapistsHeroTitle?: string;
  therapistsHeroTitleGradient?: string;
  therapistsHeroSubtitle?: string;
  therapistsFilterTitle?: string;

  // How it works
  howItWorksHeroBadge?: string;
  howItWorksHeroTitle?: string;
  howItWorksHeroSubtitle?: string;
  howItWorksTimelineTitle?: string;
  howItWorksTimelineDesc?: string;
  howItWorksSteps?: Array<{ title: string; description: string; number: string }>;
  howItWorksFeatures?: Array<{ title: string; description: string; icon: string }>;
  howItWorksTimelineItems?: Array<{ title: string; time: string; desc: string }>;

  // FAQ
  faqHeroBadge?: string;
  faqHeroTitle?: string;
  faqHeroSubtitle?: string;
  faqCategories?: Array<{ name: string; icon: string; color: string }>;
  faqItems?: Array<{ question: string; answer: string; category: string }>;

  // Terms
  termsHeroTitle?: string;
  termsHeroSubtitle?: string;
  termsLastUpdated?: string;
  termsSections?: Array<{ title: string; body: string; number: string; iconName: string }>;

  // Privacy
  privacyHeroTitle?: string;
  privacyHeroSubtitle?: string;
  privacyLastUpdated?: string;
  privacySections?: Array<{ title: string; body: string; number: string; iconName: string }>;
};

const defaultContent: WebsiteContent = {
  homeHeroBadge: "رعاية نفسية مبسطة بثقة وخصوصية",
  homeHeroTitle: "الدعم النفسي الذي تحتاجه الآن مع أخصائيين موثوقين",
  homeHeroSubtitle: "جلسات علاج نفسي عبر الفيديو والصوت والشات، ضمن منصة آمنة وسهلة الاستخدام. السرية والراحة هما الأساس، ونحن معك في كل خطوة.",
  aboutTitle: "من نحن",
  aboutSubtitle: "منصة نفسي للعلاج النفسي والأسري أونلاين",
  aboutContent: "نحن منصة متخصصة تقدم الدعم النفسي والأسري من خلال نخبة من أفضل الأخصائيين المعتمدين. نهدف إلى تقديم الرعاية النفسية بكل سرية وأمان لتسهيل حصولك على المساعدة التي تحتاجها في أي وقت ومن أي مكان.",
  contactPhone: "01012345678",
  contactEmail: "support@doctornafsyonline.com",
  contactAddress: "القاهرة، جمهورية مصر العربية",

  // Therapists / Booking
  therapistsHeroBadge: "نخبة الأخصائيين",
  therapistsHeroTitle: "تحدث مع",
  therapistsHeroTitleGradient: "الخبراء المعتمدين",
  therapistsHeroSubtitle: "نخبة من الأخصائيين النفسيين ذوي الكفاءة العالية، جاهزون لمساعدتك في التغلب على التحديات والمضي قدماً في حياتك.",
  therapistsFilterTitle: "تصفية حسب التخصص",

  // How it works
  howItWorksHeroBadge: "خطة التعافي",
  howItWorksHeroTitle: "6 خطوات بسيطة لرحلة التعافي",
  howItWorksHeroSubtitle: "صممنا رحلتك معنا لتكون سلسلة، بديهية، ومريحة تماماً. من لحظة التسجيل وحتى الجلسة الأولى، كل شيء واضح ومبسط.",
  howItWorksTimelineTitle: "أسرع مما تتخيل",
  howItWorksTimelineDesc: "الجدول الزمني التقديري للبدء في العلاج والاستفادة من خدمات المنصة.",
  howItWorksSteps: [
    {
      number: "1",
      title: "إنشاء الحساب",
      description: "سجل حسابك باستخدام بريدك الإلكتروني أو الحسابات الاجتماعية، ثم أكمل ملفك الشخصي بسهولة في دقائق معدودة لتخصيص تجربتك."
    },
    {
      number: "2",
      title: "استكشاف الأخصائيين",
      description: "تصفح قائمة الأخصائيين المتاحين حسب التخصص، الخبرة، السعر، والتقييمات، واختر الأخصائي الأنسب لاحتياجاتك الخاصة."
    },
    {
      number: "3",
      title: "اختيار نوع الجلسة",
      description: "اختر الطريقة التي تريحك: فيديو (لتواصل بصري كامل)، صوت (لخصوصية أكبر)، أو شات نصي (لمرونة عالية)."
    },
    {
      number: "4",
      title: "حجز الموعد",
      description: "حدد التاريخ والوقت المناسب من الفترات المتاحة لدى الأخصائي واحصل على تأكيد فوري للحجز على بريدك الإلكتروني."
    },
    {
      number: "5",
      title: "دخول الجلسة",
      description: "في الموعد المحدد، ادخل من لوحة تحكمك مباشرة إلى غرفة الجلسة الآمنة والمشفرة بالكامل دون الحاجة لتطبيقات خارجية."
    },
    {
      number: "6",
      title: "المتابعة والدعم",
      description: "تلقى ملاحظات من أخصائيك، تابع تطور حالتك، وتواصل معه باستمرار داخل المنصة لضمان نجاح رحلتك العلاجية."
    }
  ],
  howItWorksFeatures: [
    {
      title: "تجربة سلسة",
      description: "من التسجيل إلى الجلسة، واجهة واحدة مصممة بعناية فائقة لراحتك",
      icon: "⚡"
    },
    {
      title: "أمان كامل",
      description: "تشفير سري وحماية صارمة لبياناتك الشخصية وجلساتك العلاجية",
      icon: "🔒"
    },
    {
      title: "مرونة عالية",
      description: "أنت تتحكم في كل شيء: الأخصائي، الوقت، وحتى نوع التواصل",
      icon: "🎯"
    },
    {
      title: "دعم مستمر",
      description: "نحن معك في كل خطوة مع دعم فني مستمر ومتابعة متواصلة",
      icon: "💬"
    }
  ],
  howItWorksTimelineItems: [
    {
      title: "التسجيل والاختيار",
      time: "5 دقائق",
      desc: "إنشاء حساب واختيار الأخصائي المناسب"
    },
    {
      title: "حجز الموعد",
      time: "دقيقتان",
      desc: "تحديد الوقت المناسب وإتمام الحجز"
    },
    {
      title: "بدء العلاج",
      time: "فوراً",
      desc: "دخول الجلسة في موعدها المحدد"
    }
  ],

  // FAQ
  faqHeroBadge: "الأسئلة الشائعة",
  faqHeroTitle: "كل الإجابات التي تبحث عنها",
  faqHeroSubtitle: "نحن هنا لنزيل أي غموض ولنجعل رحلتك معنا واضحة ومطمئنة من الخطوة الأولى.",
  faqCategories: [
    { name: "الاختيار", icon: "🎯", color: "from-[#6366F1] to-[#8B5CF6]" },
    { name: "الأمان", icon: "🔒", color: "from-[#10B981] to-[#059669]" },
    { name: "الخدمات", icon: "📋", color: "from-[#8B5CF6] to-[#D946EF]" },
    { name: "الجدولة", icon: "📅", color: "from-[#F59E0B] to-[#D97706]" },
    { name: "التسعير", icon: "💰", color: "from-[#EC4899] to-[#E11D48]" },
    { name: "المتابعة", icon: "📞", color: "from-[#0EA5E9] to-[#0284C7]" }
  ],
  faqItems: [
    {
      question: "كيف أختار الأخصائي النفسي الأنسب لحالتي؟",
      answer: "يمكنك استخدام صفحة الأخصائيين وتصفية النتائج بناءً على التخصص الدقيق (مثل القلق، الاكتئاب، أو العلاقات)، سنوات الخبرة، والتكلفة. ننصحك بقراءة النبذة التعريفية لكل أخصائي والاطلاع على تقييمات العملاء السابقين لتتخذ القرار الذي يشعرك بالراحة والثقة.",
      category: "الاختيار"
    },
    {
      question: "هل جلساتي محمية وتتمتع بالسرية التامة؟",
      answer: "بالتأكيد. السرية هي جوهر عملنا. كافة الجلسات تتم داخل بيئتنا المشفرة (تشفير عسكري) ولا نشارك أي تفاصيل مع أي جهة خارجية. يمكنك أيضاً اختيار جلسات نصية أو صوتية إن كنت تفضل عدم الكشف عن هويتك البصرية.",
      category: "الأمان"
    },
    {
      question: "ما هي طرق التواصل المتاحة أثناء الجلسات؟",
      answer: "السرية والراحة أولويتنا. نوفر ثلاث وسائل لتلائم راحتك التامة: جلسات فيديو (لتواصل إنساني مباشر)، جلسات صوتية (لمرونة وخصوصية أعلى)، وجلسات عبر الدردشة النصية (لتوثيق أفكارك بوضوح وفي أي وقت).",
      category: "الخدمات"
    },
    {
      question: "هل يمكنني تعديل موعد الجلسة أو إلغاؤه؟",
      answer: "نتفهم تغير الظروف. يمكنك تعديل موعدك أو إلغاؤه من خلال لوحة التحكم الخاصة بك أو بالتواصل المباشر مع الأخصائي، وذلك بدون أي رسوم إضافية شريطة الإبلاغ قبل الموعد بوقت كافٍ (حسب سياسة الأخصائي الموضحة في حسابه).",
      category: "الجدولة"
    },
    {
      question: "كيف يتم تحديد أسعار الجلسات وهل توجد تكاليف خفية؟",
      answer: "الشفافية مبدأ أساسي لدينا. تختلف التكلفة من أخصائي لآخر بناءً على خبرته وتخصصه، وتبدأ الجلسات من 50 ريال. السعر الذي تراه قبل الحجز هو السعر النهائي، ولا توجد أي رسوم اشتراك أو تكاليف خفية.",
      category: "التسعير"
    },
    {
      question: "هل من الأفضل الاستمرار مع الأخصائي نفسه؟",
      answer: "نعم، يُنصح دائماً بالاستمرار مع نفس الأخصائي لبناء علاقة علاجية مبنية على الثقة والفهم العميق لحالتك. يمكنك بسهولة جدولة جلسات متابعة دورية عبر ملفك الشخصي لضمان استمرارية التقدم والتعافي.",
      category: "المتابعة"
    }
  ],

  // Terms
  termsHeroTitle: "الشروط والأحكام",
  termsHeroSubtitle: "باستخدامك لمنصة دكتور نفسي أونلاين، فأنت توافق على الشروط التالية التي تضمن تجربة آمنة وموثوقة لكافة المستخدمين.",
  termsLastUpdated: "يونيو ٢٠٢٦",
  termsSections: [
    {
      number: "١",
      title: "القبول والتسجيل",
      body: "بالتسجيل في المنصة، فإنك تقر بأنك تستخدم بيانات صحيحة وحقيقية، وأنك مسؤول عن الحفاظ على سرية بيانات الدخول الخاصة بك.",
      iconName: "User"
    },
    {
      number: "٢",
      title: "حقوق المنصة",
      body: "تمتلك منصة دكتور نفسي أونلاين كافة حقوق المحتوى والخدمات المقدمة. لا يجوز نسخ أو إعادة نشر أي محتوى بدون إذن خطي مسبق.",
      iconName: "Shield"
    },
    {
      number: "٣",
      title: "استخدام الخدمة",
      body: "يُمنع استخدام المنصة لأغراض غير قانونية أو مزعجة. يجب احترام سياسة السلوك المهني عند التواصل مع الأخصائيين.",
      iconName: "FileText"
    },
    {
      number: "٤",
      title: "الدفع والاسترداد",
      body: "تتم عمليات الدفع عبر قنوات الدفع المصرح بها داخل المنصة (فودافون كاش، موبينيل كاش، اتصالات كاش، انستاباي، التحويل البنكي). لا يمكن المطالبة باسترداد الأموال بعد بدء الجلسة إلا وفق سياسة الاسترداد الخاصة بالمنصة.",
      iconName: "CreditCard"
    },
    {
      number: "٥",
      title: "مسؤولية المستخدم",
      body: "أنت مسؤول عن المعلومات التي تقدمها أثناء التسجيل أو أثناء الجلسات. احترس من مشاركة أي بيانات حساسة خارج إطار المنصة.",
      iconName: "User"
    },
    {
      number: "٦",
      title: "البيانات والمحتوى",
      body: "المحتوى الطبي والنفسي المقدم في المنصة هو معلومات عامة ولا يغني عن التشخيص الطبي أو النفسي الشخصي.",
      iconName: "Database"
    },
    {
      number: "٧",
      title: "التعديلات والإشعارات",
      body: "نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم الإعلان عن التعديلات عبر الموقع أو البريد الإلكتروني.",
      iconName: "Bell"
    },
    {
      number: "٨",
      title: "القانون المعمول به",
      body: "تخضع هذه الشروط للقوانين السارية في جمهورية مصر العربية، وأي نزاع يتم حله أمام الجهات القضائية المختصة.",
      iconName: "Gavel"
    }
  ],

  // Privacy
  privacyHeroTitle: "سياسة الخصوصية",
  privacyHeroSubtitle: "نحن في منصة دكتور نفسي أونلاين نلتزم بحماية بياناتك واحترام خصوصيتك التامة. خصوصيتك أمانة في عنقنا.",
  privacyLastUpdated: "يونيو ٢٠٢٦",
  privacySections: [
    {
      number: "١",
      title: "البيانات التي نجمعها",
      body: "نجمع بيانات التسجيل الأساسية مثل الاسم والبريد الإلكتروني ورقم الهاتف، بالإضافة إلى المعلومات المتعلقة بالحجز والجلسات لتحسين تجربتك.",
      iconName: "Database"
    },
    {
      number: "٢",
      title: "استخدام البيانات",
      body: "نستخدم بياناتك لتقديم الخدمات، التواصل معك، وإرسال التحديثات والعروض المرتبطة بخدماتنا. لن نشارك بياناتك مع أطراف ثالثة بدون إذن واضح منك.",
      iconName: "Eye"
    },
    {
      number: "٣",
      title: "الأمان والحماية",
      body: "نعتمد على إجراءات أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الضياع، وتشمل التشفير وجدران الحماية وبروتوكولات HTTPS.",
      iconName: "Lock"
    },
    {
      number: "٤",
      title: "ملفات تعريف الارتباط",
      body: "قد نستخدم ملفات تعريف الارتباط لتحسين تجربتك داخل المنصة وتحليل أداء الموقع. يمكنك تعديل تفضيلات المتصفح للتحكم في هذه الملفات.",
      iconName: "Cookie"
    },
    {
      number: "٥",
      title: "مشاركة المعلومات",
      body: "نشارك البيانات فقط مع مقدمي الخدمات الضروريين لتشغيل الموقع أو عند طلب قانوني. لا نبيع بياناتك لأي جهة تحت أي ظرف.",
      iconName: "Share2"
    },
    {
      number: "٦",
      title: "حقوقك",
      body: "يمكنك طلب الاطلاع على بياناتك أو تعديلها أو حذفها. نعمل على احترام طلباتك ضمن الأطر القانونية المعمول بها، وسنرد خلال ٣٠ يوماً.",
      iconName: "UserCheck"
    },
    {
      number: "٧",
      title: "تحديثات السياسة",
      body: "قد نقوم بتحديث هذه السياسة من وقت لآخر. سنقوم بإعلامك بأي تغييرات مهمة عبر الموقع أو البريد الإلكتروني قبل تطبيقها.",
      iconName: "RefreshCw"
    },
    {
      number: "٨",
      title: "كيفية الاتصال بنا",
      body: "لأي سؤال حول سياسة الخصوصية، يرجى التواصل معنا عبر support@doctornafsyonline.com أو الهاتف 01010423661. فريقنا جاهز للإجابة.",
      iconName: "Mail"
    }
  ]
};

export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const data = await fs.readFile(CONTENT_FILE_PATH, "utf8");
    const parsed = JSON.parse(data);
    // Merge parsed content with default content to guarantee all sections exist
    return { ...defaultContent, ...parsed };
  } catch {
    try {
      await fs.mkdir(path.dirname(CONTENT_FILE_PATH), { recursive: true });
      await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(defaultContent, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to write default website content file:", e);
    }
    return { ...defaultContent };
  }
}

export async function updateWebsiteContent(content: Partial<WebsiteContent>): Promise<WebsiteContent> {
  await verifyAdmin();
  const current = await getWebsiteContent();
  const updated = { ...current, ...content };
  await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(updated, null, 2), "utf8");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/therapists");
  revalidatePath("/how-it-works");
  revalidatePath("/faq");
  revalidatePath("/terms");
  revalidatePath("/privacy");
  revalidatePath("/admin/settings");
  return updated;
}

