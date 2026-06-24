import { Suspense } from "react";
import RegisterPage from "./RegisterForm";

import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Register");
  return (
    <Suspense fallback={<div className="py-20 text-center">{t("loading")}</div>}>
      <RegisterPage />
    </Suspense>
  );
}
