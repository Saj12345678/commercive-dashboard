"use client";

import CustomButton from "@/components/ui/custom-button";
import { useRouter } from "next/navigation";
import { FormEventHandler, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import LogoIcon from "@/components/images/full-logo";
import { createClient } from "../utils/supabase/client";
import { IoIosEye } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import { checkEmail } from "./actions";
import { sendEmail } from "../actions";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSignIn: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!showPass) {
      const res = await checkEmail(email);
      if (res.status) {
        setShowPass(true);
      } else {
        const request = res.request;
        if (request && request.status == false) {
          toast.error("Your account is not approved yet.");
        }
        if (request && request.status == true) {
          setIsSignup(true);
          toast.success("Your email is approved. Please set your password.");
        }
        if (!request) {
          toast.error("The account is not found.");
          setShowSignUp(true);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        if (error.code == "email_not_confirmed") {
          toast.error("Your email is not confirmed. Please check your email.");
        } else {
          toast.error(error.message);
        }
      } else {
        window.location.href = "/";
      }
    }
    setIsLoading(false);
  };

  const handleSignUp: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (password != confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const res = await checkEmail(email);
    const request = res.request;

    if (request && request.status == true) {
      const res = await sendEmail({
        email: email,
        password: password,
        request,
      });
      const status = res.statusCode == 202;
      if (status) {
        toast.success("Confirmation email sent. Please check your email.");
        setIsSignup(false);
        setShowPass(true);
      } else {
        toast.error("Something went wrong!");
      }
    }
    setIsLoading(false);
  };

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
        <h1 className="text-2xl font-bold mb-3 text-blue-600">
          {isSignup ? "Set your password." : "Sign In"}
        </h1>
        {showSignUp && (
          <p className="mb-10 text-gray-500">
            Don’t have an account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => {
                router.push("/signUp");
              }}
            >
              Sign up
            </span>
          </p>
        )}
        <form onSubmit={isSignup ? handleSignUp : handleSignIn}>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                disabled={showPass}
              />
            </div>
            {(showPass || isSignup) && (
              <div className="relative">
                <label htmlFor="password" className="block text-gray-600 mb-2">
                  Password
                </label>
                <input
                  className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <div
                  className="absolute z-10 right-2.5 bottom-2.5 cursor-pointer"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <IoEyeOff size={25} />
                  ) : (
                    <IoIosEye size={25} />
                  )}
                </div>
              </div>
            )}
            {isSignup && (
              <div className="relative">
                <label htmlFor="password" className="block text-gray-600 mb-2">
                  Confirm Password
                </label>
                <input
                  className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password again."
                  required
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
                <div
                  className="absolute z-10 right-2.5 bottom-2.5 cursor-pointer"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <IoEyeOff size={25} />
                  ) : (
                    <IoIosEye size={25} />
                  )}
                </div>
              </div>
            )}

            <CustomButton
              type="submit"
              label={isSignup ? "Set Password" : "Sign In"}
              className="w-full whitespace-nowrap px-6 text-md lg:h-full"
              interactingAPI={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
