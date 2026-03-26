import { NextRequest, NextResponse } from "next/server";
import { initFirebase } from "@/lib/firebase/client";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

function getDB() {
    const { app } = initFirebase();
    return getFirestore(app);
}

export async function GET() {
    try {
        const db = getDB();
        const snapshot = await getDocs(collection(db, "tassi"));
        const tassi = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        tassi.sort((a: any, b: any) => a.anno - b.anno);
        return NextResponse.json(tassi);
    } catch (error) {
        console.error("Error fetching tassi:", error);
        return NextResponse.json({ error: "Errore lettura tassi" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const db = getDB();
        const docRef = await addDoc(collection(db, "tassi"), data);
        return NextResponse.json({ id: docRef.id, ...data });
    } catch (error) {
        console.error("Error creating tasso:", error);
        return NextResponse.json({ error: "Errore creazione tasso" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, ...data } = await request.json();
        const db = getDB();
        await updateDoc(doc(db, "tassi", id), data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating tasso:", error);
        return NextResponse.json({ error: "Errore aggiornamento tasso" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        const db = getDB();
        await deleteDoc(doc(db, "tassi", id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting tasso:", error);
        return NextResponse.json({ error: "Errore eliminazione tasso" }, { status: 500 });
    }
}
