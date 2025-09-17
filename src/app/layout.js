import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./parallax/parallax.css";
import "./auth/auth.css";
import "./dashboard/dashboard.css";
import "../components/AnimatedComponents.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import NotificationSystem from "@/components/NotificationSystem";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Smart Garden",
  description: "Smart Garden Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <NotificationProvider>
            <Navigation>
              {children}
            </Navigation>
            <NotificationSystem />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 