
import { redirect } from 'next/navigation';

// This page is deprecated and redirects to the patient login.
// The main developer/home dashboard is now at /dashboard.
export default function DeprecatedDoctorDashboard() {
  redirect('/patient/login');
}
