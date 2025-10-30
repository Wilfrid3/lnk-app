'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PhoneSignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error | unknown) => void;
}

const PhoneSignInForm: React.FC<PhoneSignInFormProps> = ({
  onSuccess,
  onError
}) => {
  const { phoneSignIn, verifyPhoneCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let formattedPhoneNumber = phoneNumber;
      // Format phone number if needed
      if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+${formattedPhoneNumber}`;
      }
      
      const vId = await phoneSignIn(formattedPhoneNumber);
      setVerificationId(vId);
      setCodeSent(true);
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Erreur lors de l\'envoi du code. Veuillez vérifier votre numéro et réessayer.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyPhoneCode(verificationId, verificationCode);
      onSuccess?.();
    } catch (err) {
      console.error('Error verifying code:', err);
      setError('Code incorrect. Veuillez réessayer.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!codeSent ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numéro de téléphone
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+33612345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !phoneNumber}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le code'}
          </Button>
          
          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code de vérification
            </label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || verificationCode.length < 4}
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </Button>
          
          <Button 
            type="button"
            variant="ghost"
            className="w-full mt-2"
            onClick={() => setCodeSent(false)}
            disabled={loading}
          >
            Modifier le numéro
          </Button>
        </form>
      )}
    </div>
  );
};

export default PhoneSignInForm;
