"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { useCalculatorStore, TRIBUTI } from "@/store/calculator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StepIndicator } from "./StepIndicator"
import { format } from "date-fns"
import { Calculator, Calendar, ArrowRight, TrendingUp, RotateCcw, Download, Loader2, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs"
import { calcolaRavvedimento } from "@/lib/calcoli/ravvedimento"
import { saveCalcolo } from "@/lib/firebase/client"
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DocumentoPDF } from "../pdf/DocumentoPDF";

const calcoloSchema = z.object({
  codiceTributo: z.string().min(1, "Seleziona un tributo"),
  importoOriginale: z.string().min(1, "Inserisci un importo valido"),
  dataScadenza: z.string().min(1, "Seleziona la data di scadenza"),
  dataVersamento: z.string().min(1, "Seleziona la data di versamento"),
})

type CalcoloFormData = z.infer<typeof calcoloSchema>

export function FormRavvedimento() {
  const { step, input, setStep, setInput, calculate, reset, risultato, error } = useCalculatorStore()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CalcoloFormData>({
    resolver: zodResolver(calcoloSchema),
    defaultValues: {
      codiceTributo: input.codiceTributo || "",
      importoOriginale: input.importoOriginale ? String(input.importoOriginale) : "",
      dataScadenza: input.dataScadenza ? format(input.dataScadenza, 'yyyy-MM-dd') : "",
      dataVersamento: input.dataVersamento ? format(input.dataVersamento, 'yyyy-MM-dd') : "",
    },
  })

  useEffect(() => {
    if (input.codiceTributo) setValue("codiceTributo", input.codiceTributo)
    if (input.importoOriginale) setValue("importoOriginale", String(input.importoOriginale))
    if (input.dataScadenza) setValue("dataScadenza", format(input.dataScadenza, 'yyyy-MM-dd'))
    if (input.dataVersamento) setValue("dataVersamento", format(input.dataVersamento, 'yyyy-MM-dd'))
  }, [input, setValue])

  const { user } = useUser();

  const onSubmit = async (data: CalcoloFormData) => {
    // Gestiamo sia la virgola che il punto come separatore decimale
    const importoStr = data.importoOriginale.replace(',', '.');
    const importo = parseFloat(importoStr);

    if (isNaN(importo) || importo <= 0) {
      return;
    }

    if (step === 1) {
      setInput({
        codiceTributo: data.codiceTributo,
        nomeTributo: TRIBUTI.find(t => t.codiceTributo === data.codiceTributo)?.nome || "",
        importoOriginale: importo,
      });
      setStep(2);
      return;
    }

    if (step === 2) {
      const scadenza = new Date(data.dataScadenza);
      const versamento = new Date(data.dataVersamento);

      setInput({
        codiceTributo: data.codiceTributo,
        importoOriginale: importo,
        dataScadenza: scadenza,
        dataVersamento: versamento,
      });

      calculate();

      // Se l'utente è loggato, salviamo il calcolo
      if (user) {
        // Il calcolo avviene nello store, quindi dobbiamo aspettare che sia pronto o ricalcolare qui per il salvataggio
        // Per semplicità, richiamiamo calcolaRavvedimento qui e salviamo
        try {
          const risultato = calcolaRavvedimento({
            importoOriginale: importo,
            dataScadenza: scadenza,
            dataVersamento: versamento,
            codiceTributo: data.codiceTributo,
            nomeTributo: TRIBUTI.find(t => t.codiceTributo === data.codiceTributo)?.nome || "",
          });
          await saveCalcolo(risultato, user.id);

          // Dispatch dell'evento per aggiornare la dashboard immediatamente
          window.dispatchEvent(new CustomEvent('calcoloSaved'));

        } catch (e) {
          console.error("Errore salvataggio calcolo:", e);
        }
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-none shadow-2xl shadow-neutral-200/50 rounded-2xl md:rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-5 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-neutral-900 tracking-tight">Calcolo Ravvedimento</CardTitle>
                <CardDescription className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Passaggio {step} di 3</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full bg-white font-bold text-primary border-primary/20 px-3 py-1">Aggiornato 2025</Badge>
          </div>
          <StepIndicator currentStep={step} />
        </CardHeader>

        <CardContent className="p-5 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="codiceTributo" className="text-sm font-bold text-neutral-700 ml-1">Tipo di Tributo</Label>
                  <select
                    id="codiceTributo"
                    {...register("codiceTributo")}
                    className="w-full h-12 bg-neutral-50 border-neutral-200 rounded-xl px-4 text-neutral-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Seleziona un tributo...</option>
                    {TRIBUTI.map((t) => (
                      <option key={t.codiceTributo} value={t.codiceTributo}>
                        {t.codiceTributo} - {t.nome}
                      </option>
                    ))}
                  </select>
                  {errors.codiceTributo && (
                    <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.codiceTributo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importoOriginale" className="text-sm font-bold text-neutral-700 ml-1">Importo Tributo Dovuto (€)</Label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold group-focus-within:text-primary transition-colors">€</span>
                    <Input
                      id="importoOriginale"
                      type="text"
                      placeholder="0,00"
                      className="h-12 bg-neutral-50 border-neutral-200 rounded-xl pl-9 text-neutral-900 font-bold placeholder:text-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      {...register("importoOriginale")}
                    />
                  </div>
                  {errors.importoOriginale && (
                    <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.importoOriginale.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-dark rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                  Continua <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-500">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Tributo Selezionato</p>
                  <p className="text-sm font-bold text-neutral-900">{input.codiceTributo} - {input.nomeTributo}</p>
                  <p className="text-sm font-black text-primary mt-1">€ {input.importoOriginale?.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataScadenza" className="text-sm font-bold text-neutral-700 ml-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Data Scadenza
                    </Label>
                    <Input
                      id="dataScadenza"
                      type="date"
                      className="h-12 bg-neutral-50 border-neutral-200 rounded-xl px-4 text-neutral-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      {...register("dataScadenza")}
                    />
                    {errors.dataScadenza && (
                      <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.dataScadenza.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataVersamento" className="text-sm font-bold text-neutral-700 ml-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Data Versamento
                    </Label>
                    <Input
                      id="dataVersamento"
                      type="date"
                      className="h-12 bg-neutral-50 border-neutral-200 rounded-xl px-4 text-neutral-900 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      {...register("dataVersamento")}
                    />
                    {errors.dataVersamento && (
                      <p className="text-xs font-bold text-red-500 ml-1 mt-1">{errors.dataVersamento.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 border-neutral-200 rounded-xl px-6 font-bold text-neutral-600 hover:bg-neutral-50 transition-all">
                    Indietro
                  </Button>
                  <Button type="submit" className="flex-1 h-12 bg-primary hover:bg-primary-dark rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all">
                    Calcola Risultato <TrendingUp className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && risultato && (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-neutral-900 text-white shadow-xl shadow-neutral-200 overflow-hidden relative">
                    <TrendingUp className="absolute top-2 right-2 h-16 w-16 md:h-20 md:w-20 opacity-10" />
                    <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest mb-1 relative z-10">Totale Ravvedimento</p>
                    <p className="text-2xl md:text-3xl font-black text-white relative z-10">€ {risultato.totaleDaVersare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-neutral-50 border border-neutral-100">
                      <p className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Sanzione</p>
                      <p className="text-base md:text-lg font-black text-neutral-900">€ {risultato.sanzioneRidotta.toFixed(2)}</p>
                    </div>
                    <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-neutral-50 border border-neutral-100">
                      <p className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Interessi</p>
                      <p className="text-base md:text-lg font-black text-neutral-900">€ {risultato.totaleInteressi.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {risultato.dettaglioInteressi.length > 0 && (
                  <div className="rounded-[2rem] border border-neutral-100 bg-neutral-50/30 p-6 overflow-hidden">
                    <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" /> Dettaglio Interessi Legali
                    </h4>
                    <div className="space-y-3">
                      {risultato.dettaglioInteressi.map((d) => (
                        <div key={d.anno} className="flex justify-between items-center text-xs group">
                          <span className="text-neutral-500 font-medium">Anno {d.anno} ({d.giorniInAnno} gg, {d.tassoPercentuale}%)</span>
                          <span className="font-bold text-neutral-900">€ {d.interessiAnno.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={reset} className="h-12 md:h-14 border-neutral-200 rounded-xl md:rounded-2xl px-6 font-bold text-neutral-600 hover:bg-neutral-50 shadow-sm transition-all order-2 sm:order-1">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                  </Button>
                  <PDFDownloadLink
                    document={<DocumentoPDF risultato={risultato} />}
                    fileName={`ravvedimento_${risultato.input.codiceTributo}_${format(new Date(), 'dd-MM-yyyy')}.pdf`}
                    className="flex-1 order-1 sm:order-2"
                  >
                    {({ loading }) => (
                      <Button type="button" className="w-full h-12 md:h-14 bg-success hover:bg-success-dark text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl shadow-success/20 hover:-translate-y-0.5 active:scale-95 transition-all" disabled={loading}>
                        {loading ? (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generazione...</>
                        ) : (
                          <><Download className="mr-2 h-5 w-5" /> Scarica PDF</>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3 animate-bounce">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-black text-lg">!</span>
                </div>
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
