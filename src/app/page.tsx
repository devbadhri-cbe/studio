
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // Redirect to the new developer home dashboard.
  redirect('/dashboard');
}
