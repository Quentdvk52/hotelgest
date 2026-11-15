import Link from "next/link";
import { SEED_PROPERTIES, SEED_ROOM_TYPES } from "@/lib/db/seed";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, ArrowLeft, ArrowRight, Bed, Users } from "lucide-react";

export default function VignobleShowcasePage() {
  return (
    <div className="min-h-screen bg-[#faf5f5] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#7c3c46] tracking-tight">Hôtel Le Vignoble</h1>
            <p className="text-xs text-stone-500 font-medium">Groupe Hôtelier Pilote — République du Bénin</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/catering-equipment">
              <Button variant="gold" size="sm">
                Service Traiteur
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Espace Direction / Staff
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="gold" className="mb-3">4 Établissements de Prestige</Badge>
          <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
            L&apos;art de recevoir au cœur du Bénin
          </h2>
          <p className="mt-4 text-stone-600">
            Chambres tout confort, suites royales, restaurants gastronomiques aux saveurs locales,
            caves à vins climatisées et espaces de réception pour toutes vos manifestations.
          </p>
        </div>

        {/* 4 Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {SEED_PROPERTIES.map((prop) => (
            <Card key={prop.id} className="overflow-hidden hover:border-[#7c3c46]/50">
              <div className="h-40 bg-gradient-to-r from-[#7c3c46] to-[#582f36] p-6 text-white flex flex-col justify-between">
                <div>
                  <Badge variant="gold" className="mb-2">Site {prop.code}</Badge>
                  <h3 className="text-xl font-bold">{prop.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-200">
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>{prop.city}, Bénin</span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-stone-600 mb-4">{prop.address}</p>

                <div className="space-y-2 text-xs text-stone-500 border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{prop.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{prop.email}</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link href={`/order/hg_table_${prop.code.toLowerCase()}_tbl01`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Menu Resto / Bar
                    </Button>
                  </Link>
                  <Link href="/catering-equipment" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Traiteur & Salles
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Room Types Showcase */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm">
          <h3 className="text-2xl font-bold text-stone-900 mb-6">
            Nos Catégories de Chambres & Tarifs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEED_ROOM_TYPES.map((rt) => (
              <div key={rt.id} className="p-6 rounded-2xl bg-stone-50 border border-stone-200/60 flex flex-col justify-between">
                <div>
                  <Badge variant="default" className="mb-2">{rt.code}</Badge>
                  <h4 className="text-lg font-bold text-stone-900">{rt.name}</h4>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">{rt.description}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-600 mt-4">
                    <Users className="w-4 h-4 text-stone-400" />
                    <span>Capacité : jusqu&apos;à {rt.capacity} personnes</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold text-[#7c3c46]">{rt.basePriceXof.toLocaleString("fr-FR")}</span>
                    <span className="text-xs text-stone-500 ml-1">XOF / nuit</span>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm">
                      Réserver
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
