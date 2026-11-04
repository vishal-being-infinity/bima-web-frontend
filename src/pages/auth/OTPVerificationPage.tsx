import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { BrandLogo } from '../../components/layout/BrandLogo';
import { ChevronLeft } from 'lucide-react';

export function OTPVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = (location.state as { phone?: string })?.phone ?? '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) { setError('Enter the 6-digit OTP'); return; }
    setError('');
    setLoading(true);

    try {
      if (!window.confirmationResult) throw new Error('Session expired. Go back and retry.');
      await window.confirmationResult.confirm(otp);
      // onAuthStateChanged in AuthContext will handle routing
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22] flex items-start justify-center px-6 pt-10">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <BrandLogo size="lg" />
        </div>

        <div className="bg-white dark:bg-[#1A1D24] rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-semibold text-[#6B7280] dark:text-[#7A8499] mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <h2 className="text-2xl font-extrabold tracking-tight text-[#0C0E14] dark:text-white mb-1">
            Verify your number
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#7A8499] mb-7">
            OTP sent to <span className="font-semibold text-[#0C0E14] dark:text-white">{phone}</span>
          </p>

          {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

          {/* OTP boxes */}
          <div className="flex gap-3 justify-between mb-7" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`
                  w-12 h-14 rounded-2xl text-center text-xl font-bold
                  bg-[#F7F8FC] dark:bg-[#232733]
                  text-[#0C0E14] dark:text-white
                  border-2 outline-none transition-colors
                  ${d ? 'border-[#B5E82C]' : 'border-transparent focus:border-[#B5E82C]'}
                `}
              />
            ))}
          </div>

          <Button fullWidth loading={loading} onClick={handleVerify}>
            Verify & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
