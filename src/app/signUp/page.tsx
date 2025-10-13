"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import CustomButton from "@/components/ui/custom-button";
import { toast } from "react-toastify";
import LogoIcon from "@/components/images/full-logo";
import { createClient } from "../utils/supabase/client";

function SignupForm() {
  const router = useRouter();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const userName = formData.get("userName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const referralCode = "";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          userName,
          phoneNumber,
          referralCode,
          visible_store: [],
          role: "user",
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
        <div className="flex justify-center items-center mb-7">
          <p className="text-2xl font-semibold mr-2">Get started with</p>
          <LogoIcon width={150} height={40} color={"#4F11C9"} />
        </div>
        <form onSubmit={handleSubmit}>
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
                  className="w-full border-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-gray-600 mb-2"
                >
                  Phone
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="number"
                  placeholder="Enter your phone number"
                  required
                  className="w-full border-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {referralCode && (
              <input type="hidden" name="referral" value={referralCode} />
            )}
            <CustomButton
              type="submit"
              label={"Request Account"}
              className="w-full whitespace-nowrap px-6 text-md lg:h-full"
            />
          </div>
        </form>
        <p className="mt-4 text-gray-500">
          Already have an account?{" "}
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
  );
}
