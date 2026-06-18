import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* الدائرة الدوارة الخارجية */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        
        {/* اللوجو في المنتصف مع تأثير نبض */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden animate-pulse shadow-lg bg-white flex items-center justify-center p-2">
          <Image 
            src="/logo.jpeg" 
            alt="جاري التحميل..." 
            fill 
            className="object-contain p-1"
            priority
          />
        </div>
      </div>
      
      <p className="mt-6 text-indigo-900 font-bold text-xl animate-pulse">
        نَفسي
      </p>
      <p className="mt-1 text-slate-500 text-sm font-medium">
        جاري التحميل...
      </p>
    </div>
  );
}
