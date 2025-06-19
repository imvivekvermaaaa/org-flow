"use client";

import { useState, useEffect } from "react";

interface Organization {
  id: string;
  name: string;
  slug?: string;
}

export default function OrganizationSelector({
  organizations,
  initialOrganizationId,
}: {
  organizations: Organization[];
  initialOrganizationId: string;
}) {
  const [selectedOrgId, setSelectedOrgId] = useState(initialOrganizationId);

  useEffect(() => {
    console.log("Selected organization id:", selectedOrgId);
  }, [selectedOrgId]);

  // Log before rendering as well
  console.log("Selected organization id (before render):", selectedOrgId);

  return (
    <div className="mb-6">
      <label htmlFor="organization-select" className="block text-sm font-medium text-gray-700 mb-1">
        Select Organization
      </label>
      <select
        id="organization-select"
        name="organization"
        className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        value={selectedOrgId}
        onChange={e => setSelectedOrgId(e.target.value)}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
    </div>
  );
} 