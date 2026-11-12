// hooks/useVerifyOTP.ts
import { useState } from 'react';
import { otpService } from '../services/otpService.jsx'
import { tokenStorage } from '../utils/tokenStorage.js';
import { errorLog, log } from '../utils/loggers.js';

export const useVerifyOtp = (purpose, onSuccess) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyOTP = async (email, otp) => {
    setError(null);
    setLoading(true);

    try {
      const result = await otpService.verifyOTP(email, otp, purpose);

      if (result.success) { 
        const { resetToken, expiresAt } = result.data;
        log("Reset Token:", resetToken)
        log("Expires at", expiresAt)

        // Store tokens with purpose-based keys
        await tokenStorage.save(purpose, resetToken, expiresAt)

        // Call success callback for routing / side effects
        onSuccess(result.data);
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      errorLog(err);
    } finally {
      setLoading(false);
    }
  };

  return { verifyOTP, error, loading, clearError: () => setError(null) };
};