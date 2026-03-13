import { ColorProvider } from "@/contexts/ColorContext";
import { PageProvider } from "@/contexts/PageContext"
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['500', '700']
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.className}>
      <body style={{margin: 0, padding: 0 }}>
        <ColorProvider>
          <PageProvider>{children}</PageProvider>
        </ColorProvider>
      </body>
    </html>
  );
}
