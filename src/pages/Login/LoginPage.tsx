import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { ROUTES } from "../../shared/constants/routes"
import { useLogin } from "../../features/auth/hooks/useAuth"
import { GoogleSignInButton } from "../../features/auth/components/GoogleSignInButton"
import { showError, showSuccess } from "@/shared/hooks/useToast"

export function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const login = useLogin()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        login.mutate(
            { email, password },
            {
                onSuccess: () => {
                    showSuccess("Welcome back!", "You have been signed in successfully.")
                    navigate(ROUTES.DASHBOARD)
                },
                onError: (err) => {
                    showError("Sign in failed", err)
                },
            },
        )
    }

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={login.isPending}>
                        {login.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <GoogleSignInButton />
                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to={ROUTES.SIGNUP} className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}