export interface SyscohadaEntry {
  id: string;
  propertyId: string;
  date: string;
  journalCode: "VT" | "BQ" | "CA" | "OD";
  accountNumber: string;
  accountLabel: string;
  description: string;
  pieceReference: string;
  debitXof: number;
  creditXof: number;
  createdAt: Date;
}

export interface RecordTransactionParams {
  propertyId: string;
  date: string;
  reference: string;
  label: string;
  category: "ROOM" | "RESTAURANT" | "BAR" | "CATERING" | "EQUIPMENT";
  amountXof: number;
  paymentMethod: "CASH" | "TPE" | "BANK_TRANSFER" | "MOBILE_MONEY";
}

class SyscohadaService {
  private entries: SyscohadaEntry[] = [];

  public resetState() {
    this.entries = [];
  }

  public getJournalEntries(propertyId: string): SyscohadaEntry[] {
    return this.entries.filter((e) => e.propertyId === propertyId);
  }

  public recordTransaction(params: RecordTransactionParams) {
    const timestamp = Date.now();

    // Map Category to SYSCOHADA Class 7 Account
    let revenueAccount = "7061";
    let revenueLabel = "Prestations hébergement";
    if (params.category === "RESTAURANT") {
      revenueAccount = "7062";
      revenueLabel = "Ventes de repas et restauration";
    } else if (params.category === "BAR") {
      revenueAccount = "7063";
      revenueLabel = "Ventes de boissons et cave";
    } else if (params.category === "CATERING" || params.category === "EQUIPMENT") {
      revenueAccount = "7064";
      revenueLabel = "Prestations de service traiteur et location événementielle";
    }

    // Map Payment Method to SYSCOHADA Class 5 Account
    let treasuryAccount = "571";
    let treasuryLabel = "Caisse principale";
    if (params.paymentMethod === "BANK_TRANSFER" || params.paymentMethod === "TPE") {
      treasuryAccount = "521";
      treasuryLabel = "Banques locales Bénin";
    } else if (params.paymentMethod === "MOBILE_MONEY") {
      treasuryAccount = "531";
      treasuryLabel = "Portefeuilles électroniques & Mobile Money";
    }

    // Debit entry (Trésorerie)
    const debitEntry: SyscohadaEntry = {
      id: `sys-${timestamp}-deb`,
      propertyId: params.propertyId,
      date: params.date,
      journalCode: params.paymentMethod === "CASH" ? "CA" : "BQ",
      accountNumber: treasuryAccount,
      accountLabel: treasuryLabel,
      description: params.label,
      pieceReference: params.reference,
      debitXof: params.amountXof,
      creditXof: 0,
      createdAt: new Date(),
    };

    // Credit entry (Produit / Vente)
    const creditEntry: SyscohadaEntry = {
      id: `sys-${timestamp}-cred`,
      propertyId: params.propertyId,
      date: params.date,
      journalCode: "VT",
      accountNumber: revenueAccount,
      accountLabel: revenueLabel,
      description: params.label,
      pieceReference: params.reference,
      debitXof: 0,
      creditXof: params.amountXof,
      createdAt: new Date(),
    };

    this.entries.push(debitEntry, creditEntry);
  }

  public exportCsv(propertyId: string): string {
    const entries = this.getJournalEntries(propertyId);
    const header = "Date,Journal,Compte,Libelle,Piece,Debit,Credit\n";
    const rows = entries.map(
      (e) =>
        `"${e.date}","${e.journalCode}","${e.accountNumber}","${e.accountLabel} - ${e.description.replace(/"/g, '""')}","${e.pieceReference}",${e.debitXof},${e.creditXof}`
    );
    return header + rows.join("\n");
  }
}

export const syscohadaService = new SyscohadaService();
