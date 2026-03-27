import { Outfit } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata = {
  title: "Pingly - Chat App",
  description: "Real-time messaging application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased font-sans`}>
        <AuthProvider>
          {children}
          <ToastContainer 
            position="bottom-left"
            autoClose={3000}
            theme="dark"
            toastStyle={{ backgroundColor: "#202c33", color: "#e9edef", borderRadius: "8px" }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}