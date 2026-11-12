import { useState, useEffect, useRef } from 'react';
import { otpService } from '../services/otpService.jsx';

const COOLDOWN_SECONDS = 60;

export const useResendOtp = (email, purpose) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const timerRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOTP = async () => {
    if (cooldown > 0 || loading) return; // guard against spam

    setError(null);
    setLoading(true);

    try {
      const result = await otpService.requestOTP(email, purpose);

      if (result.success) {
        startCooldown();
      } else {
        setError(result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      errorLog(err);
    } finally {
      setLoading(false);
    }
  };

  return { resendOTP, error, loading, cooldown };
};