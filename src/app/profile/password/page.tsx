import { Metadata } from 'next'
import ChangePasswordView from '@/views/profile/ChangePasswordView'

export const metadata: Metadata = {
  title: 'Changer le mot de passe - yamohub',
  description: 'Modifiez votre mot de passe pour sécuriser votre compte yamohub',
}

export default function PasswordPage() {
  return <ChangePasswordView />
}
