"use client";

import CustomButton from "@/components/ui/custom-button";
import { useRouter } from "next/navigation";
import { login } from "./actions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ActionResponse } from "@/components/type-identifiers";
import LogoIcon from "@/components/images/full-logo";
import { createClient } from "../utils/supabase/client";
import { IoIosEye } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useActionState<ActionResponse<void>, FormData>(
    login,
    null
  );

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
      router.push("/commercive-partners");
    }
  }, [state]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      } else {
        router.push("/home");
      }
    };

    checkUser();
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-5">
          <LogoIcon width={150} height={35} color={"#4F11C9"} />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-blue-600">Sign In</h1>
        {/* <p className="mb-10 text-gray-500">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => {
              router.push("/signUp");
            }}
          >
            Sign up
          </span>
        </p> */}
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
                className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-gray-600 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div
                className="absolute z-10 right-2.5 bottom-2.5 cursor-pointer"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? <IoEyeOff size={25} /> : <IoIosEye size={25} />}
              </div>
            </div>
            <CustomButton
              type="submit"
              label={"Sign In"}
              className="w-full whitespace-nowrap px-6 text-md lg:h-full"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
