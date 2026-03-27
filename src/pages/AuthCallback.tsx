import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";

const getHashParams = () => new URLSearchParams(window.location.hash.replace(/^#/, ""));

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirmando acceso...");

  useEffect(() => {
    let isMounted = true;

    const finish = (path: string) => {
      if (!isMounted) return;
      navigate(path, { replace: true });
    };

    const handleAuthCallback = async () => {
      const url = new URL(window.location.href);
      const searchParams = url.searchParams;
      const hashParams = getHashParams();
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash") ?? hashParams.get("token_hash");
      const type = searchParams.get("type") ?? hashParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      try {
        if (code) {
          setMessage("Finishing sign-in...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          setMessage(type === "recovery" ? "Validando enlace de recuperacion..." : "Verificando tu correo...");
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
          });
          if (error) throw error;
        } else if (!accessToken || !refreshToken) {
          throw new Error("Missing auth tokens in callback URL.");
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session?.user) {
          throw new Error("Email verification finished without an active session.");
        }

        if (type === "recovery") {
          toast.success("Enlace de recuperacion valido. Crea tu nueva contrasena.");
          finish("/auth/reset-password");
          return;
        }

        toast.success("Email verificado correctamente.");
        finish("/onboarding");
      } catch (error) {
        console.error("Error completing email verification:", error);
        toast.error(error instanceof Error ? error.message : "We could not verify your email.");
        finish("/auth");
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="app-shell min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass-card w-full max-w-md rounded-2xl border p-8 text-center shadow-xl">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
        <h1 className="text-xl font-semibold">Autenticacion</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
