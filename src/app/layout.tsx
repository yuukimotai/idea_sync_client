import type { Metadata } from "next";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { darkTheme } from "@/shared/theme";

export const metadata: Metadata = {
  title: "Idea Sync",
  description: "Collaborative idea management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
