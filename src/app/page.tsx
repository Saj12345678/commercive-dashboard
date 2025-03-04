"use client";

import { useRouter } from "next/navigation";
import Home from "./home/page";
import { createClient } from "./utils/supabase/client";
import { useEffect } from "react";

export default function Page() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }
    };

    checkUser();
  }, [supabase]);

  return (
    <>
      <Home />
    </>
  );
}
