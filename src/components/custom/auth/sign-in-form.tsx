'use client'

import { toast } from "sonner"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { handleCredentialsSignin } from "@/hooks/auth-actions"
import { signInSchema, SignInForm } from "@/lib/validation"
import { PasswordInput } from "@/components/custom/general/password-input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

export const SignInFormComponent = () => {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<SignInForm>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: SignInForm) => {
        setIsLoading(true)

        try {
            const result = await handleCredentialsSignin(values)

            if (result?.success) {
                toast.success("Signed in successfully", {
                    "description": "You are now signed in.",
                })
                // Redirect to dashboard
                window.location.href = result.redirectTo || "/dashboard"
            } else {
                toast.error(result?.message || "Sign-in failed", {
                    "description": "Please check your email and password and try again.",
                })
            }
        } catch (error) {
            // console.error("Sign-in error:", error)
            toast.error("An unexpected error occurred. Please try again.", {
                "description": error instanceof Error ? error.message : "Failed to sign in.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="ml-1">Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter your email" type="email" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="ml-1">Password</FormLabel>
                            <FormControl>
                                <PasswordInput {...field} placeholder="Enter your password" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                asdasdasdasdasd
                <Button type="submit" disabled={isLoading} className="w-full bg-blueColor/80 hover:bg-blueColor duration-300 dark:hover:bg-yellowColor/80 dark:bg-yellowColor dark:text-black font-semibold">
                    {isLoading ? "Signing In..." : "Sign In"}
                </Button>
            </form>
        </Form>
    )
}