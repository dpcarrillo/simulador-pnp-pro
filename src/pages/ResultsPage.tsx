import { useState } from 'react'
import { frasePorNota } from '../lib/frasesResultados'

type Detalle = {
  id: number
  tema: string
  pregunta: string
  alternativa_a: string
  alternativa_b: string
  alternativa_c: string
  alternativa_d: string
  alternativa_e: string
  respuesta: string
  marcada: string | null
}
type Props = {
  correctas: number
  incorrectas: number
  sinResponder?: number
  porcentaje: number
  tiempoUsado: string
  detalle?: Detalle[]
  regresar?: () => void
  verHistorial?: () => void
  practicarErrores?: () => void
}
const letras = ['A','B','C','D','E'] as const
// Configurar en frontend/.env.local: VITE_CONTACTO_WHATSAPP=519XXXXXXXX
const contacto = (import.meta.env.VITE_CONTACTO_WHATSAPP || '').replace(/\D/g, '')
const telefonoVisible = contacto.startsWith('51') && contacto.length === 11 ? `+51 ${contacto.slice(2,5)} ${contacto.slice(5,8)} ${contacto.slice(8)}` : contacto
const enlaceWhatsapp = contacto ? `https://wa.me/${contacto}?text=${encodeURIComponent('Hola, deseo información para acceder al Simulador PNP Pro - Promoción 2027.')}` : ''
function dividirTexto(ctx: CanvasRenderingContext2D, texto: string, ancho: number) {
  const palabras = texto.split(' ')
  const lineas: string[] = []
  let actual = ''
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra
    if (ctx.measureText(prueba).width > ancho && actual) { lineas.push(actual); actual = palabra } else actual = prueba
  }
  if (actual) lineas.push(actual)
  return lineas
}

