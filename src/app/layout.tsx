"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { softTheme } from "@/shared/theme";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body suppressHydrationWarning>
        <ThemeProvider theme={softTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
