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
      toast.warning('Selecione um barbeiro e uma data primeiro!')
      return
    }

    if (servicosSelecionados.length === 0) {
      toast.warning('Selecione pelo menos um serviço primeiro!')
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
      toast.warning('Preencha todos os campos!')
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

    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b border-gray-800">

          <div>
            <h3 className="text-2xl font-bold text-white">
              Novo Agendamento
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Crie um novo horário para cliente
            </p>
          </div>

          <button
            onClick={onFechar}
            className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center text-lg"
          >
            ✕
          </button>

        </div>

        {/* Conteúdo */}

        <div className="p-6 space-y-6">

          {/* Cliente */}

          <div>

            <p className="text-sm text-gray-400 mb-2">
              Cliente
            </p>

            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">
                Selecione um cliente
              </option>

              {clientes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

          </div>

          {/* Barbeiro */}

          <div>

            <p className="text-sm text-gray-400 mb-2">
              Barbeiro
            </p>

            <select
              value={barbeiroId}
              onChange={(e) => {

                setBarbeiroId(e.target.value)

                setSlots([])

                setHorario('')

                setData('')

                if (e.target.value) {

                  const token =
                    localStorage.getItem('token')

                  fetch(
                    `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${e.target.value}/dias`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  )
                    .then(res => res.json())
                    .then(dias =>
                      setDiasTrabalhados(dias)
                    )

                }

              }}
              className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">
                Selecione um barbeiro
              </option>

              {barbeiros.map(b => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>

          </div>

          {/* Serviços */}

          <div>

            <p className="text-sm text-gray-400 mb-3">
              Serviços
            </p>

            <div className="flex flex-wrap gap-3">

              {servicos.map(s => (

                <button
                  key={s.id}
                  onClick={() =>
                    toggleServico(s.id)
                  }
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all cursor-pointer border ${servicosSelecionados.includes(s.id)
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-purple-500 text-white shadow-lg'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {s.nome}
                </button>

              ))}

            </div>

          </div>

          {/* Data */}

          <div>

            <p className="text-sm text-gray-400 mb-2">
              Data
            </p>

            <div className="flex flex-col md:flex-row gap-3">

              <input
                type="date"
                value={data}
                min={
                  new Date()
                    .toISOString()
                    .split('T')[0]
                }
                onChange={(e) => {

                  const diasSemana = [
                    'DOMINGO',
                    'SEGUNDA_FEIRA',
                    'TERCA_FEIRA',
                    'QUARTA_FEIRA',
                    'QUINTA_FEIRA',
                    'SEXTA_FEIRA',
                    'SABADO'
                  ]

                  const diaSemana =
                    diasSemana[
                    new Date(
                      e.target.value + 'T12:00:00'
                    ).getDay()
                    ]

                  if (
                    !diasTrabalhados.includes(
                      diaSemana
                    )
                  ) {
                    toast.error(
                      'Barbeiro não trabalha nesse dia!'
                    )

                    return
                  }

                  setData(e.target.value)

                  setSlots([])

                  setHorario('')

                }}
                className="flex-1 p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition cursor-pointer"
              />

              <button
                onClick={buscarSlots}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition cursor-pointer"
              >
                Ver horários
              </button>

            </div>

          </div>

          {/* Horários */}

          {slots.length > 0 && (

            <div>

              <p className="text-sm text-gray-400 mb-3">
                Horários disponíveis
              </p>

              <div className="flex flex-wrap gap-3">

                {slots.map(slot => (

                  <button
                    key={slot}
                    onClick={() =>
                      setHorario(slot)
                    }
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all cursor-pointer border ${horario === slot
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-purple-500 text-white shadow-lg'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                  >
                    {slot.substring(0, 5)}
                  </button>

                ))}

              </div>

            </div>

          )}

        </div>

        {/* Footer */}

        <div className="p-6 border-t border-gray-800">

          <button
            onClick={handleSubmit}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold hover:opacity-90 transition cursor-pointer shadow-lg"
          >
            Agendar
          </button>

        </div>

      </div>

    </div>
  )

}

export default CriarAgendamento