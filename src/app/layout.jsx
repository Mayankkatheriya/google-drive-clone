import "./globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "Disk Drive",
  icons: {
    icon: "/google-logo.png",
  },
  verification: {
    google: "SP1wNhMPVs8vRWq1f3rzq23I0Di3MZ5U-VeJuGJsH-c",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Runs before React hydrates to prevent flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('disk-drive-theme')||'system';var r=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
