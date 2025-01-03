"use client"

import CustomButton from "@/components/ui/custom-button";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import { ActionResponse } from "@/components/type-identifiers";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResponse<void>, FormData>(login, null);

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
      toast.success("Logged in successfully!", {
        toastId: "login-success",
      });
      router.push('/')
    }
  }, [state]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Welcome Back
        </h1>
        <p className="text-center mb-6 text-gray-600">
          Please login to continue
        </p>
        <form action={formAction}>
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
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <CustomButton
                type="submit"
                label={'Log in'}
                className="w-full whitespace-nowrap px-6 text-xl lg:h-full"
              />
          </div>
        </form>
        <p className="mt-4 text-center text-gray-500">
          Don’t have an account?{' '}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => {
              router.push("/signUp");
            }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
