import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-4xl font-bold mb-4">404 - Pagina non trovata</h2>
            <p className="text-muted-foreground mb-8">La pagina che stai cercando non esiste o è stata spostata.</p>
            <Button asChild>
                <Link href="/">Torna alla Home</Link>
            </Button>
        </div>
    )
}
