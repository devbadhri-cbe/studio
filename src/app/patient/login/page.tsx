
import { redirect } from 'next/navigation';

// This page is deprecated and redirects to the new unified dashboard page.
export default function DeprecatedLoginPage() {
  redirect('/patient/dashboard');
}
