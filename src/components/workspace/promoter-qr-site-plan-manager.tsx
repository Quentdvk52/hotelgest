"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  QrCode,
  Plus,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Trash2,
  Check,
  Building2,
  Layers,
  Bed,
  UtensilsCrossed,
  Wine,
  Sparkles,
  ShoppingBag,
  Eye,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Share2,
} from "lucide-react";
import { SEED_PROPERTIES } from "@/lib/db/seed";
import {
  qrService,
  ZoneRecord,
  DiningTableRecord,
  RoomUnitRecord,
  QrResourceRecord,
  SpaceType,
} from "@/modules/pos/qr-service";
import { getAllActiveOrders } from "@/modules/pos/waitstaff-service";
import { WaitstaffActiveOrder } from "@/modules/pos/waitstaff-types";

interface PromoterQrSitePlanManagerProps {
  activeUser: any;
}

export function PromoterQrSitePlanManager({ activeUser }: PromoterQrSitePlanManagerProps) {
  // Multi-Site Filter: ALL or specific property ID
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");

  // Sub-tabs: "TABLES_ZONES" | "ROOMS_QR" | "LIVE_ORDERS"
  const [subTab, setSubTab] = useState<"TABLES_ZONES" | "ROOMS_QR" | "LIVE_ORDERS">("TABLES_ZONES");

  // Local state for live reactivity
  const [zones, setZones] = useState<ZoneRecord[]>([]);
  const [tables, setTables] = useState<DiningTableRecord[]>([]);
  const [rooms, setRooms] = useState<RoomUnitRecord[]>([]);
  const [qrResources, setQrResources] = useState<QrResourceRecord[]>([]);
  const [activeOrders, setActiveOrders] = useState<WaitstaffActiveOrder[]>([]);

  // Search queries
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isNewZoneModalOpen, setIsNewZoneModalOpen] = useState(false);
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [selectedZoneForNewTable, setSelectedZoneForNewTable] = useState<ZoneRecord | null>(null);

  // Print & Preview Modal
  const [previewQrItem, setPreviewQrItem] = useState<{
    title: string;
    subtitle: string;
    propertyName: string;
    token: string;
    directUrl: string;
    resourceType: "TABLE" | "ROOM";
  } | null>(null);

  // Copied feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form states for New Zone
  const [newZonePropertyId, setNewZonePropertyId] = useState<string>("prop-bohicon-001");
  const [newZoneName, setNewZoneName] = useState<string>("");
  const [newZoneType, setNewZoneType] = useState<SpaceType>("RESTAURANT");
  const [newZoneCapacity, setNewZoneCapacity] = useState<number>(40);
  const [newZoneDescription, setNewZoneDescription] = useState<string>("");

  // Form states for New Table
  const [newTableNumber, setNewTableNumber] = useState<string>("");
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);

  // Refresh data helper
  const reloadData = () => {
    setZones([...qrService.listZones()]);
    setTables([...qrService.listDiningTables()]);
    setRooms([...qrService.listRoomUnits()]);
    setQrResources([...qrService.listQrResources()]);
    setActiveOrders([...getAllActiveOrders()]);
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtered by selected site
  const filteredZones = useMemo(() => {
    let list = selectedPropertyId === "ALL" ? zones : zones.filter((z) => z.propertyId === selectedPropertyId);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((z) => z.name.toLowerCase().includes(q) || z.description?.toLowerCase().includes(q));
  }, [zones, selectedPropertyId, searchQuery]);

  const filteredRooms = useMemo(() => {
    let list = selectedPropertyId === "ALL" ? rooms : rooms.filter((r) => r.propertyId === selectedPropertyId);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((r) => r.unitNumber.toLowerCase().includes(q) || r.roomName.toLowerCase().includes(q));
  }, [rooms, selectedPropertyId, searchQuery]);

  const filteredOrders = useMemo(() => {
    let list = selectedPropertyId === "ALL" ? activeOrders : activeOrders.filter((o) => o.propertyId === selectedPropertyId);
    return list;
  }, [activeOrders, selectedPropertyId]);

  // Copy helper
  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/order/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Creation of Zone
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    qrService.createZone(
      newZonePropertyId,
      newZoneName.trim(),
      newZoneType,
      newZoneCapacity,
      newZoneDescription.trim()
    );

    setNewZoneName("");
    setNewZoneDescription("");
    setIsNewZoneModalOpen(false);
    reloadData();
  };

  // Creation of Table in Zone
  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneForNewTable || !newTableNumber.trim()) return;

    qrService.createTableWithQr(
      selectedZoneForNewTable.propertyId,
      newTableNumber.trim(),
      selectedZoneForNewTable.name,
      selectedZoneForNewTable.spaceType,
      newTableCapacity,
      selectedZoneForNewTable.id
    );

    setNewTableNumber("");
    setIsNewTableModalOpen(false);
    setSelectedZoneForNewTable(null);
    reloadData();
  };

  // Deletion of Table
  const handleDeleteTable = (tableId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette table et son QR code ?")) {
      qrService.deleteTable(tableId);
      reloadData();
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Site Selector and Global Stats */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <QrCode className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black font-serif text-white tracking-wide">
                QR Codes & Plan de Site Multi-Établissements
              </h2>
            </div>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Générez, personnalisez et imprimez les chevalets de table et cartonnettes de chambre.
              Chaque QR code dirige instantanément le client vers le menu digital du site avec routage direct
              vers le Barman, le Chef Cuisine et la Cave.
            </p>
          </div>

          {/* Site Selector Pill */}
          <div className="flex items-center gap-2 bg-stone-950/80 p-1.5 rounded-xl border border-stone-800">
            <Building2 className="w-4 h-4 text-amber-400 ml-2" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent text-xs text-stone-200 font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL" className="bg-stone-900 text-white">
                Tous les sites (Groupe Le Vignoble)
              </option>
              {SEED_PROPERTIES.map((prop) => (
                <option key={prop.id} value={prop.id} className="bg-stone-900 text-white">
                  {prop.name} ({prop.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800/80">
          <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Zones & Espaces</span>
            <p className="text-lg font-black text-amber-400 mt-0.5">{filteredZones.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Tables avec QR</span>
            <p className="text-lg font-black text-stone-100 mt-0.5">
              {tables.filter((t) => selectedPropertyId === "ALL" || t.propertyId === selectedPropertyId).length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Chambres avec QR</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{filteredRooms.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Commandes en Direct</span>
            <p className="text-lg font-black text-blue-400 mt-0.5">{filteredOrders.length}</p>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
          <button
            onClick={() => setSubTab("TABLES_ZONES")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "TABLES_ZONES"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Plan de Site & Tables</span>
          </button>

          <button
            onClick={() => setSubTab("ROOMS_QR")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "ROOMS_QR"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Bed className="w-3.5 h-3.5 text-emerald-600" />
            <span>QR Codes des Chambres</span>
          </button>

          <button
            onClick={() => setSubTab("LIVE_ORDERS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === "LIVE_ORDERS"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Vue Globale Commandes ({filteredOrders.length})</span>
          </button>
        </div>

        {subTab === "TABLES_ZONES" && (
          <button
            onClick={() => {
              setNewZonePropertyId(selectedPropertyId === "ALL" ? "prop-bohicon-001" : selectedPropertyId);
              setIsNewZoneModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Créer une nouvelle zone</span>
          </button>
        )}
      </div>

      {/* 3. SUB-TAB 1: PLAN DE SITE & TABLES */}
      {subTab === "TABLES_ZONES" && (
        <div className="space-y-6">
          {filteredZones.map((zone) => {
            const zoneTables = tables.filter(
              (t) =>
                t.propertyId === zone.propertyId &&
                (t.zoneId === zone.id || t.spaceName === zone.name)
            );
            const propertyObj = SEED_PROPERTIES.find((p) => p.id === zone.propertyId);

            return (
              <div
                key={zone.id}
                className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden"
              >
                {/* Zone Header */}
                <div className="bg-stone-50 border-b border-stone-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        {zone.spaceType}
                      </span>
                      <span className="text-xs text-stone-500 font-semibold">
                        {propertyObj?.name}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">{zone.name}</h3>
                    {zone.description && (
                      <p className="text-xs text-stone-500 mt-0.5">{zone.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-600 bg-stone-200/70 px-2.5 py-1 rounded-lg">
                      {zoneTables.length} table{zoneTables.length > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedZoneForNewTable(zone);
                        setNewTableNumber(`Table ${zoneTables.length + 1}`);
                        setIsNewTableModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une table</span>
                    </button>
                  </div>
                </div>

                {/* Tables Grid */}
                <div className="p-4">
                  {zoneTables.length === 0 ? (
                    <div className="p-6 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                      Aucune table créée dans cette zone pour le moment.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {zoneTables.map((table) => {
                        const qr = qrService.getQrForTable(table.id);
                        const isCopied = qr && copiedToken === qr.token;

                        return (
                          <div
                            key={table.id}
                            className="p-3.5 rounded-xl border border-stone-200 hover:border-amber-400/60 bg-stone-50/50 hover:bg-amber-50/30 transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h4 className="font-bold text-sm text-stone-900">{table.tableNumber}</h4>
                                <span className="text-[11px] text-stone-500">
                                  Capacité : {table.capacity} personnes
                                </span>
                              </div>
                              <span className="p-1 rounded bg-stone-200/80 text-stone-700">
                                <QrCode className="w-4 h-4" />
                              </span>
                            </div>

                            {qr && (
                              <div className="space-y-2 pt-2 border-t border-stone-200/60">
                                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                  <span>Token : {qr.token.slice(0, 14)}...</span>
                                  <span className="text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                                    Actif
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 pt-1">
                                  <button
                                    onClick={() =>
                                      setPreviewQrItem({
                                        title: table.tableNumber,
                                        subtitle: zone.name,
                                        propertyName: propertyObj?.name || "Hôtel Le Vignoble",
                                        token: qr.token,
                                        directUrl: `/order/${qr.token}`,
                                        resourceType: "TABLE",
                                      })
                                    }
                                    title="Aperçu & Imprimer le chevalet"
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900 text-white font-bold text-[11px] hover:bg-stone-800 flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    <Printer className="w-3 h-3 text-amber-400" />
                                    <span>Chevalet</span>
                                  </button>

                                  <a
                                    href={`/order/${qr.token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Tester la page menu client"
                                    className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>

                                  <button
                                    onClick={() => handleCopyLink(qr.token)}
                                    title="Copier le lien direct"
                                    className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
                                  >
                                    {isCopied ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteTable(table.id)}
                                    title="Supprimer la table"
                                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SUB-TAB 2: QR CODES DES CHAMBRES */}
      {subTab === "ROOMS_QR" && (
        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Cartonnettes & QR Codes de Toutes les Chambres
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Toutes les chambres du groupe possèdent d'office un QR code unique pour le room service 24/7.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher une chambre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredRooms.map((room) => {
              const qr = qrService.getQrForRoom(room.id);
              const propertyObj = SEED_PROPERTIES.find((p) => p.id === room.propertyId);
              const isCopied = qr && copiedToken === qr.token;

              return (
                <div
                  key={room.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500/50 bg-stone-50/60 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Chambre {room.unitNumber}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 mt-1">{room.roomName}</h4>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium bg-stone-200/80 px-2 py-0.5 rounded">
                        {room.floor}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-medium mb-3">
                      {propertyObj?.name}
                    </p>
                  </div>

                  {qr && (
                    <div className="space-y-2 pt-2 border-t border-stone-200/70">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setPreviewQrItem({
                              title: `Chambre ${room.unitNumber}`,
                              subtitle: room.roomName,
                              propertyName: propertyObj?.name || "Hôtel Le Vignoble",
                              token: qr.token,
                              directUrl: `/order/${qr.token}`,
                              resourceType: "ROOM",
                            })
                          }
                          className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cartonnette</span>
                        </button>

                        <a
                          href={`/order/${qr.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tester le menu"
                          className="p-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleCopyLink(qr.token)}
                          title="Copier le lien"
                          className="p-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: VUE GLOBALE DES COMMANDES QR MULTI-SITES */}
      {subTab === "LIVE_ORDERS" && (
        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Supervision Consolidée des Commandes QR en Direct
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Vue globale du Promoteur sur tous les flux de commandes passées depuis les QR codes des tables et chambres.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold self-start">
              {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""} active{filteredOrders.length > 1 ? "s" : ""}
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              Aucune commande active passée pour l'instant sur ce périmètre.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isPaid = order.paidAmountXof >= order.totalAmountXof;
                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-stone-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-stone-900 font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                          {order.tableLabel} ({order.zone})
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          • {order.propertyName}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600">
                        Client : <span className="font-semibold text-stone-900">{order.clientName}</span>
                        {order.waitstaffName && (
                          <span className="text-stone-400"> • Réf : {order.waitstaffName}</span>
                        )}
                      </p>

                      {/* Items details */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {order.items.map((it) => (
                          <span
                            key={it.id}
                            className="text-[10px] px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-700 font-medium"
                          >
                            {it.quantity}x {it.productName}
                            {it.accompaniment && it.accompaniment !== "Aucun accompagnement" && (
                              <span className="text-amber-700"> (+{it.accompaniment})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <p className="font-extrabold text-base text-stone-900">
                          {order.totalAmountXof.toLocaleString("fr-FR")} XOF
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isPaid ? "Payé en Ligne (KKiaPay)" : "À régler à la livraison"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL: CREER UNE ZONE */}
      {isNewZoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900">Créer une nouvelle zone</h3>
              <button
                onClick={() => setIsNewZoneModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Établissement rattaché :
                </label>
                <select
                  value={newZonePropertyId}
                  onChange={(e) => setNewZonePropertyId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                >
                  {SEED_PROPERTIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nom de la zone :
                </label>
                <input
                  type="text"
                  placeholder="Ex : Rooftop VIP Danxomè, Paillotes Jardin..."
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Type d'espace :
                  </label>
                  <select
                    value={newZoneType}
                    onChange={(e) => setNewZoneType(e.target.value as SpaceType)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none"
                  >
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="TERRASSE">Terrasse / Jardin</option>
                    <option value="BAR">Bar Lounge</option>
                    <option value="VIP">Espace VIP</option>
                    <option value="BANQUET">Salle des Fêtes</option>
                    <option value="CONFERENCE">Conférence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Capacité (pers.) :
                  </label>
                  <input
                    type="number"
                    value={newZoneCapacity}
                    onChange={(e) => setNewZoneCapacity(Number(e.target.value))}
                    min={2}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description / Emplacement :
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex : Proche de la piscine, vue panoramique..."
                  value={newZoneDescription}
                  onChange={(e) => setNewZoneDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewZoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 shadow-sm"
                >
                  Enregistrer la zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: AJOUTER UNE TABLE */}
      {isNewTableModalOpen && selectedZoneForNewTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-base text-stone-900">Ajouter une table</h3>
                <p className="text-xs text-stone-500">Zone : {selectedZoneForNewTable.name}</p>
              </div>
              <button
                onClick={() => setIsNewTableModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Numéro ou nom de la table :
                </label>
                <input
                  type="text"
                  placeholder="Ex : Table 05, Table VIP 2..."
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombre de couverts (capacité) :
                </label>
                <input
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                💡 Un QR code unique et cryptographiquement sécurisé sera immédiatement généré pour cette table.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Créer & Générer QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: APERÇU ET IMPRESSION DU CHEVALET DE TABLE / CARTONNETTE DE CHEVET */}
      {previewQrItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Présentoir Prêt à Poser
                </span>
                <h3 className="font-bold text-base text-stone-100">
                  {previewQrItem.title} • {previewQrItem.propertyName}
                </h3>
              </div>
              <button
                onClick={() => setPreviewQrItem(null)}
                className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Printable Stand Preview */}
            <div
              id="printable-qr-stand"
              className="bg-white text-stone-900 rounded-2xl p-6 text-center border-4 border-[#d4af37] shadow-xl relative overflow-hidden"
            >
              {/* Hotel Crest */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7c3c46] to-[#d4af37] text-white font-serif font-black text-base flex items-center justify-center mx-auto mb-2 shadow">
                V
              </div>

              <h4 className="text-sm font-black font-serif uppercase tracking-widest text-stone-900">
                HÔTEL LE VIGNOBLE
              </h4>
              <p className="text-[11px] font-semibold text-amber-800 mb-4">
                {previewQrItem.propertyName}
              </p>

              {/* QR Code SVG */}
              <div
                className="w-48 h-48 mx-auto my-2 p-2 bg-white border-2 border-stone-200 rounded-xl shadow-inner flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: qrService.generateQrSvg(previewQrItem.token, 180),
                }}
              />

              {/* Table / Room Title */}
              <div className="mt-3 py-1 px-3 bg-stone-100 rounded-lg inline-block border border-stone-300">
                <span className="text-xs font-black text-stone-900 uppercase">
                  {previewQrItem.title}
                </span>
              </div>

              <p className="text-[11px] font-bold text-stone-800 mt-2">
                Scannez avec votre appareil photo
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Pour commander boissons fraîches, repas chauds et grands crus de la cave.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le chevalet</span>
              </button>

              <button
                onClick={() => {
                  const svgData = qrService.generateQrSvg(previewQrItem.token, 400);
                  const blob = new Blob([svgData], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `QR-${previewQrItem.title.replace(/\s+/g, "_")}.svg`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>SVG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
