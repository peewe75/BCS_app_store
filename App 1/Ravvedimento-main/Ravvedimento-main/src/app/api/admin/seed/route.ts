import { NextResponse } from "next/server";
import { initFirebase } from "@/lib/firebase/client";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { TASSI_INTERESSE_STORICI, SCAGLIONI_SANZIONI } from "@/lib/calcoli/ravvedimento";

function getDB() {
    const { app } = initFirebase();
    return getFirestore(app);
}

export async function POST() {
    try {
        const db = getDB();

        // Elimina vecchi dati
        const tassiSnap = await getDocs(collection(db, "tassi"));
        for (const d of tassiSnap.docs) await deleteDoc(doc(db, "tassi", d.id));

        const sanzioniSnap = await getDocs(collection(db, "sanzioni"));
        for (const d of sanzioniSnap.docs) await deleteDoc(doc(db, "sanzioni", d.id));

        // Inserisci tassi storici
        const tassiPromises = TASSI_INTERESSE_STORICI.map(t => addDoc(collection(db, "tassi"), t));
        await Promise.all(tassiPromises);

        // Inserisci scaglioni sanzioni
        const sanzioniPromises = SCAGLIONI_SANZIONI.map(s => addDoc(collection(db, "sanzioni"), s));
        await Promise.all(sanzioniPromises);

        return NextResponse.json({
            success: true,
            tassiSeedati: TASSI_INTERESSE_STORICI.length,
            sanzioniSeedate: SCAGLIONI_SANZIONI.length,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Errore durante il seeding" }, { status: 500 });
    }
}
