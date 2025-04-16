"use client";

import { Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "src/store/useAuthStore";

const HeaderAuth: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    await logout();
    toast.success("Logged out successfully.");
    router.push("/");
  };

  if (!isClient) {
    return <div className="flex gap-4"></div>;
  }

  return (
    <>
      <Toaster position="bottom-right" />
      {user ? (
        <div className="flex items-center gap-4">
          <span>{user.username}</span>
          <Button
            onClick={handleSignOut}
            variant="outlined"
            aria-label="signout-button"
          >
            Sign out
          </Button>
        </div>
      ) : (
        <div className="flex gap-2" aria-label="header-auth-box">
          <Button variant="outlined">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button variant="contained">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      )}
    </>
  );
};

export default HeaderAuth;
