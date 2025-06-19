"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Notification() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const handleClick = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setInvites([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("organization_invites")
          .select("*, organizations(name)")
          .eq("email", user.email)
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setInvites(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch invites");
        setInvites([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAccept = async (inviteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("organization_invites")
        .update({ status: "accepted" })
        .eq("id", inviteId);
      if (error) throw error;
      // Remove the accepted invite from the list
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (err: any) {
      setError(err.message || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left text-black">
      <button
        onClick={handleClick}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6 text-gray-700" />
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2 px-4">
            <h3 className="text-sm font-semibold mb-2">Invitations</h3>
            {loading ? (
              <div className="text-gray-500 text-sm">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-sm">{error}</div>
            ) : invites.length === 0 ? (
              <div className="text-gray-500 text-sm">No invitations found.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {invites.map((invite) => (
                  <li key={invite.id} className="py-2">
                    <div className="flex flex-col gap-2">
                      <span className="font-medium text-gray-900">
                        {invite.organizations?.name || "Unknown Org"}
                      </span>
                      <span className="text-xs font-bold text-gray-600">
                        {invite.status}
                      </span>
                      <button
                        className="mt-1 px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 w-fit"
                        onClick={() => handleAccept(invite.id)}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Accept"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 