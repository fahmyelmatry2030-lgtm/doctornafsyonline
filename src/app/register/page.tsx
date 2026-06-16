import { Suspense } from "react";
import RegisterPage from "./RegisterForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-20 text-center">جاري التحميل...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