export default function ResultsPage({correctas,incorrectas,sinResponder=0,porcentaje,tiempoUsado,detalle=[],regresar,verHistorial,practicarErrores}: Props) {
  const [frase] = useState(() => frasePorNota(porcentaje))
  const [revisando,setRevisando] = useState(false)
  const [filtro,setFiltro] = useState<'todas'|'incorrectas'>('todas')
  const total = correctas + incorrectas + sinResponder
  const compartirResultado = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#071321'; ctx.fillRect(0, 0, 1080, 1080)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#6be7ac'; ctx.font = 'bold 34px Arial'; ctx.fillText('SIMULADOR PNP PRO', 540, 100)
    ctx.fillStyle = '#b8c9d7'; ctx.font = '25px Arial'; ctx.fillText('PREPARACIÓN PARA EL ASCENSO · PROMOCIÓN 2027', 540, 148)
    ctx.fillStyle = '#e9fff4'; ctx.font = 'bold 135px Arial'; ctx.fillText(`${correctas} / ${total}`, 540, 325)
    ctx.fillStyle = '#6be7ac'; ctx.font = '32px Arial'; ctx.fillText(`${porcentaje.toFixed(2)} % DE ACIERTOS`, 540, 390)
    ctx.fillStyle = '#dce9f2'; ctx.font = '29px Arial'; ctx.fillText(`${correctas} correctas    ·    ${incorrectas} incorrectas    ·    ${sinResponder} omitidas`, 540, 475)
    ctx.fillStyle = '#ffe18c'; ctx.font = 'bold 43px Arial'
    const lineas = dividirTexto(ctx, frase, 940)
    lineas.forEach((linea, i) => ctx.fillText(linea, 540, 605 + i * 57))
    ctx.fillStyle = '#c7d9df'; ctx.font = '29px Arial'; ctx.fillText('Practica, evalúa tu progreso y prepárate para ascender.', 540, 865)
    ctx.fillStyle = '#6be7ac'; ctx.font = 'bold 36px Arial'; ctx.fillText(telefonoVisible ? `INFORMES POR WHATSAPP: ${telefonoVisible}` : 'SIMULADOR PNP PRO · PROMOCIÓN 2027', 540, 950)
    ctx.fillStyle = '#9ab4c4'; ctx.font = '23px Arial'; ctx.fillText('Plataforma independiente de preparación académica', 540, 1010)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    const file = new File([blob], 'resultado-simulador-pnp-2027.png', {type:'image/png'})
    try {
      if (navigator.share && navigator.canShare?.({files:[file]})) {
        await navigator.share({files:[file], title:'Mi resultado - Simulador PNP Pro'})
        return
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const temas = Array.from(new Set(detalle.map(d => d.tema || 'Sin tema'))).map(tema => {
    const items = detalle.filter(d => (d.tema || 'Sin tema') === tema)
    return {tema, total:items.length, aciertos:items.filter(d => d.marcada && d.marcada.toUpperCase() === d.respuesta?.toUpperCase()).length}
  })
  const preguntasVisibles = detalle.filter(d => filtro === 'todas' || !d.marcada || d.marcada.toUpperCase() !== d.respuesta?.toUpperCase())
  return <div className="pnp-results">
    <div className="pnp-results-head"><span className="pnp-results-kicker">POLICÍA NACIONAL DEL PERÚ · PROMOCIÓN 2027</span><h1>RESULTADO DEL SIMULACRO</h1><p>Examen de conocimientos finalizado</p></div>
    <div className="pnp-results-score"><div className="pnp-results-medal">{porcentaje >= 90 ? '🏆' : porcentaje >= 70 ? '🎖️' : '📋'}</div><div><strong>{correctas} / {total}</strong><span>{porcentaje.toFixed(2)} % de respuestas correctas</span></div></div>
    <div className="pnp-results-stats"><div><b className="pnp-good">{correctas}</b><span>✓ Correctas</span></div><div><b className="pnp-bad">{incorrectas}</b><span>✕ Incorrectas</span></div><div><b>{sinResponder}</b><span>— Sin responder</span></div><div><b>{tiempoUsado}</b><span>◷ Tiempo utilizado</span></div></div>
    <section className="pnp-results-message"><span>MENSAJE PARA TI</span><h2>{frase}</h2><p>{porcentaje >= 80 ? '¡Sigue entrenando para mantener ese nivel!' : 'Revisa tus respuestas y continúa reforzando tu preparación.'}</p></section>
    <section className="pnp-results-contact" aria-label="Contacto comercial del simulador">
      <div className="pnp-results-contact-copy"><strong>SIMULADOR PNP PRO · PROMOCIÓN 2027</strong><span>¿Quieres prepararte para el ascenso? Solicita tu acceso.</span></div>
      {contacto ? <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="pnp-results-whatsapp">WhatsApp: {telefonoVisible}</a> : <span className="pnp-results-contact-pending">WhatsApp comercial por configurar</span>}
      <button type="button" className="pnp-results-share" onClick={compartirResultado}>Compartir resultado</button>
    </section>
    {temas.length > 0 && <section className="pnp-results-topics"><h2>Rendimiento por temas</h2><div className="pnp-results-topic-grid">{temas.map(t => {const pct = t.total ? Math.round(t.aciertos/t.total*100) : 0; return <div className="pnp-results-topic" key={t.tema}><strong>{t.tema}</strong><span>{t.aciertos}/{t.total} · {pct}%</span><div className="pnp-results-track"><i style={{width:`${pct}%`}} /></div></div>})}</div></section>}
    <div className="pnp-results-actions"><button onClick={() => setRevisando(!revisando)}>{revisando ? 'Ocultar revisión' : 'Revisar respuestas'}</button><button onClick={practicarErrores} disabled={!practicarErrores}>Practicar errores</button><button onClick={verHistorial} disabled={!verHistorial}>Ver historial</button><button className="pnp-results-home" onClick={regresar || (()=>window.location.reload())}>Volver al inicio</button></div>
    {revisando && <section className="pnp-results-review"><h2>Revisión de respuestas</h2><div className="pnp-results-filter"><button className={filtro==='todas'?'active':''} onClick={()=>setFiltro('todas')}>Todas</button><button className={filtro==='incorrectas'?'active':''} onClick={()=>setFiltro('incorrectas')}>Incorrectas y omitidas</button></div>{preguntasVisibles.map((d,i) => <article key={d.id}><small>{i+1}. {d.tema}</small><h3>{d.pregunta}</h3>{letras.map(l=>{const texto=d[`alternativa_${l.toLowerCase()}` as keyof Detalle]; const esCorrecta=l===d.respuesta?.toUpperCase(); const elegida=l===d.marcada?.toUpperCase();return <p key={l} className={esCorrecta?'pnp-review-correct':elegida?'pnp-review-wrong':''}><b>{l}.</b> {texto} {esCorrecta?'✓ Correcta':elegida?'✕ Marcada':''}</p>})}<small>Tu respuesta: {d.marcada || 'Sin responder'}</small></article>)}</section>}
  </div>
}
