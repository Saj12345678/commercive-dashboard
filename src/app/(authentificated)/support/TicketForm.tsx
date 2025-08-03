"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createClient } from "@/app/utils/supabase/client";
import { useStoreContext } from "@/context/StoreContext";

export default function TicketForm() {
  const supabase = createClient();
  const { chatOpen, setChatOpen, userinfo, selectedStore } = useStoreContext();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState(userinfo?.user_name || "");
  const [email, setEmail] = useState(userinfo?.email || "");
  const [storeUrl, setStoreUrl] = useState(selectedStore?.store_url || "");
  const [issue, setIssue] = useState("");
  const [isNameValid, setNameValid] = useState(true);
  const [isEmailValid, setEmailValid] = useState(true);
  const [isStoreUrlValid, setStoreUrlValid] = useState(true);
  const [isIssueValid, setIssueValid] = useState(true);

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
          email: email || user?.email,
          store_url: storeUrl,
          issue: issue,
        },
      ])
      .select();

    if (data) {
      toast.success("Submitted sucessfully");
      setChatOpen(false);
    } else {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    setChatOpen(true);
  }, []);

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

  useEffect(() => {
    setStoreUrl(selectedStore?.store_url || "");
  }, [selectedStore]);

  return <div className="relative"></div>;
}
