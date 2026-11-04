import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Hash, ChevronDown } from 'lucide-react';
import { registerProfile } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { BrandLogo } from '../../components/layout/BrandLogo';
import { useAuth } from '../../contexts/AuthContext';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { reload } = useAuth();
  const [form, setForm] = useState({ fullName: '', gender: '', collegeName: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    const { fullName, gender, collegeName, rollNumber } = form;
    if (!fullName || !gender || !collegeName || !rollNumber) {
      setError('All fields are required'); return;
    }
    setError('');
    setLoading(true);
    try {
      await registerProfile({ fullName, gender, collegeName, rollNumber });
      await reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22] flex items-start justify-center px-6 pt-10 pb-10">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <BrandLogo size="lg" showTagline />
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 justify-center mb-8">
          {[0, 1].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-[#B5E82C]' : s < step ? 'w-2 bg-[#B5E82C]' : 'w-2 bg-[#E5E7EB] dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-[#1A1D24] rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0C0E14] dark:text-white mb-1">
            Complete your profile
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#7A8499] mb-7">
            {step === 0 ? 'Tell us about yourself' : 'Academic details'}
          </p>

          {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

          {step === 0 ? (
            <div className="flex flex-col gap-5">
              <Input
                label="Full name"
                placeholder="Vishal Kumar"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                prefix={<User className="w-4 h-4" />}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#6B7280] dark:text-[#7A8499]">Gender</label>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={(e) => set('gender', e.target.value)}
                    className="w-full rounded-[18px] px-5 py-[17px] text-sm font-medium bg-white dark:bg-[#232733] text-[#0C0E14] dark:text-white border border-transparent focus:border-[#B5E82C] outline-none appearance-none transition-colors"
                  >
                    <option value="" disabled>Select gender</option>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                </div>
              </div>

              <Button fullWidth onClick={() => {
                if (!form.fullName || !form.gender) { setError('Fill all fields'); return; }
                setError(''); setStep(1);
              }}>
                Continue →
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <Input
                label="College / Institute name"
                placeholder="IIT Delhi"
                value={form.collegeName}
                onChange={(e) => set('collegeName', e.target.value)}
                prefix={<Building2 className="w-4 h-4" />}
              />
              <Input
                label="Roll number"
                placeholder="2021CS001"
                value={form.rollNumber}
                onChange={(e) => set('rollNumber', e.target.value)}
                prefix={<Hash className="w-4 h-4" />}
              />

              <div className="flex gap-3">
                <Button variant="ghost" fullWidth onClick={() => setStep(0)}>← Back</Button>
                <Button fullWidth loading={loading} onClick={handleSubmit}>Submit</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
