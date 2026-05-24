import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('pt-BR', ptBR)

function CriarAgendamento({ onFechar, onCriado, agendamento }) {

  const [clientes, setClientes] = useState([])
  const [barbeiros, setBarbeiros] = useState([])
  const [servicos, setServicos] = useState([])
  const [slots, setSlots] = useState([])
  const [diasTrabalhados, setDiasTrabalhados] = useState([])

  const [clienteId, setClienteId] = useState('')
  const [barbeiroId, setBarbeiroId] = useState('')
  const [servicosSelecionados, setServicosSelecionados] = useState([])
  const [data, setData] = useState(null)
  const [horario, setHorario] = useState('')

  const isEdicao = !!agendamento // 👈

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

  // 👇 Pré-preenche os campos quando for edição
  useEffect(() => {

    if (!agendamento) return

    console.log('agendamento:', agendamento) // remove depois de confirmar

    setClienteId(String(agendamento.cliente.id))
    setBarbeiroId(String(agendamento.barbeiro.id))
    setServicosSelecionados(
      agendamento.servicos?.map(s => s.id) ?? []
    )

    // 👇 Garante parse correto independente do formato da string
    const dataHoraStr = agendamento.dataHora.replace(' ', 'T')
    const dataObj = new Date(dataHoraStr)

    if (!isNaN(dataObj.getTime())) {
      setData(dataObj)
      setHorario(
        String(dataObj.getHours()).padStart(2, '0') + ':' +
        String(dataObj.getMinutes()).padStart(2, '0') + ':' +
        String(dataObj.getSeconds()).padStart(2, '0')
      )
    } else {
      console.error('Data inválida:', agendamento.dataHora)
    }

    const token = localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${agendamento.barbeiro.id}/dias`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => res.json())
      .then(dias => setDiasTrabalhados(dias))

  }, [agendamento])

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
    const dataFormatada = data.toISOString().split('T')[0]

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${barbeiroId}?data=${dataFormatada}&servicoIds=${servicosParam}`,
      { headers: { Authorization: `Bearer ${token}` } }
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
    const dataFormatada = data.toISOString().split('T')[0]
    const dataHora = `${dataFormatada}T${horario}`

    // 👇 PUT se for edição, POST se for criação
    const url = isEdicao
      ? `${import.meta.env.VITE_API_URL}/agendamentos/${agendamento.id}`
      : `${import.meta.env.VITE_API_URL}/agendamentos`

    const method = isEdicao ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
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
    })

    if (response.ok) {
      toast.success(
        isEdicao
          ? 'Agendamento atualizado com sucesso!'
          : 'Agendamento criado com sucesso!'
      )
      onCriado()
      onFechar()
    } else {
      const erro = await response.json()
      toast.error(erro.mensagem || 'Erro ao salvar agendamento')
    }

  }

  return (

    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl">

        <div className="flex items-center justify-between p-6 border-b border-gray-800">

          <div>

            {/* 👇 Título dinâmico */}
            <h3 className="text-2xl font-bold text-white">
              {isEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              {isEdicao
                ? 'Altere os dados do agendamento'
                : 'Crie um novo horário para cliente'}
            </p>

          </div>

          <button
            onClick={onFechar}
            className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center text-lg"
          >
            ✕
          </button>

        </div>

        <div className="p-6 space-y-6">

          <div>
            <p className="text-sm text-gray-400 mb-2">Cliente</p>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Barbeiro</p>
            <select
              value={barbeiroId}
              onChange={(e) => {

                setBarbeiroId(e.target.value)
                setSlots([])
                setHorario('')
                setData(null)

                if (e.target.value) {
                  const token = localStorage.getItem('token')
                  fetch(
                    `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${e.target.value}/dias`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                    .then(res => res.json())
                    .then(dias => setDiasTrabalhados(dias))
                }

              }}
              className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">Selecione um barbeiro</option>
              {barbeiros.map(b => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-3">Serviços</p>
            <div className="flex flex-wrap gap-3">
              {servicos.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleServico(s.id)}
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

          <div>
            <p className="text-sm text-gray-400 mb-2">Data</p>
            <div className="flex flex-col md:flex-row gap-3">
              <DatePicker
                locale="pt-BR"
                selected={data}
                onChange={(date) => {

                  const diasSemana = [
                    'DOMINGO', 'SEGUNDA_FEIRA', 'TERCA_FEIRA',
                    'QUARTA_FEIRA', 'QUINTA_FEIRA', 'SEXTA_FEIRA', 'SABADO'
                  ]

                  const diaSemana = diasSemana[date.getDay()]

                  if (!diasTrabalhados.includes(diaSemana)) {
                    toast.error('Barbeiro não trabalha nesse dia!')
                    return
                  }

                  setData(date)
                  setSlots([])
                  setHorario('')

                }}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione uma data"
                calendarClassName="custom-calendar"
                popperPlacement="bottom-start"
                showPopperArrow={false}
                className="flex-1 w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition"
              />
              <button
                onClick={buscarSlots}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition cursor-pointer"
              >
                Ver horários
              </button>
            </div>
          </div>

          {slots.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Horários disponíveis</p>
              <div className="flex flex-wrap gap-3">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setHorario(slot)}
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

          {/* 👇 Mostra o horário atual na edição mesmo sem buscar slots */}
          {isEdicao && horario && slots.length === 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Horário atual</p>
              <span className="px-4 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-purple-600 to-fuchsia-600 border-purple-500 text-white shadow-lg border">
                {horario.substring(0, 5)}
              </span>
              <p className="text-xs text-gray-500 mt-2">
                Clique em "Ver horários" para escolher outro
              </p>
            </div>
          )}

        </div>

        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handleSubmit}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold hover:opacity-90 transition cursor-pointer shadow-lg"
          >
            {isEdicao ? 'Salvar alterações' : 'Agendar'} {/* 👈 */}
          </button>
        </div>

      </div>

    </div>

  )

}

export default CriarAgendamento