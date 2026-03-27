import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, UserPlus, LogIn, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const isEmailRateLimitError = (message: string) =>
  message.toLowerCase().includes("email rate limit exceeded");

const isInvalidCredentialsError = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes("invalid login credentials") || normalized.includes("invalid_credentials");
};

const mapAuthErrorMessage = (message: string) => {
  if (isEmailRateLimitError(message)) {
    return "Hemos alcanzado el limite temporal de envio de correos. Espera unos minutos y revisa tu bandeja (incluido spam) antes de volver a intentar.";
  }

  if (isInvalidCredentialsError(message)) {
    return "Correo o contrasena incorrectos. Si acabas de registrarte, primero confirma tu cuenta desde el correo. Si ya la confirmaste, restablece tu contrasena e intenta nuevamente.";
  }

  return message;
};

const Auth = () => {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [sendingResetEmail, setSendingResetEmail] = useState(false);
    const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState(false);
    const [authErrorMessage, setAuthErrorMessage] = useState("");

    const { user, isGuest, signIn, signUp, resendConfirmationEmail, requestPasswordReset, continueAsGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const allowGuestAuth = Boolean((location.state as { fromGuestSwitch?: boolean } | null)?.fromGuestSwitch);
    const showGuestAccess = false;

    useEffect(() => {
        if (user || (isGuest && !allowGuestAuth)) {
            navigate("/today", { replace: true });
        }
    }, [user, isGuest, allowGuestAuth, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPendingEmailConfirmation(false);
        setAuthErrorMessage("");

        if (mode === "register" && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            if (mode === "login") {
                await signIn(email, password);
                toast.success("Welcome back!");
                navigate("/today", { replace: true });
            } else {
                const { requiresEmailConfirmation } = await signUp(email, password);
                if (requiresEmailConfirmation) {
                    setPendingEmailConfirmation(true);
                    toast.success("Cuenta creada. Revisa tu correo y confirma tu cuenta antes de iniciar sesion.");
                    return;
                }
                toast.success("Account created successfully!");
                navigate("/today", { replace: true });
            }
        } catch (error: unknown) {
            console.error("Auth error:", error);
            const nextMessage = mapAuthErrorMessage(getErrorMessage(error, "Authentication failed."));
            setAuthErrorMessage(nextMessage);
            if (!nextMessage.toLowerCase().includes("desactivada")) {
                toast.error(nextMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        if (!email) {
            toast.error("Enter your email first so we know where to resend the confirmation.");
            return;
        }

        setResendingEmail(true);
        try {
            await resendConfirmationEmail(email);
            toast.success("We sent a new confirmation email.");
        } catch (error: unknown) {
            console.error("Resend confirmation error:", error);
            toast.error(getErrorMessage(error, "We could not resend the confirmation email."));
        } finally {
            setResendingEmail(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Ingresa tu correo para enviarte el enlace de recuperacion.");
            return;
        }

        setSendingResetEmail(true);
        try {
            await requestPasswordReset(email);
            toast.success("Te enviamos un correo para restablecer tu contrasena.");
        } catch (error: unknown) {
            console.error("Password reset error:", error);
            toast.error(mapAuthErrorMessage(getErrorMessage(error, "No se pudo enviar el correo de recuperacion.")));
        } finally {
            setSendingResetEmail(false);
        }
    };

    return (
        <div className="app-shell min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md glass-card animate-in fade-in zoom-in duration-300">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {mode === "login" ? <LogIn className="text-primary w-6 h-6" /> : <UserPlus className="text-primary w-6 h-6" />}
                    </div>
                    <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="login"
                                onClick={() => setAuthErrorMessage("")}
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                onClick={() => setAuthErrorMessage("")}
                            >
                                Register
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <CardTitle className="text-2xl font-bold">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription>
                        {mode === "login"
                            ? "Sign in to your account to continue your fitness journey."
                            : "Join Appfit and start tracking your fitness goals today."}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {authErrorMessage && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Acceso no disponible</AlertTitle>
                                <AlertDescription>{authErrorMessage}</AlertDescription>
                            </Alert>
                        )}
                        {mode === "register" && !pendingEmailConfirmation && (
                            <Alert>
                                <Mail className="h-4 w-4" />
                                <AlertTitle>Importante: confirma tu correo</AlertTitle>
                                <AlertDescription>
                                    Despues de crear tu cuenta, te enviaremos un correo de verificacion. Debes abrir ese correo y hacer clic en el enlace para activar tu cuenta.
                                </AlertDescription>
                            </Alert>
                        )}
                        {pendingEmailConfirmation && (
                            <Alert>
                                <Mail className="h-4 w-4" />
                                <AlertTitle>Cuenta creada: revisa tu correo para activarla</AlertTitle>
                                <AlertDescription>
                                    Te enviamos un enlace de confirmacion a tu email. Abre ese enlace para activar tu cuenta y luego inicia sesion en AppFit.
                                </AlertDescription>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-3 w-full"
                                    onClick={handleResendConfirmation}
                                    disabled={resendingEmail}
                                >
                                    {resendingEmail ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Reenviando correo...
                                        </>
                                    ) : (
                                        "Reenviar correo de confirmacion"
                                    )}
                                </Button>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {mode === "register" && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                mode === "login" ? "Sign in" : "Create account"
                            )}
                        </Button>
                        {mode === "login" && (
                            <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-sm"
                                onClick={handleForgotPassword}
                                disabled={sendingResetEmail || loading}
                            >
                                {sendingResetEmail ? "Enviando correo de recuperacion..." : "Olvide mi contrasena"}
                            </Button>
                        )}
                        {showGuestAccess && (
                            <>
                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        continueAsGuest();
                                        navigate("/today");
                                    }}
                                >
                                    Continue as Guest
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Auth;
