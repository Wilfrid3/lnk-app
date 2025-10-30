import { Metadata } from 'next'
import ChangePasswordView from '@/views/profile/ChangePasswordView'

export const metadata: Metadata = {
  title: 'Changer le mot de passe - YamoZone',
  description: 'Modifiez votre mot de passe pour sécuriser votre compte YamoZone',
}

export default function PasswordPage() {
  return <ChangePasswordView />
}
