import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { ROUTES } from "../../shared/constants/routes"
import { useRegister } from "../../features/auth/hooks/useAuth"
import { GoogleSignInButton } from "../../features/auth/components/GoogleSignInButton"
import { showError, showSuccess } from "@/shared/hooks/useToast"

export function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const navigate = useNavigate()
    const register = useRegister()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            showError("Validation", new Error("Passwords do not match. Please make sure both passwords are the same."))
            return
        }
        register.mutate(
            { name, email, password },
            {
                onSuccess: () => {
                    showSuccess("Account created!", "Your account has been created successfully. Welcome aboard!")
                    navigate(ROUTES.DASHBOARD)
                },
                onError: (err) => {
                    showError("Sign up failed", err)
                },
            },
        )
    }

    const passwordsMatch = password === confirmPassword || confirmPassword === ""

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-3xl text-center">Create your account</CardTitle>
                <CardDescription className="text-base text-center">
                    Sign up to start building beautiful forms
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-base">Email</Label>
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
                        <Label htmlFor="password" className="text-base">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-base">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        {!passwordsMatch && (
                            <p className="text-base text-destructive">Passwords do not match</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={register.isPending || !passwordsMatch}
                    >
                        {register.isPending ? "Creating account..." : "Sign up"}
                    </Button>
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-sm uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <GoogleSignInButton />
                    <p className="text-center text-base text-muted-foreground">
                        Already have an account?{" "}
                        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}