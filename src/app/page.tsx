
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // Redirect to the new doctor/developer dashboard.
  redirect('/doctor/dashboard');
}
