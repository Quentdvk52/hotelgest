import { SEED_PROPERTIES } from "../../lib/db/seed";

export type ClientCategory =
  | "PARTICULIER"
  | "VIP_PRESTIGE"
  | "CORPORATE"
  | "DELEGATION"
  | "TOUR_OPERATOR"
  | "EVENEMENTIEL"
  | "HABITUE";

export interface ClientRecord {
  id: string;
  fullName: string;
  category: ClientCategory;
  phone: string;
  email: string;
  propertyId: string;
  propertyName?: string;
  city: string;
  country: string;
  taxId?: string; // IFU Bénin
  rccm?: string;  // Registre de Commerce
  companyContactPerson?: string;
  preferences?: string;
  totalSpendXof: number;
  visitsCount: number;
  status: "ACTIF" | "VIP" | "PROSPECT" | "ARCHIVE";
  notes?: string;
  createdAt: string;
}

export const CLIENT_CATEGORY_LABELS: Record<ClientCategory, { label: string; badgeClass: string }> = {
  PARTICULIER: {
    label: "Particulier",
    badgeClass: "bg-stone-100 text-stone-700 border-stone-300",
  },
  VIP_PRESTIGE: {
    label: "VIP & Prestige",
    badgeClass: "bg-amber-500/15 text-amber-800 border-amber-400/40",
  },
  CORPORATE: {
    label: "Entreprise & Corporate",
    badgeClass: "bg-blue-500/15 text-blue-800 border-blue-400/40",
  },
  DELEGATION: {
    label: "Délégation Officielle",
    badgeClass: "bg-purple-500/15 text-purple-800 border-purple-400/40",
  },
  TOUR_OPERATOR: {
    label: "Tour-Opérateur / Agence",
    badgeClass: "bg-teal-500/15 text-teal-800 border-teal-400/40",
  },
  EVENEMENTIEL: {
    label: "Organisateur Événementiel",
    badgeClass: "bg-rose-500/15 text-rose-800 border-rose-400/40",
  },
  HABITUE: {
    label: "Habitué & Fidélité",
    badgeClass: "bg-emerald-500/15 text-emerald-800 border-emerald-400/40",
  },
};

