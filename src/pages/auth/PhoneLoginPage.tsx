import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';
import { Phone } from 'lucide-react';
import { auth } from '../../config/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { BrandLogo } from '../../components/layout/BrandLogo';

declare global {
  interface Window {
    confirmationResult?: ConfirmationResult;
  }
}

// Module-level singleton — avoids double-render from React StrictMode
let recaptchaVerifier: RecaptchaVerifier | null = null;

function getVerifier(): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
  }
  return recaptchaVerifier;
}

function resetVerifier() {
  try { recaptchaVerifier?.clear(); } catch (_) { /* ignore */ }
  recaptchaVerifier = null;
  // Wipe the DOM node so the next verifier gets a clean anchor
  const el = document.getElementById('recaptcha-container');
  if (el) el.innerHTML = '';
}

export function PhoneLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, getVerifier());
      window.confirmationResult = result;
      navigate('/auth/otp', { state: { phone: formattedPhone } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(msg);
      resetVerifier();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FC] to-[#F2F4F9] dark:from-[#0F1117] dark:to-[#161B22] flex items-start justify-center px-6 pt-10">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <BrandLogo size="lg" showTagline />
        </div>

        <div className="bg-white dark:bg-[#1A1D24] rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0C0E14] dark:text-white mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#7A8499] mb-7">
            Enter your phone number to get started
          </p>

          {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

          <div className="flex flex-col gap-5">
            <Input
              label="Phone number"
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              prefix={<Phone className="w-4 h-4" />}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />

            <Button fullWidth loading={loading} onClick={handleSendOtp}>
              Send OTP
            </Button>
          </div>

          {/* reCAPTCHA disclosure — required when badge is hidden */}
          <p className="text-[11px] text-[#9CA3AF] dark:text-[#4A5568] text-center mt-5 leading-relaxed">
            Protected by reCAPTCHA —{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">Privacy</a>
            {' & '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">Terms</a>
          </p>

          {/* Invisible reCAPTCHA anchor — must stay in DOM */}
          <div id="recaptcha-container" />
        </div>

        <p className="text-center mt-6 text-sm text-[#6B7280] dark:text-[#7A8499]">
          Don't have an account?{' '}
          <span className="text-[#4F7A00] dark:text-[#B5E82C] font-bold cursor-pointer">
            Sign up with phone
          </span>
        </p>
      </div>
    </div>
  );
}
