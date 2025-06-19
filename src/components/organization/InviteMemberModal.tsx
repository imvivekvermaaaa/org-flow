"use client";

import { useState } from "react";
import InviteMember from "./InviteMember";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function InviteMemberModal({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleOpen}
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Invite Member"
      >
        <UserPlusIcon className="h-6 w-6 text-gray-700" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleClose}>
          <div className="bg-white rounded-lg shadow-lg p-0 relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleClose}
              aria-label="Close"
            >
              <span className="text-2xl">&times;</span>
            </button>
            <InviteMember organizationId={organizationId} />
          </div>
        </div>
      )}
    </div>
  );
} 