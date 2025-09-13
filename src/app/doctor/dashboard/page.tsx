
// This file is deprecated and can be safely removed.
// The new developer dashboard is located at /dev/dashboard.
import { redirect } from 'next/navigation';

export default function DeprecatedDoctorDashboard() {
  redirect('/dev/dashboard');
}
