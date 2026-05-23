import { useState } from 'react'
import { toast } from 'sonner'

const DIAS = [
  { id: 'SEGUNDA_FEIRA', label: 'Segunda' },
  { id: 'TERCA_FEIRA', label: 'Terça' },
  { id: 'QUARTA_FEIRA', label: 'Quarta' },
  { id: 'QUINTA_FEIRA', label: 'Quinta' },
  { id: 'SEXTA_FEIRA', label: 'Sexta' },
  { id: 'SABADO', label: 'Sábado' },
  { id: 'DOMINGO', label: 'Domingo' },
]

function CriarBarbeiro() {
  const [nome, setNome] = useState('')
  const [diasSelecionados, setDiasSelecionados] = useState({})

  const toggleDia = (diaId) => {
    setDiasSelecionados(prev => {
      if (prev[diaId]) {
        const novo = { ...prev }
        delete novo[diaId]
        return novo
      }
      return { ...prev, [diaId]: { inicio: '09:00', fim: '18:00' } }
    })
  }

  const atualizarHorario = (diaId, campo, valor) => {
    setDiasSelecionados(prev => ({
      ...prev,
      [diaId]: { ...prev[diaId], [campo]: valor }
    }))
  }

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório!')
      return
    }

    const token = localStorage.getItem('token')

    const barbeiroResponse = await fetch(`${import.meta.env.VITE_API_URL}/barbeiros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome, especialidades: [] })
    })

    if (!barbeiroResponse.ok) {
      const erro = await barbeiroResponse.json()
      toast.error(erro.mensagem || 'Erro ao criar barbeiro!')
      return
    }

    const barbeiro = await barbeiroResponse.json()

    for (const [diaId, horario] of Object.entries(diasSelecionados)) {
      await fetch(`${import.meta.env.VITE_API_URL}/disponibilidades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          barbeiroId: barbeiro.id,
          diaSemana: diaId,
          horaInicio: horario.inicio,
          horaFim: horario.fim
        })
      })
    }

    toast.success('Barbeiro criado com sucesso!')
    setNome('')
    setDiasSelecionados({})
  }

  return (
    <div className="max-w-lg">
      <h3 className="text-xl font-bold mb-6">Criar Barbeiro</h3>

      <input
        type="text"
        placeholder="Nome do barbeiro"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-3 mb-6 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
      />

      <p className="text-gray-400 text-sm mb-3">Dias de trabalho</p>
      <div className="flex flex-col gap-3 mb-6">
        {DIAS.map(dia => (
          <div key={dia.id}>
            <button
              onClick={() => toggleDia(dia.id)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                diasSelecionados[dia.id]
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {dia.label}
            </button>

            {diasSelecionados[dia.id] && (
              <div className="flex gap-3 mt-2 ml-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">Início</span>
                  <input
                    type="time"
                    value={diasSelecionados[dia.id].inicio}
                    onChange={(e) => atualizarHorario(dia.id, 'inicio', e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">Fim</span>
                  <input
                    type="time"
                    value={diasSelecionados[dia.id].fim}
                    onChange={(e) => atualizarHorario(dia.id, 'fim', e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white outline-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full p-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 cursor-pointer"
      >
        Criar
      </button>
    </div>
  )
}

export default CriarBarbeiro