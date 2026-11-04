import { Clock } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Button } from '../../components/ui/Button';
import { BrandLogo } from '../../components/layout/BrandLogo';

export function WaitingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="mb-8">
          <BrandLogo size="lg" />
        </div>
        <div className="w-16 h-16 rounded-full bg-[#B5E82C]/10 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-[#4F7A00] dark:text-[#B5E82C]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0C0E14] dark:text-white mb-2">Pending approval</h2>
        <p className="text-sm text-[#6B7280] dark:text-[#7A8499] mb-8 leading-relaxed">
          Your account is waiting for admin approval. You'll be notified once approved.
        </p>
        <Button fullWidth variant="ghost" onClick={() => signOut(auth)}>Sign out</Button>
      </div>
    </div>
  );
}
