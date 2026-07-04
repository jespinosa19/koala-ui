"use client"

import { LoginForm, ProviderForm, SignUpForm } from "@/components/ui/auth-form"

// Component-level demos for the auth-form docs page. The full-page compositions (split / centered
// sign-in and sign-up, the community screens) live in the Authentication section family under
// /app/sections/authentication, where each gets a full-screen device-frame preview.

/** Sign-in: social providers, email + password, remember, forgot-password link. */
export function LoginFormDemo() {
  return <LoginForm />
}

/** Sign-up: adds a name field, a live password-strength meter, and a terms gate. */
export function SignUpFormDemo() {
  return <SignUpForm />
}

/** Stacked "Continue with X" buttons over a magic-link email: the password-less OAuth pattern. */
export function ProviderStackDemo() {
  return (
    <ProviderForm
      title="Sign in to Koala"
      description="Use a provider or get a magic link by email."
      showEmail
    />
  )
}

/** Single dominant Discord button gated behind a consent checkbox, with a real-logo social rail. */
export function ConsentGateDemo() {
  return (
    <ProviderForm
      title="Want to join Eleven?"
      description="Sign in with Discord to request your whitelist and start your story."
      providers={["discord"]}
      emphasizeFirst
      action="sign-in"
      requireTerms
      termsLabel={
        <>
          I accept the{" "}
          <a href="#" className="font-medium text-brand underline-offset-4 hover:underline">
            terms and conditions
          </a>{" "}
          of Eleven
        </>
      }
      social={[
        { network: "x", href: "#" },
        { network: "discord", href: "#" },
        { network: "youtube", href: "#" },
        { network: "instagram", href: "#" },
      ]}
    />
  )
}
