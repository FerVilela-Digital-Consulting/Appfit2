import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, UserPlus, LogIn } from "lucide-react";

const Auth = () => {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { signIn, signUp, continueAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === "register" && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            if (mode === "login") {
                await signIn(email, password);
                toast.success("Welcome back!");
            } else {
                await signUp(email, password);
                toast.success("Account created successfully!");
            }
            navigate("/dashboard");
        } catch (error: any) {
            console.error("Auth error:", error);
            toast.error(error.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <Card className="w-full max-w-md glass-card animate-in fade-in zoom-in duration-300">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        {mode === "login" ? <LogIn className="text-primary w-6 h-6" /> : <UserPlus className="text-primary w-6 h-6" />}
                    </div>
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
                                mode === "login" ? "Sign In" : "Register"
                            )}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                className="text-primary hover:underline font-medium"
                                onClick={() => setMode(mode === "login" ? "register" : "login")}
                            >
                                {mode === "login" ? "Register" : "Login"}
                            </button>
                        </div>
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
                                navigate("/dashboard");
                            }}
                        >
                            Continue as Guest
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Auth;
