"use client";
import React, { useEffect, useState } from "react";
import Chat from "@/components/chat";
import { createClient } from "@/app/utils/supabase/client";

export default function SupportPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<any>(null);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (data) {
      setUserEmail(data.user?.email || "");
      const { data: user } = await supabase
        .from("user")
        .select("*")
        .eq("email", userEmail)
        .single();
      setUser(user);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [supabase, userEmail]);

  return <Chat user={user} setUser={setUser} setUserEmail={setUserEmail} />;
}
