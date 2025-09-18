"use client";
import { useWallet } from "@/hooks/useWallet";
import { AdminPanel } from "@/components/PublicFundManagement/AdminPanel";

export default function AdminPage() {
  const { account, isAdmin } = useWallet();
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {isAdmin ? (
        <AdminPanel showNotification={() => {}} onError={() => {}} />
      ) : (
        <div className="text-red-600">You must be connected as the admin to view this page.<br />Current address: {account}</div>
      )}
    </main>
  );
}
