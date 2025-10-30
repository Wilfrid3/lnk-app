'use client'

import React, {useState, useEffect, useRef} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthLayout from '@/components/layouts/AuthLayout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'
import { User } from '@/types/User'
import { countries } from '@/utils/constants'

export default function VerifyPhoneView() {    const router = useRouter()
    const searchParams = useSearchParams()
    const phoneNumber = searchParams.get('phone') ?? ''
    const countryCode = searchParams.get('countryCode') ?? '+237' // Default to Cameroon code if not provided

    // Function to convert country code to country identifier
    const getCountryFromCode = (code: string): string => {
        const country = countries.find(c => c.code === code)
        return country ? country.countryCode.toUpperCase() : 'CM' // Default to Cameroon if not found
    }

    // OTP input state
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(60)

    // Refs for OTP inputs to easily focus on them
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Timer for resending OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])
    
    const { setUser, setTokens } = useAuth()

    const handleOtpChange = (index: number, value: string) => {
        // Allow only numbers
        if (value && !/^\d+$/.test(value)) return

        const newOtp = [...otp]

        // If pasting a full OTP code
        if (value.length > 1) {
            const pastedOtp = value.split('').slice(0, 6)
            for (let i = 0; i < pastedOtp.length; i++) {
                if (i + index < 6) {
                    newOtp[i + index] = pastedOtp[i]
                }
            }
            setOtp(newOtp)

            // Focus last field if full code pasted
            if (pastedOtp.length + index >= 6) {
                inputRefs.current[5]?.focus()
            } else {
                inputRefs.current[index + pastedOtp.length]?.focus()
            }
            return
        }

        // Handle backspace/delete
        if (value === '') {
            newOtp[index] = ''
            setOtp(newOtp)
            return
        }

        // Set value and move to next input
        newOtp[index] = value
        setOtp(newOtp)

        // Focus next input if available
        if (index < 5 && value) {
            inputRefs.current[index + 1]?.focus()
        }
    }    
    
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // On backspace, clear current field and move to previous if empty
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp]
                newOtp[index - 1] = ''
                setOtp(newOtp)
                inputRefs.current[index - 1]?.focus()
            }
        }

        // Arrow key navigation
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }
    
    const resendOtp = async () => {
        try {
            setIsLoading(true)
            // Call the API to resend OTP with country code
            await apiClient.post('/auth/send-verification', { 
                phoneNumber: phoneNumber,
                countryCode: getCountryFromCode(countryCode)  // Include country identifier in the payload
            })
            
            setCountdown(60)
            setError('') // Clear any previous errors
            
            // Show success message or toast
        } catch (error) {
            console.error('Error resending OTP:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            setError(
                apiError.response?.data?.message || 
                'Failed to resend verification code. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const otpValue = otp.join('')

        if (otpValue.length !== 6) {
            setError('Please enter the complete verification code')
            return
        }

        setIsLoading(true)

        try {            // Call the verification API endpoint
            const response = await apiClient.post('/auth/verify-phone', {
                phoneNumber: countryCode + phoneNumber,
                countryCode: getCountryFromCode(countryCode),
                code: otpValue
            })

            // Extract user data and tokens from the response
            const { user, accessToken, refreshToken } = response.data as {
                user: User;
                accessToken: string;
                refreshToken: string;
            }

            // Save tokens
            setTokens({ accessToken, refreshToken })

            // Update user in context
            setUser(user)

            // Redirect to home or onboarding page
            router.push('/')
        } catch (error) {
            console.error('Error verifying code:', error)
            const apiError = error as { response?: { data?: { message?: string } } }
            setError(
                apiError.response?.data?.message || 
                'Code de vérification invalide. Veuillez réessayer.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Vérification du numéro"
            subtitle={`Veuillez saisir le code à 6 chiffres envoyé au ${countryCode}${phoneNumber}`}
            showBackButton={true}
            backUrl="/auth/signup"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                        Code de vérification
                    </label>
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                        ))}
                    </div>
                    {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                    {countdown > 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Renvoyer le code dans {countdown} secondes
                        </p>
                    ) : (
                        <button
                            type="button"
                            onClick={resendOtp}
                            className="text-primary-500 hover:underline text-sm font-medium"
                        >
                            Renvoyer le code
                        </button>
                    )}
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                                <span>Vérification...</span>
                            </div>
                        ) : "Vérifier"}
                    </button>
                </div>
            </form>
        </AuthLayout>
    )
}
