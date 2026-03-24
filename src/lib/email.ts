import { Resend } from "resend";

// Lazy — evita crash durante la build quando RESEND_API_KEY non è disponibile
function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
const FROM = process.env.EMAIL_FROM ?? "noreply@piattosolidale.it";

export async function sendDonationConfirmation(opts: {
  to: string;
  amount: number;
  date: string;
  mealsEquivalent: number;
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Grazie per la tua donazione di €${(opts.amount / 100).toFixed(2)}`,
    html: `<p>Grazie! La tua donazione del ${opts.date} equivale a <strong>${opts.mealsEquivalent} pasti</strong>.</p>`,
  });
}

export async function sendVoucherIssued(opts: {
  to: string;
  beneficiaryCode: string;
  amount: number;
  expiresAt: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Voucher emesso — ${opts.beneficiaryCode}`,
    html: `<p>Voucher <strong>${opts.beneficiaryCode}</strong> — €${(opts.amount / 100).toFixed(2)} — scade il ${opts.expiresAt}.</p>`,
  });
}

export async function sendMealServed(opts: {
  to: string;
  amount: number;
  payoutPending: boolean;
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: "Pasto solidale servito — payout in elaborazione",
    html: `<p>Pasto da €${(opts.amount / 100).toFixed(2)} registrato. Il payout è ${opts.payoutPending ? "in elaborazione" : "completato"}.</p>`,
  });
}

export async function sendPayoutCompleted(opts: {
  to: string;
  amount: number;
  transferId: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: "Payout completato",
    html: `<p>Accredito di €${(opts.amount / 100).toFixed(2)} completato (ID: ${opts.transferId}).</p>`,
  });
}

export async function sendBeneficiaryExpiringSoon(opts: {
  to: string;
  beneficiaryCode: string;
  expiresAt: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Beneficiario ${opts.beneficiaryCode} in scadenza`,
    html: `<p>Il beneficiario <strong>${opts.beneficiaryCode}</strong> scade il ${opts.expiresAt}. Rinnova la carta per continuare.</p>`,
  });
}

export async function sendBudgetExhausted(opts: {
  to: string;
  beneficiaryCode: string;
}) {
  return getResend().emails.send({
    from: FROM,
    to: opts.to,
    subject: `Budget esaurito — ${opts.beneficiaryCode}`,
    html: `<p>Il beneficiario <strong>${opts.beneficiaryCode}</strong> ha esaurito il plafond mensile.</p>`,
  });
}
