"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomButton from "@/components/ui/custom-button";
import { signup } from "./actions";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { ActionResponse } from "@/components/type-identifiers";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [state, formAction] = useFormState<ActionResponse<void>, FormData>(
    signup,
      null
    );

  useEffect(() => {
    const referral = searchParams.get("referral");
    if (referral) {
      setReferralCode(referral);
    }
  }, [searchParams]);

  useEffect(() => {
      if (!state) {
        return;
      }
    
      if (!state.success && state.errors) {
        const errors = Array.isArray(state.errors)
          ? state.errors
          : [state.errors]; 
    
        errors.forEach((error) => {
          toast.error(error, {
            toastId: error,
          });
        });
      }
    
      if (state.success) {
        toast.success("SignUp successfully!", {
          toastId: "signup-success",
        });
        router.push('/')
      }
    }, [state]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
        <h1 className="text-center mb-6 text-blue-600 text-2xl font-bold">
          Create an Account
        </h1>
        <p className="text-center mb-6 text-gray-600">
          Please sign up to get started
        </p>
        <form action={formAction} >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-600 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-600 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {referralCode && (
              <input type="hidden" name="referral" value={referralCode} />
            )}
            <CustomButton
                type="submit"
                label={'Sign up'}
                className="w-full whitespace-nowrap px-6 text-xl lg:h-full"
              />
          </div>
        </form>
        <p className="mt-4 text-center text-gray-500">
          Already have an account? {" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => router.push("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <SignupForm />
    </Suspense>
  )
}
