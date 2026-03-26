// Stub per Resend Email
// Da configurare dopo con la chiave API di Resend

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
}

export async function sendEmail(options: EmailOptions) {
  console.log('[RESEND STUB] sendEmail:', {
    to: options.to,
    subject: options.subject,
    hasHtml: !!options.html,
    hasAttachments: !!options.attachments,
  })
  
  return {
    id: 'resend-stub-' + Date.now(),
    from: 'RavvedimentoFacile <noreply@ravvedimentofacile.it>',
    to: options.to,
    subject: options.subject,
  }
}

export async function sendPDFEmail(
  to: string,
  pdfBuffer: Buffer,
  calcoloData: {
    totale: number
    codiceTributo: string
    dataVersamento: Date
  }
) {
  console.log('[RESEND STUB] sendPDFEmail:', { to, calcoloData })
  
  return sendEmail({
    to,
    subject: `Ravvedimento Operoso - Calcolo del ${new Date().toLocaleDateString('it-IT')}`,
    html: `
      <h1>Ravvedimento Operoso</h1>
      <p>Ecco il calcolo del ravvedimento operoso richiesto.</p>
      <ul>
        <li><strong>Totale da versare:</strong> € ${calcoloData.totale.toFixed(2)}</li>
        <li><strong>Codice tributo:</strong> ${calcoloData.codiceTributo}</li>
        <li><strong>Data versamento:</strong> ${calcoloData.dataVersamento.toLocaleDateString('it-IT')}</li>
      </ul>
      <p>Allegato il PDF con il dettaglio completo del calcolo.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Questo messaggio è stato generato automaticamente da RavvedimentoFacile.<br>
        Si raccomanda di verificare sempre con il proprio consulente fiscale.
      </p>
    `,
    attachments: [
      {
        filename: `ravvedimento-${Date.now()}.pdf`,
        content: pdfBuffer,
      },
    ],
  })
}
