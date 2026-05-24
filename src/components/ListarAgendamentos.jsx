import { useState, useEffect } from 'react'
import CriarAgendamento from './CriarAgendamento.jsx'
import { toast } from 'sonner'
import DatePicker from 'react-datepicker'
import { ptBR } from 'date-fns/locale'

function ListarAgendamentos() {

  const [agendamentos, setAgendamentos] = useState([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([])

  const [barbeiros, setBarbeiros] = useState([])
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('')
  const [filtroData, setFiltroData] = useState(null)

  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)

  const [confirmarDelete, setConfirmarDelete] = useState(false)
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState(null)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const itensPorPagina = 14

  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState(null)


  useEffect(() => {

    const handleResize = () =>
      setIsMobile(window.innerWidth < 768)

    window.addEventListener(
      'resize',
      handleResize
    )

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      )

  }, [])

  const buscarAgendamentos = () => {

    const token =
      localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/agendamentos`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => {

        setAgendamentos(data)
        setAgendamentosFiltrados(data)

      })

  }

  useEffect(() => {

    buscarAgendamentos()

    const token =
      localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/barbeiros`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => setBarbeiros(data))

  }, [])

  useEffect(() => {

    let filtrados = [...agendamentos]

    if (filtroBarbeiro) {

      filtrados = filtrados.filter(
        a =>
          a.barbeiro.id ===
          Number(filtroBarbeiro)
      )

    }

    if (filtroData) {

      const dataFormatada =
        filtroData
          .toISOString()
          .split('T')[0]

      filtrados = filtrados.filter(
        a =>
          a.dataHora.startsWith(
            dataFormatada
          )
      )

    }

    setAgendamentosFiltrados(
      filtrados
    )

    setPaginaAtual(1)

  }, [
    filtroBarbeiro,
    filtroData,
    agendamentos
  ])

  const limparFiltros = () => {

    setFiltroBarbeiro('')
    setFiltroData(null)

  }

  const handleDelete = async () => {

    const token =
      localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/agendamentos/${agendamentoParaExcluir}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {

      setAgendamentos(
        agendamentos.filter(
          a => a.id !== agendamentoParaExcluir
        )
      )

      toast.success(
        'Agendamento excluído!'
      )

    } else {

      toast.error(
        'Erro ao excluir agendamento!'
      )

    }

    setConfirmarDelete(false)

    setAgendamentoParaExcluir(null)

  }

  const totalPaginas = Math.ceil(
    agendamentosFiltrados.length /
    itensPorPagina
  )

  const inicio =
    (paginaAtual - 1) *
    itensPorPagina

  const itensPagina =
    agendamentosFiltrados.slice(
      inicio,
      inicio + itensPorPagina
    )

  return (

    <div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">

        <div>

          <h3 className="text-2xl font-bold text-white">
            Agendamentos
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            Gerencie os horários da barbearia
          </p>

        </div>

        <button
          onClick={() =>
            setModalAberto(true)
          }
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition shadow-lg cursor-pointer"
        >
          + Novo Agendamento
        </button>

      </div>

      {/* filtros */}

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-6 shadow-xl">

        <div className="flex flex-col lg:flex-row gap-4">

          <div className="flex-1">

            <p className="text-sm text-gray-400 mb-2">
              Filtrar por barbeiro
            </p>

            <select
              value={filtroBarbeiro}
              onChange={(e) =>
                setFiltroBarbeiro(
                  e.target.value
                )
              }
              className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition cursor-pointer"
            >

              <option value="">
                Todos os barbeiros
              </option>

              {barbeiros.map(b => (

                <option
                  key={b.id}
                  value={b.id}
                >
                  {b.nome}
                </option>

              ))}

            </select>

          </div>

          <div className="flex-1">

            <p className="text-sm text-gray-400 mb-2">
              Filtrar por data
            </p>

            <DatePicker
              selected={filtroData}
              onChange={(date) =>
                setFiltroData(date)
              }
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Selecione uma data"
              calendarClassName="custom-calendar"
              popperPlacement="bottom-start"
              fixedHeight
              className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition"
            />

          </div>

          <div className="flex items-end">

            <button
              onClick={limparFiltros}
              className="w-full lg:w-auto px-5 py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white transition cursor-pointer"
            >
              Limpar filtros
            </button>

          </div>

        </div>

      </div>

      <div className="space-y-4">

        {itensPagina.map(a => (

          <div
            key={a.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl"
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div className="space-y-1">

                <h4 className="text-lg font-semibold text-white">
                  {a.cliente.nome}
                </h4>

                <p className="text-gray-400 text-sm">
                  Barbeiro: {a.barbeiro.nome}
                </p>

                <p className="text-gray-400 text-sm">
                  {new Date(a.dataHora)
                    .toLocaleString('pt-BR')}
                </p>

                <div className="flex items-center gap-3 mt-2">

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${a.status === 'AGENDADO'
                    ? 'bg-green-700 text-white'
                    : a.status === 'CANCELADO'
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-700 text-white'
                    }`}>
                    {a.status}
                  </span>

                  <span className="text-purple-400 font-semibold">
                    R$ {a.valorTotal.toFixed(2)}
                  </span>

                </div>

              </div>

              <div className="flex gap-3 flex-wrap">

                <button
                  onClick={() => setAgendamentoParaEditar(a)} // 👈
                  className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {

                    setAgendamentoParaExcluir(a.id)

                    setConfirmarDelete(true)

                  }}
                  className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                >
                  Excluir
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

      {modalAberto && (

        <CriarAgendamento
          onFechar={() =>
            setModalAberto(false)
          }
          onCriado={
            buscarAgendamentos
          }
        />

      )}

      {agendamentoParaEditar && (
        <CriarAgendamento
          agendamento={agendamentoParaEditar}
          onFechar={() => setAgendamentoParaEditar(null)}
          onCriado={() => {
            buscarAgendamentos()
            setAgendamentoParaEditar(null)
          }}
        />
      )}

      {confirmarDelete && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6">

            <h3 className="text-xl font-bold text-white mb-2">
              Excluir agendamento
            </h3>

            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir este agendamento?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => {

                  setConfirmarDelete(false)

                  setAgendamentoParaExcluir(null)

                }}
                className="flex-1 p-3 rounded-2xl bg-gray-800 text-white hover:bg-gray-700 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 p-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
              >
                Excluir
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}

export default ListarAgendamentos