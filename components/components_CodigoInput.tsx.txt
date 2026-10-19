"use client";

import { useState } from "react";

// Formato de código: IFR00 + 5 números + "-" + letra + 00000
// (algunos códigos llevan además un sufijo corto, ej. "-TM")
const COMPLETO = /^IFR00(\d{5})-([A-Z])00000(?:-([A-Z0-9]{1,4}))?$/;

// Campo de código con las partes fijas bloqueadas: solo se tipean los
// 5 números y la letra. Envía el código ya armado en un campo oculto
// llamado "codigo", así que las Server Actions no cambian.
export default function CodigoInput() {
  const [numeros, setNumeros] = useState("");
  const [letra, setLetra] = useState("");
  const [sufijo, setSufijo] = useState("");

  const completo = numeros.length === 5 && letra.length === 1;
  const codigo = completo
    ? `IFR00${numeros}-${letra}00000${sufijo ? `-${sufijo}` : ""}`
    : "";

  // Si pegan un código entero (ej. copiado de una planilla), se reparte solo.
  function alPegar(e: React.ClipboardEvent<HTMLInputElement>) {
    const texto = e.clipboardData.getData("text").trim().toUpperCase();
    const m = COMPLETO.exec(texto);
    if (m) {
      e.preventDefault();
      setNumeros(m[1]);
      setLetra(m[2]);
      setSufijo(m[3] ?? "");
    }
  }

  const fijo =
    "rounded-md bg-base-border/40 px-2 py-2 font-mono text-sm text-navy-700 select-none";
  const campo =
    "rounded-md border border-base-border px-2 py-2 font-mono text-sm text-center focus-visible:border-accent";

  return (
    <div>
      <input type="hidden" name="codigo" value={codigo} />

      <div className="flex flex-wrap items-center gap-1">
        <span className={fijo}>IFR00</span>
        <input
          aria-label="Cinco números del código"
          value={numeros}
          onChange={(e) => setNumeros(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onPaste={alPegar}
          inputMode="numeric"
          pattern="[0-9]{5}"
          maxLength={5}
          required
          placeholder="00000"
          className={`${campo} w-20`}
        />
        <span className={fijo}>-</span>
        <input
          aria-label="Letra del código"
          value={letra}
          onChange={(e) => setLetra(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 1))}
          pattern="[A-Z]"
          maxLength={1}
          required
          placeholder="A"
          className={`${campo} w-12 uppercase`}
        />
        <span className={fijo}>00000</span>

        <span className="ml-2 text-xs text-navy-700">sufijo (opcional)</span>
        <input
          aria-label="Sufijo opcional del código"
          value={sufijo}
          onChange={(e) => setSufijo(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4))}
          maxLength={4}
          placeholder="TM"
          className={`${campo} w-16 uppercase`}
        />
      </div>

      <p className="mt-1.5 font-mono text-xs text-navy-700">
        {codigo ? `Código: ${codigo}` : "Completá los 5 números y la letra."}
      </p>
    </div>
  );
}
