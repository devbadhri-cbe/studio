
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // Redirect to the patient login/home page, as the doctor dashboard is removed.
  redirect('/patient/login');
}
