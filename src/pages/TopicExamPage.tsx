import ExamPage from './ExamPage'

type Props = {
  tema: string
  cantidad: number
  regresar?: () => void
}

export default function TopicExamPage({
  tema,
  cantidad,
  regresar,
}: Props) {
  return (
    <ExamPage
      tema={tema}
      cantidad={cantidad}
      regresar={regresar}
    />
  )
}