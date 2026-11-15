import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Hotel,
  UtensilsCrossed,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  FileSpreadsheet,
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c3c46] flex items-center justify-center text-white font-bold text-xl shadow-md">
              H
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-stone-900">HotelGest</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-[#f5e8e8] text-[#7c3c46] font-semibold">
                SaaS Afrique
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link href="#modules" className="hover:text-[#7c3c46] transition-colors">
              Modules
            </Link>
            <Link href="/vignoble" className="hover:text-[#7c3c46] transition-colors">
              Hôtel Le Vignoble
            </Link>
            <Link href="/catering-equipment" className="hover:text-[#7c3c46] transition-colors">
              Traiteur & Matériel
            </Link>
            <Link href="#tarifs" className="hover:text-[#7c3c46] transition-colors">
              Tarifs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="primary" size="md">
                Espace Direction / Staff
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#faf5f5] via-white to-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="gold" className="mb-4 px-3 py-1 text-sm">
              ✨ Groupe Pilote : Hôtel Le Vignoble (4 Sites au Bénin)
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
              Le SaaS tout-en-un de pilotage hôtelier, restauration et événementiel
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-stone-600 leading-relaxed">
              PMS hébergement multisite, commandes QR par table & chambre avec routage Cuisine/Bar/Cave,
              module complet de service traiteur et location de matériel, clôture journalière et exports SYSCOHADA.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/vignoble">
                <Button variant="primary" size="lg" className="gap-2">
                  Découvrir Le Vignoble <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/catering-equipment">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5 text-[#7c3c46]" /> Devis Traiteur & Matériel
                </Button>
              </Link>
              <Link href="/order/hg_table_bohicon_tbl01">
                <Button variant="outline" size="lg" className="gap-2">
                  <QrCode className="w-5 h-5" /> Démo Menu QR Client
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="modules" className="py-20 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-stone-900">
              Conçu pour l&apos;excellence opérationnelle quotidienne
            </h2>
            <p className="mt-3 text-stone-600">
              Chaque module est relié aux données réelles avec isolation multisite et traçabilité infalsifiable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#f5e8e8] flex items-center justify-center text-[#7c3c46] mb-4">
                  <Hotel className="w-6 h-6" />
                </div>
                <CardTitle>PMS Hébergement Multisite</CardTitle>
                <CardDescription>
                  Chambres, réservations, calendrier des disponibilités temps réel, prévention stricte des surréservations, check-in, check-out et folios.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-4">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <CardTitle>Restaurant, Bar & Cave à Vin</CardTitle>
                <CardDescription>
                  QR codes opaques et révocables, menus avec allergènes, saisie serveuse, et console KDS avec routage automatique par station (Cuisine, Bar, Cave).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[#7c3c46]/30 bg-gradient-to-br from-white to-[#faf5f5]">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-[#7c3c46] flex items-center justify-center text-white mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <Badge variant="gold" className="w-fit mb-2">Nouveau Module Clé</Badge>
                <CardTitle>Traiteur & Location de Matériel</CardTitle>
                <CardDescription>
                  Commandes de mets par portion, livraisons, réservation de chaises, tables, bâches, couverts, plats, états des lieux départ/retour et gestion des cautions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <CardTitle>Caisse & Folios Multi-Moyens</CardTitle>
                <CardDescription>
                  Sessions de caisse, règlements enregistrés (Espèces, TPE, Virement, Mobile Money), détection des écarts avec justification obligatoire.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <CardTitle>Gouvernance & Remises</CardTitle>
                <CardDescription>
                  Circuit d&apos;approbation des remises avec plafonds stricts par rôle. Clôture de journée (Night Audit) automatisée et sécurisée.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 mb-4">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <CardTitle>SYSCOHADA & Abonnement Chariow</CardTitle>
                <CardDescription>
                  Export des écritures équilibrées Débit = Crédit aligné sur le plan comptable SYSCOHADA et facturation SaaS Chariow intégrée par webhooks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-stone-900">
              Des tarifs clairs et prévisibles en Franc CFA
            </h2>
            <p className="mt-3 text-stone-600">
              Abonnement tout inclus payable via Chariow (Mobile Money, Carte, Virement).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Mensuel</h3>
                <p className="text-stone-500 text-sm mt-1">Flexibilité sans engagement</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-stone-900">100 000</span>
                  <span className="text-stone-500 ml-2 font-medium">XOF / mois</span>
                </div>
                <ul className="space-y-3 text-sm text-stone-600 border-t border-stone-100 pt-4">
                  <li>✓ Accès multisite illimité</li>
                  <li>✓ PMS & Réservations directes</li>
                  <li>✓ Menu QR & KDS Cuisine/Bar</li>
                  <li>✓ Caisse & Night Audit</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full mt-8">Choisir Mensuel</Button>
            </Card>

            <Card className="flex flex-col justify-between border-[#7c3c46] shadow-lg relative bg-gradient-to-b from-white to-[#faf5f5]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge variant="gold" className="px-3 py-1 font-bold">10% DE RÉDUCTION</Badge>
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Semestriel</h3>
                <p className="text-stone-500 text-sm mt-1">Facturation tous les 6 mois</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-[#7c3c46]">540 000</span>
                  <span className="text-stone-500 ml-2 font-medium">XOF / 6 mois</span>
                  <div className="text-xs text-stone-500 mt-1">Soit 90 000 XOF/mois</div>
                </div>
                <ul className="space-y-3 text-sm text-stone-600 border-t border-stone-100 pt-4">
                  <li>✓ Tous les avantages Mensuel</li>
                  <li>✓ Module Traiteur & Matériel inclus</li>
                  <li>✓ Support prioritaire Bénin</li>
                  <li>✓ Exports comptables SYSCOHADA</li>
                </ul>
              </div>
              <Button variant="primary" className="w-full mt-8">Choisir Semestriel</Button>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <Badge variant="success" className="w-fit mb-2">30% D&apos;ÉCONOMIE</Badge>
                <h3 className="text-xl font-bold text-stone-900">Annuel</h3>
                <p className="text-stone-500 text-sm mt-1">Le meilleur rapport qualité/prix</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-extrabold text-stone-900">840 000</span>
                  <span className="text-stone-500 ml-2 font-medium">XOF / an</span>
                  <div className="text-xs text-stone-500 mt-1">Soit 70 000 XOF/mois</div>
                </div>
                <ul className="space-y-3 text-sm text-stone-600 border-t border-stone-100 pt-4">
                  <li>✓ Tous les avantages HotelGest</li>
                  <li>✓ Intégration sur-mesure sur site</li>
                  <li>✓ Sauvegardes automatisées S3</li>
                  <li>✓ Formation des équipes sur site</li>
                </ul>
              </div>
              <Button variant="outline" className="w-full mt-8">Choisir Annuel</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7c3c46] flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="text-white font-semibold">HotelGest</span>
            <span className="text-xs text-stone-500">© 2026 Hôtel Le Vignoble. Tous droits réservés.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/vignoble" className="hover:text-white transition-colors">Le Vignoble</Link>
            <Link href="/catering-equipment" className="hover:text-white transition-colors">Traiteur & Matériel</Link>
            <Link href="/login" className="hover:text-white transition-colors">Console Staff</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
