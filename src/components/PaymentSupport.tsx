// Recapiti SWA verificati in Social-Media-app/lib/legal-config.ts.
const SUPPORT_PHONE = '+39 347 719 6603'
const SUPPORT_EMAIL = 'swsdautomation@gmail.com'

export default function PaymentSupport() {
  return (
    <aside aria-label="Assistenza pagamenti SWA" style={{ marginTop: 16, padding: 16, border: '1px solid #718096', borderRadius: 12, fontSize: 14, lineHeight: 1.6, overflowWrap: 'anywhere' }}>
      <strong>Problemi con il pagamento? Contatta SWA.</strong>
      <p>Se l’addebito è incerto o non riesci ad accedere dopo il pagamento, contattaci prima di ripagare.</p>
      <p><a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>Chiama: {SUPPORT_PHONE}</a><br />
        <a href={`mailto:${SUPPORT_EMAIL}?subject=Assistenza%20pagamento%20SWA`}>Email: {SUPPORT_EMAIL}</a></p>
      <small>Indica il corso o tool, la data e l’eventuale riferimento ordine. Non inviare dati della carta, codici di sicurezza o password.</small>
    </aside>
  )
}
