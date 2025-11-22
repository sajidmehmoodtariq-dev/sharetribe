'use client';

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginRoleSelectionPage() {
  const { theme, getBackgroundStyle, getCardClassName, getTextClassName, getSubTextClassName } = useTheme();
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={getBackgroundStyle()}
    >
      <div className="w-full max-w-[390px] mx-auto h-screen flex flex-col">
        {/* Logo at top */}
        <div className="flex justify-center pt-6 pb-6">
          <Image
            src={theme === 'dark' ? '/logo-light.png' : '/logo-dark.png'}
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
                Are you a Job Hunter or a Head Hunter?
              </p>

              {/* Role Selection Buttons */}
              <div className="space-y-4">
                <Link href="/login?role=job-hunter" className="block">
                  <Button className="w-full bg-[#00D66C] hover:bg-[#00C061] text-black font-semibold h-[50px] text-[15px] rounded-full">
                    Job Hunter
                  </Button>
                </Link>
                
                <Link href="/login?role=head-hunter" className="block">
                  <Button 
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-black hover:bg-gray-50 font-semibold h-[50px] text-[15px] rounded-full"
                  >
                    Head Hunter
                  </Button>
                </Link>
              </div>
              <div className="text-center mt-6">
                <span className={`text-[13px] ${getSubTextClassName()}`}>Don't have an account?{' '}
                  <Link href="/signup" className="underline text-[#00EA72] hover:text-[#00D66C]">Create new account</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}