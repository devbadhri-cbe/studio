
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // Redirect to the new home dashboard.
  redirect('/dashboard');
}
