import React from 'react';
import { CONFIG } from '../constants';

interface SuccessViewProps {
    onReset: () => void;
    email: string;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ onReset, email }) => {
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up py-12">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden text-center p-8 sm:p-12">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-4">Calcolo Inviato!</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Abbiamo ricevuto i tuoi dati. Il tuo calcolo personalizzato è stato elaborato e inviato a:
                    <br />
                    <span className="font-bold text-slate-800 block mt-2">{email}</span>
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Cosa succede ora?
                    </h3>
                    <ul className="text-blue-800 text-sm space-y-2 list-disc list-inside">
                        <li>Il nostro sistema sta generando il report PDF.</li>
                        <li>Riceverai un'email entro 1-2 minuti.</li>
                        <li>Se non la trovi, controlla nella cartella <strong>Spam</strong> o Promozioni.</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-4">
                    <a
                        href={CONFIG.BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                        Nell'attesa, prenota una verifica gratuita
                    </a>
                    <button
                        onClick={onReset}
                        className="text-slate-500 hover:text-slate-700 font-medium py-2 transition-colors"
                    >
                        Torna alla home
                    </button>
                </div>
            </div>
        </div>
    );
};
