import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Building2, Hash, Mail, Phone as PhoneIcon, LogOut, Edit2, CheckCircle2, Shield } from 'lucide-react';
import { auth } from '../config/firebase';
import { updateProfile } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ErrorBanner } from '../components/ui/ErrorBanner';

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] dark:bg-white/[0.06] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#6B7280] dark:text-[#7A8499]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#9CA3AF] dark:text-[#4A5568] uppercase tracking-wide">{label}</p>
        <p className="text-[14px] font-semibold text-[#0C0E14] dark:text-white truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, reload } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: user?.fullName ?? '', collegeName: user?.collegeName ?? '', rollNumber: user?.rollNumber ?? '' });
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateProfile(form),
    onSuccess: async () => {
      await reload();
      qc.invalidateQueries({ queryKey: ['my-quizzes'] });
      setEditing(false);
    },
    onError: (e: Error) => setError(e.message),
  });

  const initial = user?.fullName?.[0]?.toUpperCase() ?? 'S';

  return (
    <div className="min-h-full bg-gradient-to-br from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22]">
      <div className="max-w-2xl mx-auto px-5 py-6">

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-[#0C0E14] shadow-[0_8px_32px_rgba(200,255,87,0.35)] mb-4"
            style={{ background: 'linear-gradient(135deg, #C8FF57, #8AE600)' }}
          >
            {initial}
          </div>
          <h1 className="text-xl font-extrabold text-[#0C0E14] dark:text-white tracking-tight">
            {user?.fullName}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            {user?.approved ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Approved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#D97706] bg-[#FFD166]/15 px-2.5 py-1 rounded-full">
                Pending approval
              </span>
            )}
            <span className="text-[11px] font-bold text-[#6B7280] bg-black/[0.05] dark:bg-white/[0.06] px-2.5 py-1 rounded-full capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white dark:bg-[#1A1D24] rounded-[24px] border border-black/[0.05] dark:border-white/[0.06] p-5 mb-4">
          {!editing ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-[1.4px] text-[#6B7280] dark:text-[#7A8499] uppercase">Profile</span>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-[12px] font-bold text-[#4F7A00] dark:text-[#B5E82C]"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
              <InfoRow icon={User} label="Full name" value={user?.fullName ?? ''} />
              <InfoRow icon={Mail} label="Email" value={user?.email ?? ''} />
              <InfoRow icon={PhoneIcon} label="Phone" value={user?.phone ?? ''} />
              <InfoRow icon={Building2} label="College" value={user?.collegeName ?? ''} />
              <InfoRow icon={Hash} label="Roll number" value={user?.rollNumber ?? ''} />
              <InfoRow icon={Shield} label="Gender" value={user?.gender ?? ''} />
            </>
          ) : (
            <div className="flex flex-col gap-4">
              {error && <ErrorBanner message={error} />}
              <Input label="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} prefix={<User className="w-4 h-4" />} />
              <Input label="College" value={form.collegeName} onChange={(e) => setForm((f) => ({ ...f, collegeName: e.target.value }))} prefix={<Building2 className="w-4 h-4" />} />
              <Input label="Roll number" value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} prefix={<Hash className="w-4 h-4" />} />
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setEditing(false)}>Cancel</Button>
                <Button fullWidth loading={isPending} onClick={() => mutate()}>Save</Button>
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <Button
          variant="ghost"
          fullWidth
          onClick={() => { signOut(auth); navigate('/auth/phone'); }}
          className="border border-[#FF6B6B]/20 text-[#FF6B6B]!"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
