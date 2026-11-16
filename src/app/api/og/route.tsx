import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Hôtel Le Vignoble";
  const subtitle =
    searchParams.get("subtitle") ||
    "Écrins Hôteliers d'Exception & Prestige au Bénin";
  const badge = searchParams.get("badge") || "Bohicon • Abomey • Calavi • Zogbodomey";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundColor: "#0c0f17",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #184f28 0%, transparent 45%), radial-gradient(circle at 75% 75%, #3d0d14 0%, transparent 50%)",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "white",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: "#184f28",
                border: "2px solid #d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d4af37",
                fontSize: "26px",
                fontWeight: "bold",
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  color: "#ffffff",
                }}
              >
                HÔTEL LE VIGNOBLE
              </span>
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "3px",
                  color: "#d4af37",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Hospitalité d&apos;Élite au Bénin
              </span>
            </div>
          </div>

          {/* Location Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(212, 175, 55, 0.15)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: "9999px",
              padding: "10px 22px",
              color: "#d4af37",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "1px",
            }}
          >
            {badge}
          </div>
        </div>

        {/* Central Title & Description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.15,
              color: "#ffffff",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#d1d5db",
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Footer Features Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "30px",
          }}
        >
          <div style={{ display: "flex", gap: "32px", fontSize: "16px", color: "#9ca3af" }}>
            <span>🏨 Suites & Pavillons VIP</span>
            <span>🍷 Cave à Vin Millésimée</span>
            <span>🍽️ Haute Gastronomie</span>
            <span>🚗 Flotte Privée de Prestige</span>
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#d4af37",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            hotelgestion.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
