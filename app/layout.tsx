import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AccentProvider } from "@/components/accent-provider";
import { Toaster } from "@/components/ui/toast";

// Apply the saved accent to <html> before first paint so there's no flash of the default
// accent. Mirrors next-themes' own anti-FOUC script; key matches ACCENT_STORAGE_KEY.
const accentScript = `(function(){try{var a=localStorage.getItem("koala-accent");if(a)document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`;

// Two typefaces: Inter carries UI + body and the smaller headings h3–h6 (`--font-sans`),
// DM Sans is reserved for the display headings h1–h2 (`--font-heading`, applied in globals.css).
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// DM Sans is a variable font with two axes: weight (100–1000) and optical size
// (opsz 9–40). Pulling in `opsz` lets `font-optical-sizing: auto` (set in
// globals.css) pick the right cut per size, so display titles tighten their letterfit.
// That optical tuning plus the heading-tracking nudge in globals.css is the kerning
// work DM Sans needs to sit well next to Inter body copy.
const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Koala UI - React",
    template: "%s - Koala UI",
  },
  description:
    "A custom React component library and design system, built with Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Anti-FOUC: apply the saved accent to <html> before first paint. next/script
            (beforeInteractive) injects it into the initial HTML without React's inline-script
            warning. */}
        <Script id="koala-accent" strategy="beforeInteractive">
          {accentScript}
        </Script>
        <ThemeProvider>
          <AccentProvider>{children}</AccentProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
