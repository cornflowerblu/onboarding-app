import { OnboardingProvider } from '../context/OnboardingContext';
import './globals.css';

export const metadata = {
  title: 'Employee Onboarding',
  description: 'Complete your onboarding process',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </body>
    </html>
  );
}