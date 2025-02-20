"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomButton from "@/components/ui/custom-button";
import { signup } from "./actions";
import { toast } from "react-toastify";
import { ActionResponse } from "@/components/type-identifiers";
import LogoIcon from "@/components/images/full-logo";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [state, formAction] = useActionState<ActionResponse<void>, FormData>(
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
      router.push('/login')
    }
  }, [state]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
        <div className="flex justify-center items-center mb-7">
          <p className="text-2xl font-semibold mr-2">
            Get started with
          </p>
          <LogoIcon width={150} height={40} color={"#4F11C9"} />
        </div>
        <form action={formAction} >
          <div className="space-y-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div>
                <label htmlFor="firstName" className="block text-gray-600 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  required
                  className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-gray-600 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  required
                  className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 flex-col md:flex-row">
              <div>
                <label htmlFor="userName" className="block text-gray-600 mb-2">
                  User Name
                </label>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  placeholder="Enter your user name"
                  required
                  className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-gray-600 mb-2">
                  Phone
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="number"
                  placeholder="Enter your phone number"
                  required
                  className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
              label={'Create Account'}
              className="w-full whitespace-nowrap px-6 text-md lg:h-full"
            />
          </div>
        </form>
        <p className="mt-4 text-gray-500">
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
