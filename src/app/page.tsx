"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 3,
        }}
      >
        <Typography variant="h2" component="h1">
          Idea Sync
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ textAlign: "center" }}>
          Collaborative idea management platform
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/auth/login"
          >
            ログイン
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            href="/auth/register"
          >
            登録
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
