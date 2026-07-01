import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display sans for the intro name card ("Adam Raman")
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solar-punk-five.vercel.app"),
  title: "Solar Punk Portfolio | Adam M. Raman",
  description: "Adam Raman — Malaysian architect and technologist based in Japan. Expertise in sustainable building design, building energy, IoT/smart homes, BIM, process automation, and AI tools.",
  openGraph: {
    title: "Adam M. Raman — Architect & Technologist",
    description: "Sustainable building design, PhD climate research, AI tools, and 10+ years in the built environment. Portfolio with an AI assistant that knows the whole story.",
    url: "https://solar-punk-five.vercel.app",
    siteName: "Adam M. Raman Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam M. Raman — Architect & Technologist",
    description: "Sustainable building design, PhD climate research, AI tools, and 10+ years in the built environment.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adam M. Raman",
  url: "https://solar-punk-five.vercel.app",
  email: "adam.m.raman@gmail.com",
  jobTitle: "Architect, Building Energy Consultant & AI Developer",
  description: "Malaysian architect and technologist based in Sendai, Japan. Founder of Lakar Design (2012–2022). PhD researcher at Tohoku University specialising in passive desiccant cooling for hot-humid climates. Building Energy Consultant at Refil Japan. Developer of AI tools, smart home systems, and VTuber mocap software.",
  nationality: "Malaysian",
  workLocation: {
    "@type": "Place",
    name: "Sendai, Japan",
  },
  alumniOf: [
    {
      "@type": "EducationalOrganization",
      name: "Tohoku University",
      url: "https://www.tohoku.ac.jp",
    },
    {
      "@type": "EducationalOrganization",
      name: "University of Manchester",
    },
  ],
  knowsAbout: [
    "Sustainable Architecture",
    "Building Energy Engineering",
    "HVAC Design",
    "Passive Cooling",
    "Desiccant Cooling Systems",
    "Smart Home / IoT Systems",
    "BIM (Building Information Modelling)",
    "Interior Design",
    "Design-and-Build Project Management",
    "AI Application Development",
    "Large Language Models",
    "RAG Pipelines",
    "Process Automation",
    "Next.js",
    "React",
    "TypeScript",
    "VTuber Mocap Systems",
  ],
  knowsLanguage: ["English", "Malay", "Japanese"],
  sameAs: [
    "https://github.com/lakar-team",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