export const INITIAL_CLIENTS: ClientRecord[] = [
  // Bohicon (Siège & Prestige)
  {
    id: "cli-boh-001",
    fullName: "Ministère du Cadre de Vie & des Transports",
    category: "DELEGATION",
    phone: "+229 97 20 40 60",
    email: "missions.zou@cadredevie.bj",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    city: "Cotonou / Bohicon",
    country: "Bénin",
    taxId: "3201800123456",
    companyContactPerson: "M. Marcellin AKPOVI (Chef Protocole)",
    preferences: "Suites communicantes 101 et 102, facturation officielle avec IFU et bon de commande.",
    totalSpendXof: 4850000,
    visitsCount: 14,
    status: "VIP",
    notes: "Délégations ministérielles régulières pour les tournées dans le Zou et Collines.",
    createdAt: "2026-01-15T08:30:00Z",
  },
  {
    id: "cli-boh-002",
    fullName: "DOSSOU-YOVO Brice & Famille",
    category: "HABITUE",
    phone: "+229 96 11 22 33",
    email: "brice.dossou@gmail.com",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    city: "Bohicon",
    country: "Bénin",
    preferences: "Table terrasse piscine le dimanche midi, Alloco et Carpe braisée, vin Saint-Émilion.",
    totalSpendXof: 1250000,
    visitsCount: 22,
    status: "ACTIF",
    notes: "Membre du Club Privilège Le Vignoble, habitué des déjeuners du week-end.",
    createdAt: "2026-02-01T11:00:00Z",
  },
  {
    id: "cli-boh-003",
    fullName: "Société des Brasseries du Bénin (SOBEBRA)",
    category: "CORPORATE",
    phone: "+229 21 33 00 11",
    email: "direction.ventes@sobebra.bj",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    city: "Cotonou / Bohicon",
    country: "Bénin",
    taxId: "3200100456789",
    rccm: "RB/COT/99 B 1234",
    companyContactPerson: "Mme Clarisse TOSSOU (Assistante DG)",
    preferences: "Séminaires d'entreprise dans la salle de conférence Agadja, pauses-café et cocktail dînatoire.",
    totalSpendXof: 3600000,
    visitsCount: 8,
    status: "ACTIF",
    notes: "Convention annuelle des équipes commerciales régionales du Centre.",
    createdAt: "2026-02-10T14:20:00Z",
  },
  {
    id: "cli-boh-004",
    fullName: "Dr. Claudine GNACADJA",
    category: "VIP_PRESTIGE",
    phone: "+229 97 45 88 99",
    email: "c.gnacadja@clinique-esperance.bj",
    propertyId: "prop-bohicon-001",
    propertyName: "Hôtel Le Vignoble - Bohicon",
    city: "Bohicon",
    country: "Bénin",
    preferences: "Suite Royale Le Vignoble (101), Champagne Moët & Chandon servi au seau frais.",
    totalSpendXof: 2150000,
    visitsCount: 9,
    status: "VIP",
    notes: "Invitée d'honneur cérémonies et galas au Vignoble.",
    createdAt: "2026-02-18T16:45:00Z",
  },

  // Abomey (Cité Historique & Royauté)
  {
    id: "cli-abm-001",
    fullName: "Fondation Patrimoine & Palais Royaux d'Abomey",
    category: "EVENEMENTIEL",
    phone: "+229 95 60 70 80",
    email: "contact@palais-abomey.org",
    propertyId: "prop-abomey-002",
    propertyName: "Hôtel Le Vignoble - Abomey",
    city: "Abomey",
    country: "Bénin",
    taxId: "3201900554433",
    companyContactPerson: "Pr. Dah HOUEGBADJA",
    preferences: "Réservation de salles de conférences pour colloques internationaux et réceptions officielles.",
    totalSpendXof: 2980000,
    visitsCount: 11,
    status: "ACTIF",
    notes: "Partenaire culturel clé pour les visites touristiques et séminaires d'historiens.",
    createdAt: "2026-01-22T09:15:00Z",
  },
  {
    id: "cli-abm-002",
    fullName: "Agence Bénin Écotourisme & Découvertes",
    category: "TOUR_OPERATOR",
    phone: "+229 97 88 12 34",
    email: "circuits@benin-ecotour.com",
    propertyId: "prop-abomey-002",
    propertyName: "Hôtel Le Vignoble - Abomey",
    city: "Ouidah / Abomey",
    country: "Bénin",
    taxId: "3202100876543",
    companyContactPerson: "M. Aimé ZINSOU",
    preferences: "Groupes de 12 à 25 touristes en pension complète, fiches d'accueil et menus du terroir.",
    totalSpendXof: 5200000,
    visitsCount: 18,
    status: "VIP",
    notes: "Fournit un flux régulier de voyageurs européens et diaspora pour le circuit historique Danxomè.",
    createdAt: "2026-02-05T10:30:00Z",
  },
  {
    id: "cli-abm-003",
    fullName: "Famille KPONOU & Alliés",
    category: "PARTICULIER",
    phone: "+229 96 33 44 55",
    email: "kponou.famille@yahoo.fr",
    propertyId: "prop-abomey-002",
    propertyName: "Hôtel Le Vignoble - Abomey",
    city: "Abomey",
    country: "Bénin",
    preferences: "Table 2 restaurant, plats traditionnels Djenkoumé au poulet bicyclette.",
    totalSpendXof: 680000,
    visitsCount: 7,
    status: "ACTIF",
    notes: "Habitués des repas dominicaux en famille.",
    createdAt: "2026-02-14T12:00:00Z",
  },

  // Abomey-Calavi (Hub Universitaire & Affaires)
  {
    id: "cli-abc-001",
    fullName: "Université d'Abomey-Calavi (Rectorat & Chaires)",
    category: "DELEGATION",
    phone: "+229 21 36 00 74",
    email: "rectorat.colloques@uac.bj",
    propertyId: "prop-calavi-003",
    propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
    city: "Abomey-Calavi",
    country: "Bénin",
    taxId: "3201500332211",
    companyContactPerson: "Dr. Euloge KOUDJO",
    preferences: "Hébergement professeurs invités et jurys de thèse, suites calmes avec Wi-Fi haut débit.",
    totalSpendXof: 4120000,
    visitsCount: 16,
    status: "VIP",
    notes: "Accueillent les conférenciers internationaux des facultés FADESP, FLASH et FSS.",
    createdAt: "2026-01-10T13:40:00Z",
  },
  {
    id: "cli-abc-002",
    fullName: "Cabinet International d'Audit & Conseil (KPMG West Africa)",
    category: "CORPORATE",
    phone: "+229 21 31 15 20",
    email: "missions.benin@kpmg.com",
    propertyId: "prop-calavi-003",
    propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
    city: "Cotonou / Calavi",
    country: "Bénin",
    taxId: "3200800665544",
    rccm: "RB/COT/08 B 9876",
    companyContactPerson: "Mme Sandrine ADANVO",
    preferences: "Facturation mensuelle consolidée, room service tardif et salon d'affaires privatisé.",
    totalSpendXof: 3750000,
    visitsCount: 12,
    status: "ACTIF",
    notes: "Auditeurs en mission prolongée pour les banques et institutions multilatérales.",
    createdAt: "2026-01-28T09:00:00Z",
  },
  {
    id: "cli-abc-003",
    fullName: "Ing. Théophile HOUNSOU",
    category: "PARTICULIER",
    phone: "+229 97 19 82 73",
    email: "t.hounsou@gmail.com",
    propertyId: "prop-calavi-003",
    propertyName: "Hôtel Le Vignoble - Abomey-Calavi",
    city: "Abomey-Calavi",
    country: "Bénin",
    preferences: "Chambre 101 Affaires, départ matinal avec petit-déjeuner emporté.",
    totalSpendXof: 540000,
    visitsCount: 5,
    status: "ACTIF",
    notes: "Cadre supérieur BTP en déplacement régulier.",
    createdAt: "2026-02-12T17:10:00Z",
  },

  // Zogbodomey (Nature & Saveurs Écotourisme)
  {
    id: "cli-zog-001",
    fullName: "ONG Éco-Bénin & Tourisme Solidaire",
    category: "TOUR_OPERATOR",
    phone: "+229 95 10 20 30",
    email: "circuits.vallee@ecobenin.org",
    propertyId: "prop-zogbo-004",
    propertyName: "Hôtel Le Vignoble - Zogbodomey",
    city: "Bohicon / Zogbodomey",
    country: "Bénin",
    taxId: "3201700998877",
    companyContactPerson: "M. Gauthier SOVI",
    preferences: "Bungalows écologiques en plein air, repas sous paillotes, grillades locales au feu de bois.",
    totalSpendXof: 2450000,
    visitsCount: 10,
    status: "ACTIF",
    notes: "Organisation de retraites au vert et séjours d'immersion rurale.",
    createdAt: "2026-01-18T14:50:00Z",
  },
  {
    id: "cli-zog-002",
    fullName: "M. & Mme BIO GUERRA",
    category: "HABITUE",
    phone: "+229 97 55 66 77",
    email: "bioguerra.famille@outlook.com",
    propertyId: "prop-zogbo-004",
    propertyName: "Hôtel Le Vignoble - Zogbodomey",
    city: "Parakou / Zogbodomey",
    country: "Bénin",
    preferences: "Bungalow Prestige, dîner sous paillote centrale, calme et discrétion.",
    totalSpendXof: 890000,
    visitsCount: 6,
    status: "ACTIF",
    notes: "Halte régulière lors des trajets Nord-Sud.",
    createdAt: "2026-02-08T11:25:00Z",
  },
];

