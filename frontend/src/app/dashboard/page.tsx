"use client";
import { BarChart, Group, Person } from "@mui/icons-material";
import { Divider, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Analytics from "src/components/admin/analytics/Analytics";
import AdminUsersPanel from "src/components/admin/users/AdminUsersPanel";
import ConfirmDeleteDialog from "src/components/common/ConfirmDeleteDialog";
import ProfileManager from "src/components/common/ProfileManager";
import { useAuthStore } from "src/store/useAuthStore";
import { playfair } from "src/themes/fonts";

export default function Dashboard() {
  const { user, loading, getUser, logout } = useAuthStore();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isAdmin = user && user.role?.name === "Admin";

  useEffect(() => {
    if (!user && !loading) {
      toast.error("You need to log in first.");
      router.push("/sign-in");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      toast.success("Account deleted successfully.");
      logout();
    } catch (error) {
      toast.error("Error deleting account.");
      console.error(error);
    }
  };

  return (
    <div
      aria-label="user-dashboard"
      className="min-h-screen py-8 flex items-start justify-center bg-gray-100"
    >
      <div
        aria-label="dashboard"
        className="max-w-6xl w-full bg-white shadow-md rounded-lg px-8 pt-8 pb-16"
      >
        <h1
          aria-label="header-title"
          className={`text-xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tighter mb-6 ${playfair.variable} font-serif`}
        >
          Dashboard
        </h1>

        <div aria-label="dashboard-welcome-box" className="text-left mb-4">
          <p className="text-gray-700">
            Welcome, <span className="font-semibold">{user?.username}</span>!
          </p>
          <p className="text-gray-500 text-sm">Role: {user?.role?.name}</p>
        </div>

        <Tabs aria-label="tabs" value={selectedTab} onChange={handleTabChange}>
          {isAdmin && <Tab value={0} label="Analytics" icon={<BarChart />} />}
          {isAdmin && (
            <Tab value={1} label="Users Management" icon={<Group />} />
          )}
          <Tab value={isAdmin ? 2 : 0} label="My Profile" icon={<Person />} />
        </Tabs>
        <Divider />

        {user &&
          ((isAdmin && selectedTab === 2) ||
            (!isAdmin && selectedTab === 0)) && (
            <ProfileManager
              user={user}
              onDelete={() => {
                setDeleteDialogOpen(true);
                handleDelete();
              }}
            />
          )}
        {selectedTab === 0 && isAdmin && <Analytics />}
        {selectedTab === 1 && isAdmin && <AdminUsersPanel />}

        {/* Confirm Account Deletion Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}
