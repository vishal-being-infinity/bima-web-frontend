import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { BrandLogo } from '../../components/layout/BrandLogo';
import { Button } from '../../components/ui/Button';
import { MonitorSmartphone } from 'lucide-react';

interface Props { message: string | null; }

export function SessionConflictPage({ message }: Props) {
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22] flex items-start justify-center px-6 pt-10">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <BrandLogo size="lg" noLink />
        </div>

        <div className="bg-white dark:bg-[#1A1D24] rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center mb-5">
            <MonitorSmartphone className="w-7 h-7 text-[#FF6B6B]" />
          </div>

          <h2 className="text-[22px] font-extrabold tracking-tight text-[#0C0E14] dark:text-white mb-2">
            Session already active
          </h2>

          <p className="text-[14px] text-[#6B7280] dark:text-[#7A8499] leading-relaxed mb-7">
            {message ?? 'You already have an active session on another device. Log out there before signing in here.'}
          </p>

          <Button fullWidth variant="danger" onClick={handleSignOut}>
            Sign out & try again
          </Button>
        </div>
      </div>
    </div>
  );
}
