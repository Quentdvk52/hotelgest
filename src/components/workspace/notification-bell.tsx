"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Megaphone, MessageSquare, Hotel, Wallet, ShieldAlert, X, Filter } from "lucide-react";

interface NotificationItem {
  id: string;
  category: "MESSAGES" | "ANNOUNCEMENTS" | "OPERATIONS" | "FINANCE" | "GOVERNANCE";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  title: string;
  summary: string;
  actionUrl: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.notifications || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch {
      // Ignore network errors in polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (id: string, actionUrl: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_READ", notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ALL_READ" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedCategory === "ALL") return true;
    return n.category === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ANNOUNCEMENTS":
        return <Megaphone className="w-3.5 h-3.5 text-amber-500" />;
      case "MESSAGES":
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case "OPERATIONS":
        return <Hotel className="w-3.5 h-3.5 text-emerald-500" />;
      case "FINANCE":
        return <Wallet className="w-3.5 h-3.5 text-purple-500" />;
      case "GOVERNANCE":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none"
        title="Centre de notifications"
        aria-label="Centre de notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-black text-white bg-rose-600 rounded-full px-1 shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#184f28] hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="p-2 border-b border-stone-100 flex gap-1 overflow-x-auto text-[10px] scrollbar-none bg-white">
            {[
              { id: "ALL", label: "Toutes" },
              { id: "ANNOUNCEMENTS", label: "Annonces" },
              { id: "MESSAGES", label: "Messages" },
              { id: "OPERATIONS", label: "Opérations" },
              { id: "FINANCE", label: "Finance" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#184f28] text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2 opacity-50" />
                Aucune notification dans cette catégorie
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.actionUrl}
                  onClick={() => {
                    if (!notif.read) handleMarkAsRead(notif.id, notif.actionUrl);
                    setOpen(false);
                  }}
                  className={`p-3 flex items-start gap-3 transition-colors hover:bg-stone-50 block text-left ${
                    !notif.read ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {notif.summary}
                    </p>
                    <span className="text-[9px] text-stone-400 font-mono mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer with links */}
          <div className="p-2.5 border-t border-stone-100 bg-stone-50 text-center flex items-center justify-around text-xs font-semibold">
            <Link
              href="/announcements"
              onClick={() => setOpen(false)}
              className="text-stone-600 hover:text-[#184f28] flex items-center gap-1"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Annonces</span>
            </Link>
            <span className="text-stone-300">•</span>
            <Link
              href="/messaging"
              onClick={() => setOpen(false)}
              className="text-stone-600 hover:text-[#184f28] flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messagerie</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
