"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import Link from "next/link";
import { login } from "@/infrastructure/api/auth_api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      localStorage.setItem("token", result.token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ログインに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <Typography variant="h4">ログイン</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            label="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="パスワード"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </Box>

        <Typography variant="body2">
          アカウントをお持ちでない場合は{" "}
          <Link href="/auth/register">
            <Box component="span" sx={{ color: "#90caf9", cursor: "pointer" }}>
              登録
            </Box>
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
