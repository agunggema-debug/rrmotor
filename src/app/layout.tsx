import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { AuthProvider } from "@/components/auth-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RR MOTOR — Bengkel Digital Generasi Muda",
  description: "Platform layanan & komunitas bengkel motor modern: smart booking, live progress transparan, modif corner, dan RR Points.",
  icons: [{ rel: "icon", url: "/images/rrmotor.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Patch sessionStorage access to suppress SecurityError in cross-origin contexts.
            Google OAuth iframe internally tries to read window.sessionStorage which throws
            when third-party cookies are blocked or in private browsing. This catches the error
            at the source before it becomes an unhandled rejection. */}
        <script
          dangerouslySetInnerHTML={{
            __html: [
              "(function(){",
              "var proto = window.Window ? Window.prototype : Object.getPrototypeOf(window);",
              "['sessionStorage','localStorage'].forEach(function(k){",
              "try{",
              "var d=Object.getOwnPropertyDescriptor(proto,k);",
              "if(d&&d.get){",
              "var orig=d.get;",
              "Object.defineProperty(proto,k,{",
              "get:function(){try{return orig.call(this)}catch(e){return null}},",
              "configurable:true,",
              "enumerable:true",
              "});",
              "}",
              "}catch(e){}",
              "});",
              "window.addEventListener('unhandledrejection',function(e){",
              "if(e.reason&&e.reason.name==='SecurityError'&&",
              "typeof e.reason.message==='string'&&",
              "e.reason.message.indexOf('sessionStorage')!==-1){",
              "e.preventDefault();",
              "}",
              "});",
              "})();",
            ].join(""),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}