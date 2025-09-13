
import { redirect } from 'next/navigation';

// This page is deprecated and redirects to the main developer dashboard.
export default function DeprecatedDeveloperDashboard() {
  redirect('/dashboard');
}
