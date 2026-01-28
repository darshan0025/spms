import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <nav style={{ padding: "10px", background: "#eee" }}>
          <Link href="/">Home</Link> |{" "}
          <Link href="/login">Login</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
