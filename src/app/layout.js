import './globals.css'
import { ThemeProvider } from './theme-context'

export const metadata = {
  title: 'Smart Garden IoT System',
  description: 'Monitor and manage your garden with IoT sensors and automation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
        {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
