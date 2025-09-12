
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // Redirect to the new patient dashboard which handles both login and viewing.
  redirect('/patient/dashboard');
}
