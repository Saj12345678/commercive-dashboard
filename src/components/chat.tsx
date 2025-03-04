"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createClient } from "@/app/utils/supabase/client";
import { useStoreContext } from "@/context/StoreContext";

export default function Chat() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [issue, setIssue] = useState("");
  const [isNameValid, setNameValid] = useState(true);
  const [isEmailValid, setEmailValid] = useState(true);
  const [isStoreUrlValid, setStoreUrlValid] = useState(true);
  const [isIssueValid, setIssueValid] = useState(true);
  const { chatOpen, setChatOpen } = useStoreContext();

  const handleSubmit = async () => {
    if (name === "") {
      setNameValid(false);
      return;
    }
    if (email === "") {
      setEmailValid(false);
      return;
    }
    if (storeUrl === "") {
      setStoreUrlValid(false);
      return;
    }
    if (issue === "") {
      setIssueValid(false);
      return;
    }

    const { data, error } = await supabase
      .from("issues")
      .insert([
        {
          name: name,
          email: email,
          store_url: storeUrl,
          issue: issue,
        },
      ])
      .select();

    if (data) {
      toast.success("Submitted sucessfully");
    } else {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (name !== "") {
      setNameValid(true);
    }
    if (email !== "") {
      setEmailValid(true);
    }
    if (storeUrl !== "") {
      setStoreUrlValid(true);
    }
    if (issue !== "") {
      setIssueValid(true);
    }
  }, [name, email, storeUrl, issue]);

  return (
    <div className="absolute bottom-5 right-5">
      <div className="relative">
        <button
          className="p-3 border-4 rounded-full border-white chat-bg shadow-sm shadow-[#3E3E3E]"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <Image
            className="w-5"
            src="/icons/logo-icon.png"
            width={153}
            height={162}
            alt="logo"
          />
        </button>

        {chatOpen && (
          <form className="absolute z-20 bottom-16 right-0 w-96 px-6 py-8 rounded-md bg-white shadow-md">
            <div className="relative flex flex-col gap-3">
              <IconButton
                size="small"
                className="!absolute -top-5 -right-3 !bg-gray-100 hover:!bg-gray-200"
                onClick={() => setChatOpen(false)}
              >
                <CloseIcon />
              </IconButton>

              <div className="flex flex-col gap-1">
                <label className="font-semibold" htmlFor="name">
                  Name
                </label>
                <input
                  className="px-2 py-1 border rounded"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {!isNameValid && (
                  <p className="text-sm text-red-500">Please input name</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold" htmlFor="email">
                  Email
                </label>
                <input
                  className="px-2 py-1 border rounded"
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {!isEmailValid && (
                  <p className="text-sm text-red-500">
                    Please input your email
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold" htmlFor="storeUrl">
                  Store URL
                </label>
                <input
                  className="px-2 py-1 border rounded"
                  type="text"
                  name="storeUrl"
                  placeholder="example.myshopify.com"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                />
                {!isStoreUrlValid && (
                  <p className="text-sm text-red-500">
                    Please input your store url
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold" htmlFor="issue">
                  Please describe your issue
                </label>
                <textarea
                  className="w-full px-2 py-1 border"
                  rows={5}
                  name="issue"
                  placeholder="This is my issue."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                />
                {!isIssueValid && (
                  <p className="text-sm text-red-500">
                    Please input your issue
                  </p>
                )}
              </div>

              <Button
                variant="contained"
                className="!bg-[#4F12CA]"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
