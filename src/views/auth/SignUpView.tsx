'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLayout from '@/components/layouts/AuthLayout'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'

// Country codes with flags for phone number input
const countryCodes = [
  { code: '+237', country: 'CM', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+225', country: 'CI', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
  { code: '+221', country: 'SN', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+226', country: 'BF', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+241', country: 'GA', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', country: 'CG', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', country: 'CD', flag: '🇨🇩', name: 'RD Congo' },
  { code: '+229', country: 'BJ', flag: '🇧🇯', name: 'Bénin' },
  { code: '+235', country: 'TD', flag: '🇹🇩', name: 'Tchad' },
]

const SignUpView: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    
    const [formData, setFormData] = useState({
        userType: '',
        name: '',
        age: '',
        phoneNumber: '',
        selectedCountryCode: '+237', // Default to Cameroon
        email: '',
        password: '',
        acceptTerms: false,
        inviteCode: '' // Add invite code field
    })
    
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const [showInviteCode, setShowInviteCode] = useState(false)
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] = useState(false)

    // Check for invite code in URL params on component mount
    useEffect(() => {
        const refCode = searchParams.get('ref')
        if (refCode) {
            setFormData(prev => ({ ...prev, inviteCode: refCode }))
            setShowInviteCode(true)
        }
    }, [searchParams])

    // Watch for user authentication and redirect when Google sign-in completes
    useEffect(() => {
        if (user && isGoogleSignInInProgress) {
            console.log('Google sign-in completed, redirecting user...')
            const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
            router.push(callbackUrl || '/')
            setIsGoogleSignInInProgress(false)
        }
    }, [user, isGoogleSignInInProgress, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData({
            ...formData,
            [name]: checked
        })

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const handleCountryCodeChange = (code: string) => {
        setFormData({
            ...formData,
            selectedCountryCode: code
        })
        setShowCountryDropdown(false)
    }

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {}

        // Validate user type
        if (!formData.userType) {
            newErrors.userType = 'Veuillez choisir une option'
        }

        // Validate full name
        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis'
        }

        // Validate age
        if (!formData.age) {
            newErrors.age = "L'âge est requis"
        } else if (parseInt(formData.age) < 18) {
            newErrors.age = 'Vous devez avoir au moins 18 ans'
        }

        // Validate phone number
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Le numéro de téléphone est requis'
        } else if (!/^\d{9,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Numéro de téléphone invalide'
        }

        // Validate email (optional)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email invalide'
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        }

        // Validate terms acceptance
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Vous devez accepter les conditions générales'
        }

        // Validate invite code (optional, but if provided should be valid format)
        if (formData.inviteCode && formData.inviteCode.length < 3) {
            newErrors.inviteCode = 'Code d\'invitation invalide'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const prepareSubmissionData = () => {
        const { selectedCountryCode, email, ...restFormData } = formData;
        return {
            ...restFormData,
            age: parseInt(formData.age),
            countryCode: selectedCountryCode,
            phoneNumber: `${selectedCountryCode}${formData.phoneNumber}`,
            // Include invite code if provided
            ...(formData.inviteCode && formData.inviteCode !== ''  && { inviteCode: formData.inviteCode }),
            ...(email && email !== ''  && { email: email })
        }
    }

    const redirectAfterRegistration = () => {
        // If user provided email, redirect to email verification
        if (formData.email && formData.email.trim() !== '') {
            router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
        } else {
            // If no email provided, redirect to phone verification page
            router.push(`/auth/verify-phone?phone=${encodeURIComponent(formData.phoneNumber)}&countryCode=${encodeURIComponent(formData.selectedCountryCode)}`)
        }
    }

    const handleRegistrationError = async (error: unknown) => {
        console.error('Error creating account:', error)
        const apiError = error as { response?: { data?: { message?: string } } }
        
        // Don't let invite code errors block registration
        if (apiError.response?.data?.message?.includes('invite')) {
            try {
                const { selectedCountryCode, ...restFormData } = formData;
                const dataWithoutInvite = {
                    ...restFormData,
                    age: parseInt(formData.age),
                    countryCode: selectedCountryCode,
                    phoneNumber: `${selectedCountryCode}${formData.phoneNumber}`
                }
                await apiClient.post('/auth/register', dataWithoutInvite)
                
                redirectAfterRegistration()
                return
            } catch (retryError) {
                // Show original error if retry also fails
                console.error('Retry registration failed:', retryError)
            }
        }
        
        if (apiError.response?.data?.message) {
            setErrors({ ...errors, form: apiError.response.data.message })
        } else {
            setErrors({ ...errors, form: "Une erreur s'est produite. Veuillez réessayer." })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            // Prepare data with properly formatted values
            const dataToSubmit = prepareSubmissionData()
            
            // Include invite code as query parameter if present
            const queryParams = formData.inviteCode ? `?ref=${formData.inviteCode}` : ''
            await apiClient.post(`/auth/register${queryParams}`, dataToSubmit)

            redirectAfterRegistration()
        } catch (error) {
            await handleRegistrationError(error)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle successful Google sign in with invite code
    const handleSignInSuccess = () => {
        console.log('Google sign-in initiated, setting up redirect...')
        setIsGoogleSignInInProgress(true)
        
        // Include invite code in Google OAuth flow if present
        if (formData.inviteCode) {
            // Store invite code in cookies for Google OAuth callback
            document.cookie = `pendingInviteCode=${encodeURIComponent(formData.inviteCode)}; path=/; max-age=600`
        }
    }

    const handleSignInError = (error: unknown) => {
        console.error('Sign in error:', error)
    }

    return (
        <AuthLayout
            title="Inscription sur YamoZone"
            subtitle="Créez votre compte pour commencer"
            showBackButton={true}
        >
            {/* Show invite code notification if present */}
            {formData.inviteCode && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-700 dark:text-green-300 text-center">
                        {"🎉 Vous utilisez le code d'invitation:"} <strong>{formData.inviteCode}</strong>
                    </p>
                </div>
            )}

            <GoogleSignInButton
                onSuccess={handleSignInSuccess}
                onError={handleSignInError}
                className="mb-6"
                inviteCode={formData.inviteCode} // Pass invite code to Google button
            />

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Show form-wide errors if any */}
                {errors.form && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {errors.form}
                    </div>
                )}
                
                {/* User Type */}
                <div>
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vous êtes: <span className="text-primary-500">*</span>
                        </legend>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.userType === 'homme'
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                        }`}>
                            <input
                                type="radio"
                                name="userType"
                                value="homme"
                                className="sr-only"
                                checked={formData.userType === 'homme'}
                                onChange={handleChange}
                            />
                            <span>Homme</span>
                        </label>

                        <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.userType === 'femme'
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                        }`}>
                            <input
                                type="radio"
                                name="userType"
                                value="femme"
                                className="sr-only"
                                checked={formData.userType === 'femme'}
                                onChange={handleChange}
                            />
                            <span>Femme</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                        <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.userType === 'couple'
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                        }`}>
                            <input
                                type="radio"
                                name="userType"
                                value="couple"
                                className="sr-only"
                                checked={formData.userType === 'couple'}
                                onChange={handleChange}
                            />
                            <span>Couple</span>
                        </label>

                        <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-colors ${
                            formData.userType === 'autres'
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                        }`}>
                            <input
                                type="radio"
                                name="userType"
                                value="autres"
                                className="sr-only"
                                checked={formData.userType === 'autres'}
                                onChange={handleChange}
                            />
                            <span>Autres</span>
                        </label>
                    </div>

                    {errors.userType && <p className="text-sm text-red-600 mt-1">{errors.userType}</p>}
                    </fieldset>
                </div>

                {/* Full Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom & Prénom <span className="text-primary-500">*</span>
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Entrez votre nom"
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                {/* Age */}
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Age <span className="text-primary-500">*</span>
                    </label>
                    <select
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                    >
                        <option value="">Choisissez votre âge</option>
                        {Array.from({ length: 63 }, (_, i) => i + 18).map(age => (
                            <option key={age} value={age.toString()}>{age} ans</option>
                        ))}
                    </select>
                    {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age}</p>}
                </div>                {/* Phone Number */}
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Numéro de téléphone <span className="text-primary-500">*</span>
                    </label>
                    <div className="flex">
                        {/* Country Code Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                className="flex items-center h-full px-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-l-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <span className="mr-1">
                                    {countryCodes.find(c => c.code === formData.selectedCountryCode)?.flag}
                                </span>
                                <span>{formData.selectedCountryCode}</span>
                                <span className="ml-1">▼</span>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showCountryDropdown && (
                                <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black/5 max-h-60 overflow-y-auto">
                                    <div className="py-1">
                                        {countryCodes.map((country) => (
                                            <button
                                                key={country.code}
                                                type="button"
                                                onClick={() => handleCountryCodeChange(country.code)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-left"
                                            >
                                                <span className="mr-2">{country.flag}</span>
                                                <span className="mr-2">{country.code}</span>
                                                <span>{country.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Phone Input */}
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="flex-1 px-4 py-3 rounded-r-lg border border-gray-300 dark:border-gray-700 border-l-0 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Entrez votre numéro"
                        />
                    </div>
                    {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-gray-400">(facultatif)</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Entrez votre email"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💡 Si vous ajoutez votre email, vous recevrez le code de vérification par email au lieu de SMS
                    </p>
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mot de passe <span className="text-primary-500">*</span>
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Entrez un mot de passe"
                    />
                    {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                </div>

                {/* Invite Code Section - Add before Terms & Conditions */}
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {"Code d'invitation (optionnel)"}
                        </label>
                        {!showInviteCode && !formData.inviteCode && (
                            <button
                                type="button"
                                onClick={() => setShowInviteCode(true)}
                                className="text-sm text-primary-600 hover:text-primary-500"
                            >
                                {"J'ai un code"}
                            </button>
                        )}
                    </div>
                    {(showInviteCode || formData.inviteCode) && (
                        <div className="mt-1 relative">
                            <input
                                id="inviteCode"
                                name="inviteCode"
                                type="text"
                                value={formData.inviteCode}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Entrez le code d'invitation"
                            />
                            {formData.inviteCode && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="material-icons text-green-500 text-sm">check_circle</span>
                                </div>
                            )}
                        </div>
                    )}
                    {errors.inviteCode && <p className="text-sm text-red-600 mt-1">{errors.inviteCode}</p>}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="acceptTerms" className="text-gray-700 dark:text-gray-300">
                            J&apos;accepte les <Link href="/terms" className="text-primary-500 hover:underline">conditions générales</Link> et la <Link href="/privacy" className="text-primary-500 hover:underline">politique de confidentialité</Link>
                        </label>
                        {errors.acceptTerms && <p className="text-sm text-red-600 mt-1">{errors.acceptTerms}</p>}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <span className="material-icons animate-spin mr-2 text-sm">autorenew</span>
                                <span>Traitement...</span>
                            </div>
                        ) : "S'inscrire"}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Déjà un compte? <Link href="/auth/signin" className="text-primary-500 hover:underline">Se connecter</Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    )
}

export default SignUpView
