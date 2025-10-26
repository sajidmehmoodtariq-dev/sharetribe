'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";

export default function Home() {
  const { getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  return (
    <div>
      <div 
        className="min-h-screen flex items-center justify-center"
        style={getBackgroundStyle()}
      >
        <div className="w-full max-w-[390px] mx-auto h-screen flex flex-col">
          {/* Logo at top */}
          <div className="flex justify-center pt-6 pb-6">
            <Image
              src="/logo.png"
              alt="Head Huntd Logo"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </div>

          {/* Hero Image with overlay content */}
          <div className="flex-1 px-4">
            <div className="relative w-full h-full rounded-3xl overflow-hidden">
              {/* Background Image */}
              <Image
                src="/Worker.png"
                alt="Construction workers"
                fill
                className="object-cover"
                priority
              />

              {/* Content Card overlaying bottom of image */}
              <div className={`absolute bottom-0 left-0 right-0 ${getCardClassName()} rounded-t-3xl px-6 pt-6 pb-6 shadow-lg`}>
                <h1 className={`text-[22px] font-bold ${getTextClassName()} mb-3 leading-tight`}>
                  Connect with people<br />across Australia
                </h1>
                <p className={`text-[13px] ${getSubTextClassName()} leading-relaxed mb-6`}>
                  Begin networking with companies across Australia. Browse job listings that match your skills and interests.
                </p>

                {/* Create account button */}
                <Link href="/signup" className="block mb-4">
                  <Button className="w-full bg-[#00D66C] hover:bg-[#00C061] text-black font-semibold h-[50px] text-[15px] rounded-full">
                    Create account
                  </Button>
                </Link>
                
                {/* Login link */}
                <div className="text-center">
                  <span className={`text-sm ${getSubTextClassName()}`}>Already have an account? </span>
                  <Link href="/login/role-selection" className="text-sm font-semibold text-[#00D66C] hover:underline">
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PWAInstallPrompt />
    </div>
  );
}
