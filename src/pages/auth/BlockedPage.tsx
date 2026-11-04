import { ShieldOff } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Button } from '../../components/ui/Button';

export function BlockedPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0F1117] flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center mx-auto mb-5">
          <ShieldOff className="w-8 h-8 text-[#FF6B6B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0C0E14] dark:text-white mb-2">Account blocked</h2>
        <p className="text-sm text-[#6B7280] dark:text-[#7A8499] mb-8">
          Your account has been suspended. Contact support if you think this is a mistake.
        </p>
        <Button fullWidth variant="ghost" onClick={() => signOut(auth)}>Sign out</Button>
      </div>
    </div>
  );
}
