"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Utensils,
  Coffee,
  Wine,
  Clock,
  CheckCircle,
  ChefHat,
  ArrowRight,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Send,
  Bed,
  Building2,
  User,
  Volume2,
} from "lucide-react";
import { WaitstaffServiceConsole } from "@/components/pos/waitstaff-service-console";

// Types
export interface PosTicket {
  id: string;
  orderNumber: string;
  stationCode: "CUISINE" | "BAR" | "CAVE";
  destinationType: "TABLE" | "CHAMBRE" | "SALLE";
  destinationName: string;
  serverName: string;
  items: {
    name: string;
    quantity: number;
    accompaniment?: string; // Accompagnement gratuit pour les repas
    specialInstructions?: string;
  }[];
  status: "PENDING" | "PREPARING" | "READY" | "SERVED";
  createdAtMinutesAgo: number;
  readyNotificationSentTo?: "WAITSTAFF" | "VALET_RECEPTIONIST";
}

export interface ClientDirectOrder {
  id: string;
  orderNumber: string;
  location: string;
  locationType: "TABLE" | "CHAMBRE" | "SALLE";
  clientName: string;
  repasItems: { name: string; quantity: number; accompaniment: string }[];
  boissonItems: { name: string; quantity: number }[];
  totalXof: number;
  timeAgo: string;
  status: "NOUVELLE_EN_ATTENTE" | "TRANSMISE_AUX_STATIONS";
}

// Menu Data
const AVAILABLE_REPAS = [
  { id: "rep-01", name: "Amiwo au Poulet Bicyclette Braisé", priceXof: 5500, category: "Traditionnel" },
  { id: "rep-02", name: "Sauce Crincrin au Mouton Tendre & Akassa", priceXof: 4500, category: "Traditionnel" },
  { id: "rep-03", name: "Tchep Royal au Mérou Braisé du Lac Nokoué", priceXof: 6000, category: "Spécialité" },
  { id: "rep-04", name: "Brochettes de Filet de Bœuf Mariné aux Épices", priceXof: 4000, category: "Grillade" },
  { id: "rep-05", name: "Poisson Braisé Entier (Capitaine) sauce Tomate", priceXof: 7000, category: "Grillade" },
];

const AVAILABLE_ACCOMPAGNEMENTS = [
  "Alloco fondant (Plantains frits)",
  "Frites maison croustillantes",
  "Riz blanc parfumé",
  "Riz gras rouge terroir",
  "Igname pilée traditionnelle (Agoun)",
  "Attiéké fin de Grand-Popo",
  "Légumes sautés vapeur",
  "Aucun accompagnement",
];

const AVAILABLE_BOISSONS = [
  { id: "boi-01", name: "Cocktail Le Vignoble Tropical (Maison)", priceXof: 3500, station: "BAR" },
  { id: "boi-02", name: "Château Vignoble Réserve Prestige (Bouteille)", priceXof: 25000, station: "BAR" },
  { id: "boi-03", name: "Champagne Moët & Chandon Brut Impérial", priceXof: 55000, station: "BAR" },
  { id: "boi-04", name: "Bière Béninoise La Béninoise 65cl (Glacée)", priceXof: 1500, station: "BAR" },
  { id: "boi-05", name: "Bière Beaufort Lager 50cl", priceXof: 1800, station: "BAR" },
  { id: "boi-06", name: "Jus d'Ananas d'Allada Pur Frais Pressé", priceXof: 1200, station: "BAR" },
  { id: "boi-07", name: "Eau Minérale Possotomé 1.5L", priceXof: 1000, station: "BAR" },
];

