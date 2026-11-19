// Frases aprobadas en Nota.docx. Se elige una por rango y por examen.
export const FRASES_RESULTADOS: Record<string, string[]> = {
  "95-100": [
    "🏆 ¡Vayan preparando la ceremonia, que este colega ya está listo para ascender!",
    "🏆¡Con esa nota, hasta el jurado se pone de pie!",
    "🏆¡Ese nuevo grado ya te está esperando, colega!",
    "🏆¡Prepárate para la pista de combate!",
    "🏆¡Fijo asciendes!",
    "🏆¡Ya triunfaste, eres un éxito!",
    "🏆 ¡Excelente, que te registren para la ceremonia de ascenso! Excelente desempeño.",
    "🏆¡Con esa nota, hasta el comandante te saluda primero!",
    "🏆¡El ascenso te está esperando con los grados en la mano!",
    "🏆¡Ya no estudies tanto, colega, que vas a terminar ascendiendo a general!"
  ],
  "90-94": [
    "¡Anda practicando cómo vas a saludar con tu nuevo grado!",
    "¡Ya puedes ir pensando dónde celebrar el ascenso!",
    "¡El ascenso está más cerca que la próxima formación!",
    "¡Ya puedes ir alistando el uniforme para tu nuevo grado!",
    "¡Colega, el ascenso ya te tiene en su lista de favoritos!",
    "¡Con esa nota, ya puedes ir practicando cómo dar órdenes con tu nuevo grado!",
    "¡Colega, sigue así y hasta tu jefe tendrá que felicitarte!",
    "¡El examen intentó complicarte la vida, pero terminó perdiendo!",
    "¡Con esa nota, el ascenso ya está preguntando por tu nombre!",
    "¡Muy bien, colega! Eres bueno!"
  ],
  "80-89": [
    "¡Vas rumbo al ascenso, pero todavía no mandes a confeccionar las insignias!",
    "¡Buen trabajo, colega! Sigue así y pronto estarás estrenando grado.",
    "¡Ya casi puedes cambiar las insignias, pero no sueltes el balotario!",
    "¡Vas bien, pero no te confíes! Todavía falta pulir esos conocimientos.",
    "¡Ya puedes ir mirando insignias, pero todavía no las compres!",
    "¡Con esa nota, el ascenso ya te está coqueteando, pero todavía no te ha dicho que sí!",
    "¡El ascenso está cerca, pero todavía te está haciendo esperar en la puerta!",
    "¡Con esa nota, el nuevo grado ya te está haciendo ojitos!"
  ],
  "70-79": [
    "¡Vas bien, pero todavía no invites a la familia a la ceremonia!",
    "¡El ascenso se ve cerca, pero todavía tienes que sudar el uniforme!",
    "¡Buen intento, colega! Pero no te duermas en tu servicio."
  ],
  "60-69": [
    "¡Estás en carrera, pero con esa nota todavía no encargues tus insignias!",
    "¡Hay esperanza, colega! Pero el balotario todavía tiene asuntos pendientes contigo.",
    "¡El ascenso no llega por antigüedad de estudio, sigue repasando!",
    "¡Estás cerca, pero el ascenso no se regala! A seguir estudiando."
  ],
  "50-59": [
    "¡Para el próximo proceso será, colega! Por ahora sigue abrazado a tu balotario.",
    "¡Con esa nota, mejor ni compres los grados nuevos! Prepárate mejor.",
    "¡El ascenso te dejó en visto! A seguir estudiando.",
    "¡Para el otro año será colega! Todavía tienes bastante que repasar."
  ],
  "30-49": [
    "¡Colega, parece que estudiaste el balotario equivocado!",
    "¡Con esa nota, el ascenso solicitó cambio de unidad!",
    "¡El balotario te conoce, pero tú parece que no lo conoces a él!",
    "¡Mejor anda buscando tu balotario otra vez! Este examen te ganó la batalla."
  ],
  "0-29": [
    "¡Mejor pide tu baja! Porque el examen te pasó a situación de retiro académico.",
    "¡Con esa nota, el ascenso te declaró NO APTO sin pensarlo dos veces!",
    "¡Colega, el ascenso se fue sin despedirse!",
    "¡Ni el sistema sabe cómo explicarte este resultado!",
    "¡Mejor pide tu baja! Porque con esa nota hasta el sistema está preocupado!",
    "¡Con esa nota, mejor empieza a estudiar para la promoción 2028!",
    "¡Con esa nota, el balotario debería ponerte una denuncia por abandono!",
    "¡Colega, el examen era de conocimientos, no de marcar al azar!"
  ]
}

export function frasePorNota(nota: number): string {
  const rango = nota >= 95 ? '95-100' : nota >= 90 ? '90-94' : nota >= 80 ? '80-89' : nota >= 70 ? '70-79' : nota >= 60 ? '60-69' : nota >= 50 ? '50-59' : nota >= 30 ? '30-49' : '0-29'
  const opciones = FRASES_RESULTADOS[rango]
  return opciones[Math.floor(Math.random() * opciones.length)]
}
