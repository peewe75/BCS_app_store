"use client"

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { RisultatoCalcolo } from "@/types/calcolo"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1B4F8A",
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B4F8A",
  },
  date: {
    fontSize: 9,
    color: "#666",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1B4F8A",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    color: "#374151",
  },
  value: {
    fontWeight: "bold",
    fontVariantNumeric: "tabular-nums",
  },
  highlightBox: {
    backgroundColor: "#F1F5F9",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1B4F8A",
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1B4F8A",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
})

interface PDFDocumentProps {
  risultato: RisultatoCalcolo
}

export function DocumentoPDF({ risultato }: PDFDocumentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getBadgeColor = () => {
    switch (risultato.tipoRavvedimento) {
      case 'sprint_15': return { bg: "#D1FAE5", text: "#065F46" }
      case 'breve': return { bg: "#FEF3C7", text: "#92400E" }
      case 'intermedio': return { bg: "#FED7AA", text: "#9A3412" }
      case 'lungo': return { bg: "#FEE2E2", text: "#991B1B" }
      case 'lunghissimo': return { bg: "#EDE9FE", text: "#5B21B6" }
      default: return { bg: "#E2E8F0", text: "#374151" }
    }
  }

  const badgeColor = getBadgeColor()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>RavvedimentoFacile</Text>
          <View>
            <Text style={styles.date}>Data: {formatDate(risultato.calcolatoIl)}</Text>
            <Text style={styles.date}>Documento #{risultato.calcolatoIl.getTime().toString(36).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dati del Calcolo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tributo:</Text>
            <Text style={styles.value}>
              {risultato.input.codiceTributo || "N/A"} - {risultato.input.nomeTributo || "Non specificato"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Importo originale:</Text>
            <Text style={styles.value}>{formatCurrency(risultato.input.importoOriginale)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data scadenza:</Text>
            <Text style={styles.value}>{formatDate(risultato.input.dataScadenza)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data versamento:</Text>
            <Text style={styles.value}>{formatDate(risultato.input.dataVersamento)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Giorni di ritardo:</Text>
            <Text style={styles.value}>{risultato.giorniRitardo} giorni</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo ravvedimento:</Text>
            <View style={[styles.badge, { backgroundColor: badgeColor.bg }]}>
              <Text style={{ color: badgeColor.text }}>{risultato.nomeTipoRavvedimento}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dettaglio Sanzioni</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sanzione base (30%):</Text>
            <Text style={styles.value}>{formatCurrency(risultato.sanzioneMassima)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Riduzione applicata:</Text>
            <Text style={styles.value}>{risultato.percentualeSanzioneRidotta.toFixed(4)}%</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sanzione ridotta:</Text>
            <Text style={styles.value}>{formatCurrency(risultato.sanzioneRidotta)}</Text>
          </View>
        </View>

        {risultato.dettaglioInteressi.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dettaglio Interessi</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Anno</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Giorni</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Tasso</Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Interessi</Text>
              </View>
              {risultato.dettaglioInteressi.map((d) => (
                <View key={d.anno} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{d.anno}</Text>
                  <Text style={styles.tableCell}>{d.giorniInAnno}</Text>
                  <Text style={styles.tableCell}>{d.tassoPercentuale}%</Text>
                  <Text style={styles.tableCell}>{formatCurrency(d.interessiAnno)}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={styles.label}>Totale interessi:</Text>
              <Text style={styles.value}>{formatCurrency(risultato.totaleInteressi)}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riepilogo Versamento</Text>
          <View style={styles.highlightBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTALE DA VERSARE:</Text>
              <Text style={styles.totalValue}>{formatCurrency(risultato.totaleDaVersare)}</Text>
            </View>
          </View>
          {risultato.input.codiceTributo && (
            <View style={[styles.row, { marginTop: 15 }]}>
              <Text style={styles.label}>Codice tributo F24:</Text>
              <Text style={styles.value}>{risultato.input.codiceTributo}</Text>
            </View>
          )}
          <View style={[styles.row, { marginTop: 5 }]}>
            <Text style={styles.label}>Data versamento:</Text>
            <Text style={styles.value}>{formatDate(risultato.input.dataVersamento)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Calcolo effettuato con RavvedimentoFacile</Text>
          <Text style={{ marginTop: 3 }}>Riferimento normativo: {risultato.riferimentoNormativo}</Text>
          <Text style={{ marginTop: 5 }}>
            DISCLAIMER: Questo documento è generato automaticamente a scopo informativo. 
            Si raccomanda di verificare sempre con il proprio consulente fiscale.
          </Text>
          <Text style={{ marginTop: 3 }}>Pagina 1 di 1</Text>
        </View>
      </Page>
    </Document>
  )
}