export default function StationsKdsPage() {
  const [activeUser, setActiveUser] = useState<any>(null);

  // Active workspace station view mode
  const [activeStationMode, setActiveStationMode] = useState<
    "SERVER_POS" | "CUISINE_KDS" | "BAR_KDS" | "DELIVERY_DISPATCH"
  >("SERVER_POS");

  // Notifications State for ready orders
  const [readyNotifications, setReadyNotifications] = useState<
    { id: string; text: string; destination: string; roleTarget: string; time: string }[]
  >([
    {
      id: "notif-01",
      text: "Boisson prête au Bar pour Table 2 : Allez chercher et livrer le client !",
      destination: "Table 2",
      roleTarget: "WAITSTAFF",
      time: "Il y a 1 min",
    },
  ]);

  // POS Waitstaff Order Form State
  const [destinationType, setDestinationType] = useState<"TABLE" | "CHAMBRE" | "SALLE">("TABLE");
  const [destinationName, setDestinationName] = useState<string>("Table 1");
  const [selectedRepas, setSelectedRepas] = useState<{ id: string; name: string; priceXof: number; accompaniment: string }[]>([]);
  const [selectedBoissons, setSelectedBoissons] = useState<{ id: string; name: string; priceXof: number; quantity: number }[]>([]);
  const [orderInstructions, setOrderInstructions] = useState("");
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Client Direct Orders (QR Code / Room Service online)
  const [clientDirectOrders, setClientDirectOrders] = useState<ClientDirectOrder[]>([
    {
      id: "cdo-001",
      orderNumber: "CMD-QR-0881",
      location: "Table 3 (Terrasse)",
      locationType: "TABLE",
      clientName: "Client Table 3",
      repasItems: [{ name: "Amiwo au Poulet Bicyclette Braisé", quantity: 2, accompaniment: "Alloco fondant (Plantains frits)" }],
      boissonItems: [{ name: "Cocktail Le Vignoble Tropical (Maison)", quantity: 2 }],
      totalXof: 18000,
      timeAgo: "Il y a 3 min",
      status: "NOUVELLE_EN_ATTENTE",
    },
    {
      id: "cdo-002",
      orderNumber: "CMD-QR-0895",
      location: "Chambre 102",
      locationType: "CHAMBRE",
      clientName: "M. Aimé TOSSOU",
      repasItems: [{ name: "Brochettes de Filet de Bœuf Mariné aux Épices", quantity: 2, accompaniment: "Frites maison croustillantes" }],
      boissonItems: [{ name: "Bière Béninoise La Béninoise 65cl (Glacée)", quantity: 2 }],
      totalXof: 11000,
      timeAgo: "Il y a 6 min",
      status: "NOUVELLE_EN_ATTENTE",
    },
  ]);

  // Master Station Tickets State
  const [tickets, setTickets] = useState<PosTicket[]>([
    {
      id: "tkt-001",
      orderNumber: "CMD-2026-0001",
      stationCode: "CUISINE",
      destinationType: "TABLE",
      destinationName: "Table 2",
      serverName: "Chantal Tossou (Serveuse)",
      items: [
        {
          name: "Amiwo au Poulet Bicyclette Braisé",
          quantity: 2,
          accompaniment: "Alloco fondant (Plantains frits)",
          specialInstructions: "Piment séparé",
        },
      ],
      status: "PREPARING",
      createdAtMinutesAgo: 4,
    },
    {
      id: "tkt-002",
      orderNumber: "CMD-2026-0001",
      stationCode: "BAR",
      destinationType: "TABLE",
      destinationName: "Table 2",
      serverName: "Chantal Tossou (Serveuse)",
      items: [
        {
          name: "Cocktail Le Vignoble Tropical (Maison)",
          quantity: 2,
          specialInstructions: "Bien frais avec glaçons",
        },
      ],
      status: "READY",
      createdAtMinutesAgo: 4,
      readyNotificationSentTo: "WAITSTAFF",
    },
    {
      id: "tkt-003",
      orderNumber: "CMD-2026-0002",
      stationCode: "CUISINE",
      destinationType: "CHAMBRE",
      destinationName: "Chambre 201",
      serverName: "Commande Directe Room-Service",
      items: [
        {
          name: "Tchep Royal au Mérou Braisé",
          quantity: 1,
          accompaniment: "Riz gras rouge terroir",
          specialInstructions: "Livraison chambre 201",
        },
      ],
      status: "PREPARING",
      createdAtMinutesAgo: 7,
    },
    {
      id: "tkt-004",
      orderNumber: "CMD-2026-0003",
      stationCode: "BAR",
      destinationType: "CHAMBRE",
      destinationName: "Suite 301",
      serverName: "Commande Client QR",
      items: [
        {
          name: "Château Vignoble Réserve Prestige (Bouteille)",
          quantity: 1,
          specialInstructions: "Seau à glace & 2 verres",
        },
      ],
      status: "READY",
      createdAtMinutesAgo: 10,
      readyNotificationSentTo: "VALET_RECEPTIONIST",
    },
  ]);

  // Load User & Role
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hotelgest_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActiveUser(parsed);
          // Set default view based on role
          if (parsed.roleCode === "WAITSTAFF") {
            setActiveStationMode("SERVER_POS");
          } else if (parsed.roleCode === "CHEF") {
            setActiveStationMode("CUISINE_KDS");
          } else if (parsed.roleCode === "BARTENDER") {
            setActiveStationMode("BAR_KDS");
          } else if (parsed.roleCode === "HOUSEKEEPING" || parsed.roleCode === "RECEPTIONIST") {
            setActiveStationMode("DELIVERY_DISPATCH");
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const roleCode = activeUser?.roleCode || "WAITSTAFF";

  // POS Add Repas with default accompaniment
  const handleAddRepas = (repasItem: typeof AVAILABLE_REPAS[0]) => {
    setSelectedRepas([
      ...selectedRepas,
      {
        id: `${repasItem.id}-${Date.now()}`,
        name: repasItem.name,
        priceXof: repasItem.priceXof,
        accompaniment: AVAILABLE_ACCOMPAGNEMENTS[0], // Default: Alloco (Inclus Gratuit)
      },
    ]);
  };

  const handleUpdateAccompaniment = (index: number, newAccompaniment: string) => {
    const updated = [...selectedRepas];
    updated[index].accompaniment = newAccompaniment;
    setSelectedRepas(updated);
  };

  const handleRemoveRepas = (index: number) => {
    setSelectedRepas(selectedRepas.filter((_, i) => i !== index));
  };

  // POS Add Boisson
  const handleAddBoisson = (boissonItem: typeof AVAILABLE_BOISSONS[0]) => {
    const existing = selectedBoissons.find((b) => b.id === boissonItem.id);
    if (existing) {
      setSelectedBoissons(
        selectedBoissons.map((b) => (b.id === boissonItem.id ? { ...b, quantity: b.quantity + 1 } : b))
      );
    } else {
      setSelectedBoissons([
        ...selectedBoissons,
        { id: boissonItem.id, name: boissonItem.name, priceXof: boissonItem.priceXof, quantity: 1 },
      ]);
    }
  };

  const handleRemoveBoisson = (id: string) => {
    setSelectedBoissons(selectedBoissons.filter((b) => b.id !== id));
  };

  // Submit POS Order (Split & Dispatch to Cuisine and Bar)
  const handleSubmitPosOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRepas.length === 0 && selectedBoissons.length === 0) {
      alert("Veuillez sélectionner au moins un repas ou une boisson.");
      return;
    }

    const orderNum = `CMD-${Date.now().toString().slice(-4)}`;
    const newTickets: PosTicket[] = [];

    // 1. If Repas selected -> Dispatch to CUISINE
    if (selectedRepas.length > 0) {
      newTickets.push({
        id: `tkt-cui-${Date.now()}`,
        orderNumber: orderNum,
        stationCode: "CUISINE",
        destinationType,
        destinationName,
        serverName: activeUser?.fullName || "Serveuse Chantal Tossou",
        items: selectedRepas.map((r) => ({
          name: r.name,
          quantity: 1,
          accompaniment: r.accompaniment,
          specialInstructions: orderInstructions || undefined,
        })),
        status: "PENDING",
        createdAtMinutesAgo: 0,
      });
    }

    // 2. If Boissons selected -> Dispatch to BAR
    if (selectedBoissons.length > 0) {
      newTickets.push({
        id: `tkt-bar-${Date.now()}`,
        orderNumber: orderNum,
        stationCode: "BAR",
        destinationType,
        destinationName,
        serverName: activeUser?.fullName || "Serveuse Chantal Tossou",
        items: selectedBoissons.map((b) => ({
          name: b.name,
          quantity: b.quantity,
          specialInstructions: orderInstructions || undefined,
        })),
        status: "PENDING",
        createdAtMinutesAgo: 0,
      });
    }

    setTickets([...newTickets, ...tickets]);

    // Reset Form
    setSelectedRepas([]);
    setSelectedBoissons([]);
    setOrderInstructions("");
    setOrderSuccessMsg(
      `✓ Commande #${orderNum} pour ${destinationName} envoyée avec succès : Repas en Cuisine & Boissons au Bar !`
    );

    setTimeout(() => {
      setOrderSuccessMsg(null);
    }, 6000);
  };

  // Accept Client Direct Order
  const handleAcceptClientOrder = (clientOrder: ClientDirectOrder) => {
    const newTickets: PosTicket[] = [];

    if (clientOrder.repasItems.length > 0) {
      newTickets.push({
        id: `tkt-cui-${Date.now()}`,
        orderNumber: clientOrder.orderNumber,
        stationCode: "CUISINE",
        destinationType: clientOrder.locationType,
        destinationName: clientOrder.location,
        serverName: "Commande Directe Client",
        items: clientOrder.repasItems.map((r) => ({
          name: r.name,
          quantity: r.quantity,
          accompaniment: r.accompaniment,
        })),
        status: "PENDING",
        createdAtMinutesAgo: 0,
      });
    }

    if (clientOrder.boissonItems.length > 0) {
      newTickets.push({
        id: `tkt-bar-${Date.now()}`,
        orderNumber: clientOrder.orderNumber,
        stationCode: "BAR",
        destinationType: clientOrder.locationType,
        destinationName: clientOrder.location,
        serverName: "Commande Directe Client",
        items: clientOrder.boissonItems.map((b) => ({
          name: b.name,
          quantity: b.quantity,
        })),
        status: "PENDING",
        createdAtMinutesAgo: 0,
      });
    }

    setTickets([...newTickets, ...tickets]);
    setClientDirectOrders(
      clientDirectOrders.map((o) => (o.id === clientOrder.id ? { ...o, status: "TRANSMISE_AUX_STATIONS" } : o))
    );
    alert(`Commande ${clientOrder.orderNumber} acceptée et transmise instantanément au Barman et au Chef Cuisine !`);
  };

  // Station Action: Mark PREPARING or READY
  const handleMarkTicketReady = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const isRoomOrHall = ticket.destinationType === "CHAMBRE" || ticket.destinationType === "SALLE";
    const targetRecipient = isRoomOrHall ? "VALET_RECEPTIONIST" : "WAITSTAFF";

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "READY", readyNotificationSentTo: targetRecipient } : t))
    );

    // Push notification to live ready notifications
    const stationLabel = ticket.stationCode === "BAR" ? "au Bar" : "en Cuisine";
    const newNotifText = isRoomOrHall
      ? `Commande prête ${stationLabel} pour ${ticket.destinationName} : Valets de chambre et réception prévenus pour livraison immédiate !`
      : `Commande prête ${stationLabel} pour ${ticket.destinationName} : La serveuse peut aller la chercher et livrer le client !`;

    setReadyNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        text: newNotifText,
        destination: ticket.destinationName,
        roleTarget: targetRecipient,
        time: "À l'instant",
      },
      ...prev,
    ]);
  };

  // Mark Served / Delivered
  const handleMarkTicketServed = (ticketId: string) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: "SERVED" } : t)));
    alert("Commande confirmée LIVRÉE au client ! Ticket archivé.");
  };

  return (
    <div className="space-y-6">
      {/* Station Header & Role Switcher Bar */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#184f28] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ChefHat className="w-3 h-3 text-[#d4af37]" />
              {activeStationMode === "SERVER_POS"
                ? "Console Serveur / Serveuse"
                : activeStationMode === "CUISINE_KDS"
                ? "Station Cuisine KDS"
                : activeStationMode === "BAR_KDS"
                ? "Station Bar KDS"
                : "Dispatch Livraisons Room-Service & Salles"}
            </span>
            <span className="text-stone-400 text-xs font-medium">
              Système POS & KDS Haute Fluidité
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Console des Stations & Service en Salle
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Routage automatique des commandes : Repas en Cuisine (avec accompagnement gratuit), Boissons au Bar, et alertes de livraison en temps réel.
          </p>
        </div>

        {/* Station Mode Toggle Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveStationMode("SERVER_POS")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeStationMode === "SERVER_POS"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Serveurs (ses) POS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStationMode("BAR_KDS")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeStationMode === "BAR_KDS"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>Barman KDS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStationMode("CUISINE_KDS")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeStationMode === "CUISINE_KDS"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-rose-400" />
            <span>Chef Cuisine</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStationMode("DELIVERY_DISPATCH")}
            className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeStationMode === "DELIVERY_DISPATCH"
                ? "bg-[#184f28] text-white shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Bed className="w-3.5 h-3.5 text-blue-400" />
            <span>Valets & Réception (Chambres/Salles)</span>
          </button>
        </div>
      </div>

      {/* Real-time Notifications Bar for Ready Orders */}
      {readyNotifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs shadow-md space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-emerald-800/40 font-bold uppercase tracking-wider text-[11px] text-emerald-400">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce text-[#d4af37]" />
              Alertes Commandes Prêtes en Temps Réel
            </span>
            <span>{readyNotifications.length} notification(s)</span>
          </div>

          <div className="space-y-1.5">
            {readyNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-2 rounded-xl bg-emerald-900/40 border border-emerald-700/50"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{notif.text}</span>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono">{notif.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: SERVER / WAITSTAFF POS (CONSOLE TACTILE DÉBITMASTER HOTEL LE VIGNOBLE)
      ========================================================================== */}
      {activeStationMode === "SERVER_POS" && (
        <WaitstaffServiceConsole activeUser={activeUser} />
      )}

      {/* =========================================================================
          VIEW 2: CUISINE KDS (Chef Cuisinier — Plats Chauds & Accompagnements Gratuits)
      ========================================================================== */}
      {activeStationMode === "CUISINE_KDS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-rose-700 flex-shrink-0" />
              <span>
                Écran KDS Cuisine — Visualisation des repas à préparer avec les accompagnements gratuits choisis par le client ou la serveuse.
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Station Cuisine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tickets
              .filter((t) => t.stationCode === "CUISINE")
              .map((ticket) => {
                const isReady = ticket.status === "READY";
                const isServed = ticket.status === "SERVED";

                return (
                  <Card
                    key={ticket.id}
                    className={`p-5 border-2 flex flex-col justify-between ${
                      isReady
                        ? "border-emerald-400 bg-emerald-50/20"
                        : isServed
                        ? "border-stone-200 opacity-60"
                        : "border-rose-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                        <div>
                          <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md">
                            {ticket.orderNumber}
                          </span>
                          <h3 className="text-base font-black text-stone-900 mt-1">
                            Destination : {ticket.destinationName}
                          </h3>
                        </div>
                        <Badge variant={isReady ? "success" : "danger"}>
                          {ticket.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-stone-500 mb-3">
                        Lancé par : <strong>{ticket.serverName}</strong>
                      </div>

                      {/* Items with accompaniment */}
                      <div className="space-y-2 mb-4">
                        {ticket.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1"
                          >
                            <div className="font-bold text-stone-900 text-sm">
                              {item.quantity}x {item.name}
                            </div>
                            {item.accompaniment && (
                              <div className="text-xs text-[#184f28] font-semibold">
                                ★ Accompagnement : {item.accompaniment}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div className="text-[11px] text-amber-700 italic">
                                Note : {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-stone-100">
                      {!isReady && !isServed ? (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleMarkTicketReady(ticket.id)}
                          className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                          <span>Marquer Plat Prêt (Notifier Serveuse ou Valet)</span>
                        </Button>
                      ) : isReady ? (
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs text-center font-bold">
                          ✓ Plat marqué PRÊT — En attente de livraison
                        </div>
                      ) : (
                        <div className="text-center text-xs font-bold text-stone-400">
                          ✓ Commande Terminée & Livrée
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: BAR KDS (Barman — Cocktails, Bières, Vins, Spiritueux)
      ========================================================================== */}
      {activeStationMode === "BAR_KDS" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                Écran KDS Barman — Préparation des boissons, cocktails de bienvenue, grands crus et sodas. Dès que la boisson est prête, cliquez pour alerter la serveuse ou les valets de chambre.
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Station Bar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tickets
              .filter((t) => t.stationCode === "BAR")
              .map((ticket) => {
                const isReady = ticket.status === "READY";
                const isServed = ticket.status === "SERVED";

                return (
                  <Card
                    key={ticket.id}
                    className={`p-5 border-2 flex flex-col justify-between ${
                      isReady
                        ? "border-emerald-400 bg-emerald-50/20"
                        : isServed
                        ? "border-stone-200 opacity-60"
                        : "border-amber-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                        <div>
                          <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md">
                            {ticket.orderNumber}
                          </span>
                          <h3 className="text-base font-black text-stone-900 mt-1">
                            Destination : {ticket.destinationName}
                          </h3>
                        </div>
                        <Badge variant={isReady ? "success" : "warning"}>
                          {ticket.status}
                        </Badge>
                      </div>

                      <div className="text-xs text-stone-500 mb-3">
                        Lancé par : <strong>{ticket.serverName}</strong>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {ticket.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 text-xs space-y-1"
                          >
                            <div className="font-bold text-stone-900 text-sm">
                              {item.quantity}x {item.name}
                            </div>
                            {item.specialInstructions && (
                              <div className="text-[11px] text-amber-800 italic">
                                Note : {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-stone-100">
                      {!isReady && !isServed ? (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleMarkTicketReady(ticket.id)}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                          <span>Marquer Boisson Prête (Notifier)</span>
                        </Button>
                      ) : isReady ? (
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs text-center font-bold">
                          ✓ Boisson marquée PRÊTE — Serveuse ou Valet notifié
                        </div>
                      ) : (
                        <div className="text-center text-xs font-bold text-stone-400">
                          ✓ Boisson Servie & Archivée
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: DELIVERY DISPATCH (Valets de Chambre & Réceptionnistes — Chambres & Salles)
      ========================================================================== */}
      {activeStationMode === "DELIVERY_DISPATCH" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <span>
                Console Valets de Chambre & Réceptionnistes — Dès que les boissons ou repas destinés aux chambres ou salles sont prêts au bar ou en cuisine, les valets reçoivent ici l&apos;ordre de livraison.
              </span>
            </div>
            <span className="font-bold text-[10px] uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Room-Service & Salles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tickets
              .filter(
                (t) =>
                  (t.destinationType === "CHAMBRE" || t.destinationType === "SALLE") &&
                  t.status !== "SERVED"
              )
              .map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`p-5 border-2 flex flex-col justify-between ${
                    ticket.status === "READY"
                      ? "border-emerald-400 bg-emerald-50/20"
                      : "border-blue-200 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                          {ticket.destinationType === "CHAMBRE" ? "Room-Service Chambre" : "Livraison Salle"}
                        </span>
                        <h3 className="text-lg font-black text-stone-900 mt-1 font-serif">
                          {ticket.destinationName}
                        </h3>
                      </div>
                      <Badge variant={ticket.status === "READY" ? "success" : "info"}>
                        {ticket.status === "READY" ? "PRÊT À LIVRER" : "EN PRÉPARATION"}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {ticket.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                        >
                          <div className="font-bold text-stone-900">
                            {item.quantity}x {item.name}
                          </div>
                          {item.accompaniment && (
                            <div className="text-xs text-[#184f28] font-semibold mt-0.5">
                              ★ Accompagnement : {item.accompaniment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    {ticket.status === "READY" ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleMarkTicketServed(ticket.id)}
                        className="w-full bg-[#184f28] hover:bg-[#123c1f] text-white font-bold text-xs gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4 text-[#d4af37]" />
                        <span>Confirmer Livraison en {ticket.destinationName}</span>
                      </Button>
                    ) : (
                      <div className="text-center text-xs font-semibold text-stone-400 p-2">
                        ⏳ En cours de préparation au {ticket.stationCode}...
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
