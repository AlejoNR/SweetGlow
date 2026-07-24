/**
 * Motor de la estrategia FEFO (First Expired, First Out).
 * Ordena y clasifica alimentos segun su proximidad de caducidad.
 */
export class MotorFEFO {
  /** Ordena de forma ascendente: primero los que caducan antes. */
  static ordenar(alimentos, ahora = new Date()) {
    return [...alimentos].sort(
      (a, b) => a.horasParaCaducar(ahora) - b.horasParaCaducar(ahora)
    )
  }

  /** Agrupa por estado de caducidad. */
  static clasificar(alimentos, ahora = new Date()) {
    const grupos = { critico: [], urgente: [], preventivo: [], fresco: [] }
    alimentos.forEach((a) => grupos[a.estadoCaducidad(ahora)].push(a))
    return grupos
  }

  /** Devuelve solo los que estan en la ventana de alerta (criticos + urgentes). */
  static enVentanaAlerta(alimentos, ahora = new Date()) {
    return alimentos.filter((a) =>
      ['critico', 'urgente'].includes(a.estadoCaducidad(ahora))
    )
  }
}
