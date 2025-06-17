"use client"

import { AdminDashboard } from "@/components/admin/admin-dashboard"

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  return <AdminDashboard onBack={onBack} />
}
