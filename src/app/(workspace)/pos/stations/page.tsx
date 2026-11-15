"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Utensils,
  Coffee,
  Wine,
  Clock,
  CheckCircle,
  ChefHat,
  ArrowRight,
} from "lucide-react";

interface MockTicket {
  id: string;
  stationCode: "CUISINE" | "BAR" | "CAVE";
  ticketNumber: string;
  orderNumber: string;
  location: string;
  items: string[];
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  createdAtMinutesAgo: number;
}

export default function StationsKdsPage() {
  const [selectedStation, setSelectedStation] = useState<"ALL" | "CUISINE" | "BAR" | "CAVE">("ALL");

  const [tickets, setTickets] = useState<MockTicket[]>([
    {
      id: "tkt-001",
      stationCode: "CUISINE",
      ticketNumber: "TK-0001-CUISINE",
      orderNumber: "CMD-2026-0001",
      location: "Table 2",
      items: ["2x Amiwo au Poulet Bicyclette Braisé (Sans piment)", "1x Alloco"],
      status: "PENDING",
      createdAtMinutesAgo: 4,
    },
    {
      id: "tkt-002",
      stationCode: "BAR",
      ticketNumber: "TK-0001-BAR",
      orderNumber: "CMD-2026-0001",
      location: "Table 2",
      items: ["2x Cocktail Le Vignoble Tropical (Bien frais)"],
      status: "PREPARING",
      createdAtMinutesAgo: 4,
    },
    {
      id: "tkt-003",
      stationCode: "CAVE",
      ticketNumber: "TK-0002-CAVE",
      orderNumber: "CMD-2026-0002",
      location: "Chambre 101",
      items: ["1x Château Vignoble Réserve Prestige (T° de service 16°C)"],
      status: "READY",
      createdAtMinutesAgo: 12,
    },
  ]);

  const advanceTicketStatus = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        if (t.status === "PENDING") return { ...t, status: "PREPARING" };
        if (t.status === "PREPARING") return { ...t, status: "READY" };
        if (t.status === "READY") return { ...t, status: "SERVED" };
        return t;
      })
    );
  };

  const filteredTickets = tickets.filter((t) => {
    if (selectedStation === "ALL") return true;
    return t.stationCode === selectedStation;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Console des Stations (KDS)</h1>
          <p className="text-xs text-stone-500 mt-1">
            Routage et préparation en temps réel : Cuisine, Bar & Cocktails, Cave à vin.
          </p>
        </div>

        {/* Station Selector */}
        <div className="flex gap-2 bg-stone-200/60 p-1 rounded-xl">
          <Button
            variant={selectedStation === "ALL" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedStation("ALL")}
          >
            Toutes ({tickets.length})
          </Button>
          <Button
            variant={selectedStation === "CUISINE" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedStation("CUISINE")}
            className="gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" /> Cuisine
          </Button>
          <Button
            variant={selectedStation === "BAR" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedStation("BAR")}
            className="gap-1.5"
          >
            <Coffee className="w-3.5 h-3.5" /> Bar
          </Button>
          <Button
            variant={selectedStation === "CAVE" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedStation("CAVE")}
            className="gap-1.5"
          >
            <Wine className="w-3.5 h-3.5" /> Cave
          </Button>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => {
          let badgeVariant: "warning" | "info" | "success" | "default" = "warning";
          let actionLabel = "Commencer la préparation";

          if (ticket.status === "PREPARING") {
            badgeVariant = "info";
            actionLabel = "Marquer PRÊT";
          } else if (ticket.status === "READY") {
            badgeVariant = "success";
            actionLabel = "Marquer SERVI au client";
          } else if (ticket.status === "SERVED") {
            badgeVariant = "default";
            actionLabel = "Commande Terminée";
          }

          return (
            <Card
              key={ticket.id}
              className={`p-6 border-2 flex flex-col justify-between ${
                ticket.status === "PENDING"
                  ? "border-amber-300 bg-amber-50/20"
                  : ticket.status === "PREPARING"
                  ? "border-sky-300 bg-sky-50/20"
                  : ticket.status === "READY"
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-stone-200 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={badgeVariant} className="text-xs font-bold uppercase">
                    {ticket.status}
                  </Badge>
                  <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> Il y a {ticket.createdAtMinutesAgo} min
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">{ticket.ticketNumber}</h3>
                    <div className="text-xs font-semibold text-[#7c3c46] mt-0.5">
                      Destination : {ticket.location}
                    </div>
                  </div>
                  <Badge variant="default" className="text-[10px] uppercase font-bold">
                    {ticket.stationCode}
                  </Badge>
                </div>

                <div className="space-y-2 mb-6">
                  {ticket.items.map((item, i) => (
                    <div key={i} className="text-sm font-semibold text-stone-800 bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {ticket.status !== "SERVED" ? (
                <Button
                  variant={ticket.status === "READY" ? "primary" : "secondary"}
                  size="md"
                  className="w-full gap-2 font-bold"
                  onClick={() => advanceTicketStatus(ticket.id)}
                >
                  {actionLabel} <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="text-center text-xs font-bold text-stone-400 py-2">
                  ✓ Ticket Servi
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
