// Formato compartido del panel de Cristian.

export function semaforo(category: string | null, score: number): string {
  if (category === "hot") return `🔥 ${score}`;
  if (category === "warm") return `🟡 ${score}`;
  return `❄️ ${score}`;
}

export function fecha(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