class ClientsService {
  private clients: ClientRecord[] = [];

  constructor() {
    this.resetState();
  }

  public resetState() {
    this.clients = JSON.parse(JSON.stringify(INITIAL_CLIENTS));
  }

  public reset() {
    this.resetState();
  }

  public listClients(filters?: {
    propertyId?: string;
    category?: string;
    search?: string;
  }): ClientRecord[] {
    let result = [...this.clients];

    if (filters?.propertyId && filters.propertyId !== "ALL") {
      result = result.filter((c) => c.propertyId === filters.propertyId);
    }

    if (filters?.category && filters.category !== "ALL") {
      result = result.filter((c) => c.category === filters.category);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.taxId && c.taxId.toLowerCase().includes(q)) ||
          c.city.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getClientById(id: string): ClientRecord | undefined {
    return this.clients.find((c) => c.id === id);
  }

  public addClient(
    data: Omit<ClientRecord, "id" | "createdAt">
  ): ClientRecord {
    const prop = SEED_PROPERTIES.find((p) => p.id === data.propertyId);
    const newClient: ClientRecord = {
      ...data,
      id: `cli-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      propertyName: prop?.name || data.propertyName || "Hôtel Le Vignoble",
      createdAt: new Date().toISOString(),
    };
    this.clients.unshift(newClient);
    return newClient;
  }

  public addClientsBulk(
    records: Array<
      Partial<Omit<ClientRecord, "id" | "createdAt">> & {
        fullName: string;
        phone: string;
      }
    >
  ): { added: ClientRecord[]; duplicates: number } {
    const added: ClientRecord[] = [];
    let duplicates = 0;

    for (const rec of records) {
      // Check duplicate by phone or email or taxId (if provided)
      const isDup = this.clients.some((existing) => {
        const phoneMatch = rec.phone && existing.phone && rec.phone.trim() === existing.phone.trim();
        const emailMatch = rec.email && existing.email && rec.email.toLowerCase().trim() === existing.email.toLowerCase().trim();
        const taxMatch = rec.taxId && existing.taxId && rec.taxId.trim() === existing.taxId.trim();
        return phoneMatch || emailMatch || taxMatch;
      });

      if (isDup) {
        duplicates++;
        continue;
      }

      const client = this.addClient({
        fullName: rec.fullName,
        category: (rec.category as ClientCategory) || "PARTICULIER",
        phone: rec.phone,
        email: rec.email || "",
        propertyId: rec.propertyId || "prop-bohicon-001",
        propertyName: rec.propertyName,
        city: rec.city || "Bohicon",
        country: rec.country || "Bénin",
        taxId: rec.taxId,
        rccm: rec.rccm,
        companyContactPerson: rec.companyContactPerson,
        preferences: rec.preferences,
        totalSpendXof: Number(rec.totalSpendXof) || 0,
        visitsCount: Number(rec.visitsCount) || 1,
        status: rec.status || "ACTIF",
        notes: rec.notes,
      });
      added.push(client);
    }

    return { added, duplicates };
  }

  public updateClient(
    id: string,
    updates: Partial<Omit<ClientRecord, "id" | "createdAt">>
  ): ClientRecord | null {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    if (updates.propertyId) {
      const prop = SEED_PROPERTIES.find((p) => p.id === updates.propertyId);
      if (prop) updates.propertyName = prop.name;
    }

    this.clients[idx] = {
      ...this.clients[idx],
      ...updates,
    };
    return this.clients[idx];
  }

  public deleteClient(id: string): boolean {
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.clients.splice(idx, 1);
      return true;
    }
    return false;
  }

  public getStats(propertyId?: string) {
    const filtered = propertyId && propertyId !== "ALL"
      ? this.clients.filter((c) => c.propertyId === propertyId)
      : this.clients;

    const total = filtered.length;
    const vips = filtered.filter((c) => c.category === "VIP_PRESTIGE" || c.status === "VIP").length;
    const corporate = filtered.filter((c) => c.category === "CORPORATE" || c.category === "DELEGATION").length;
    const habitues = filtered.filter((c) => c.category === "HABITUE").length;
    const totalSpendXof = filtered.reduce((sum, c) => sum + (c.totalSpendXof || 0), 0);

    return {
      total,
      vips,
      corporate,
      habitues,
      totalSpendXof,
    };
  }
}

export const clientsService = new ClientsService();
