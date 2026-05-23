import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function CriarAgendamento({ onFechar, onCriado }) {
  const [clientes, setClientes] = useState([])
  const [barbeiros, setBarbeiros] = useState([])
  const [servicos, setServicos] = useState([])
  const [slots, setSlots] = useState([])
  const [diasTrabalhados, setDiasTrabalhados] = useState([])


  const [clienteId, setClienteId] = useState('')
  const [barbeiroId, setBarbeiroId] = useState('')
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClientes(data))

    fetch(`${import.meta.env.VITE_API_URL}/barbeiros`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBarbeiros(data))

    fetch(`${import.meta.env.VITE_API_URL}/servicos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setServicos(data))
  }, [])

  const buscarSlots = async () => {
    if (!barbeiroId || !data) {
      toast.error('Selecione um barbeiro e uma data primeiro!')
      return
    }

    if (servicosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um serviço primeiro!')
      return
    }

    const token = localStorage.getItem('token')
    const servicosParam = servicosSelecionados.join(',')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${barbeiroId}?data=${data}&servicoIds=${servicosParam}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (response.ok) {
      const dados = await response.json()
      setSlots(dados)
    } else {
      setSlots([])
      toast.error('Barbeiro não trabalha nesse dia!')
    }
  }

  const toggleServico = (id) => {
    if (servicosSelecionados.includes(id)) {
      setServicosSelecionados(servicosSelecionados.filter(s => s !== id))
    } else {
      setServicosSelecionados([...servicosSelecionados, id])
    }
  }

  const handleSubmit = async () => {
    if (!clienteId || !barbeiroId || !data || !horario || servicosSelecionados.length === 0) {
      toast.error('Preencha todos os campos!')
      return
    }

    const token = localStorage.getItem('token')
    const dataHora = `${data}T${horario}`

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/agendamentos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clienteId: Number(clienteId),
          barbeiroId: Number(barbeiroId),
          dataHora,
          servicoIds: servicosSelecionados
        })
      }
    )

    if (response.ok) {
      toast.success('Agendamento criado com sucesso!')
      onCriado()
      onFechar()
    } else {
      const erro = await response.json()
      toast.error(erro.mensagem || 'Erro ao criar agendamento')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Novo Agendamento</h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
        </div>

        <p className="text-gray-400 text-sm mb-1">Cliente</p>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white outline-none cursor-pointer"
        >
          <option value="">Selecione um cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>

        <p className="text-gray-400 text-sm mb-1">Barbeiro</p>
        <select
          value={barbeiroId}
          onChange={(e) => {
            setBarbeiroId(e.target.value)
            setSlots([])
            setHorario('')
            setData('')

            if (e.target.value) {
              const token = localStorage.getItem('token')
              fetch(`${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${e.target.value}/dias`, {
                headers: { Authorization: `Bearer ${token}` }
              })
                .then(res => res.json())
                .then(dias => setDiasTrabalhados(dias))
            }
          }}
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white outline-none cursor-pointer"
        >
          <option value="">Selecione um barbeiro</option>
          {barbeiros.map(b => (
            <option key={b.id} value={b.id}>{b.nome}</option>
          ))}
        </select>

        <p className="text-gray-400 text-sm mb-2">Serviços</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {servicos.map(s => (
            <button
              key={s.id}
              onClick={() => toggleServico(s.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${servicosSelecionados.includes(s.id)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {s.nome}
            </button>
          ))}
        </div>

        <p className="text-gray-400 text-sm mb-1">Data</p>
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={data}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const diasSemana = ['DOMINGO', 'SEGUNDA_FEIRA', 'TERCA_FEIRA', 'QUARTA_FEIRA', 'QUINTA_FEIRA', 'SEXTA_FEIRA', 'SABADO']
              const diaSemana = diasSemana[new Date(e.target.value + 'T12:00:00').getDay()]

              if (!diasTrabalhados.includes(diaSemana)) {
                toast.error('Barbeiro não trabalha nesse dia!')
                return
              }

              setData(e.target.value)
              setSlots([])
              setHorario('')
            }}
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white outline-none cursor-pointer"
          />

          <button
            onClick={buscarSlots}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer text-sm"
          >
            Ver horários
          </button>
        </div>

        {slots.length > 0 && (
          <>
            <p className="text-gray-400 text-sm mb-2">Horários disponíveis</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setHorario(slot)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${horario === slot
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  {slot.substring(0, 5)}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          className="w-full p-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 cursor-pointer"
        >
          Agendar
        </button>
      </div>
    </div>
  )
}

export default CriarAgendamento