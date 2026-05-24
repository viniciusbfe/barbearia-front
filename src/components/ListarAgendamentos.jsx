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

  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState(null)

  const itensPorPagina = 4

  const formatDataHora = (str) => {
    const date = new Date(str)

    if (isNaN(date)) return 'Data inválida'

    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const ano = String(date.getFullYear()).slice(-2)

    const hora = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')

    return `${dia}/${mes}/${ano} às ${hora}:${min}`
  }

  // =========================
  // BUSCAR AGENDAMENTOS
  // =========================
  const buscarAgendamentos = () => {
    const token = localStorage.getItem('token')

    fetch(`${import.meta.env.VITE_API_URL}/agendamentos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAgendamentos(data)
        setAgendamentosFiltrados(data)
      })
  }

  useEffect(() => {
    buscarAgendamentos()

    const token = localStorage.getItem('token')

    fetch(`${import.meta.env.VITE_API_URL}/barbeiros`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBarbeiros(data))

  }, [])

  // =========================
  // FILTROS
  // =========================
  useEffect(() => {

    let filtrados = [...agendamentos]

    // filtro barbeiro
    if (filtroBarbeiro) {
      filtrados = filtrados.filter(
        a => a.barbeiro?.id === Number(filtroBarbeiro)
      )
    }

    // filtro data
    if (filtroData) {
      filtrados = filtrados.filter(a => {
        if (!a.dataHora) return false

        const data = new Date(a.dataHora)
        if (isNaN(data.getTime())) return false

        return (
          data.getFullYear() === filtroData.getFullYear() &&
          data.getMonth() === filtroData.getMonth() &&
          data.getDate() === filtroData.getDate()
        )
      })
    }

    setAgendamentosFiltrados(filtrados)
    setPaginaAtual(1)

  }, [filtroBarbeiro, filtroData, agendamentos])

  const limparFiltros = () => {
    setFiltroBarbeiro('')
    setFiltroData(null)
  }

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {

    const token = localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/agendamentos/${agendamentoParaExcluir}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (response.ok) {
      setAgendamentos(agendamentos.filter(a => a.id !== agendamentoParaExcluir))
      toast.success('Agendamento excluído!')
    } else {
      toast.error('Erro ao excluir agendamento!')
    }

    setConfirmarDelete(false)
    setAgendamentoParaExcluir(null)
  }

  // =========================
  // PAGINAÇÃO
  // =========================
  const totalPaginas = Math.ceil(agendamentosFiltrados.length / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const itensPagina = agendamentosFiltrados.slice(inicio, inicio + itensPorPagina)

  // =========================
  // UI
  // =========================
  return (
    <div>

      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">

        <div>
          <h3 className="text-2xl font-bold text-white">Agendamentos</h3>
          <p className="text-gray-400 text-sm mt-1">
            Gerencie os horários da barbearia
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold hover:opacity-90 transition shadow-lg cursor-pointer"
        >
          + Novo Agendamento
        </button>

      </div>

      {/* FILTROS */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-6">

        <div className="flex flex-col lg:flex-row gap-4">

          {/* barbeiro */}
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Filtrar por barbeiro</p>

            <select
              value={filtroBarbeiro}
              onChange={(e) => setFiltroBarbeiro(e.target.value)}
              className="w-full p-4 rounded-2xl bg-gray-800 text-white"
            >
              <option value="">Todos os barbeiros</option>
              {barbeiros.map(b => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </div>

          {/* data */}
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-2">Filtrar por data</p>

            <DatePicker
              selected={filtroData}
              onChange={setFiltroData}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Selecione uma data"
              className="w-full p-4 rounded-2xl bg-gray-800 text-white"
            />
          </div>

          {/* limpar */}
          <div className="flex items-end">
            <button
              onClick={limparFiltros}
              className="cursor-pointer px-5 py-4 rounded-2xl bg-gray-800 text-white"
            >
              Limpar filtros
            </button>
          </div>

        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-4">

        {itensPagina.map(a => (
          <div
            key={a.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5"
          >

            <h4 className="text-white font-semibold">
              {a.cliente?.nome}
            </h4>

            <p className="text-gray-400 text-sm">
              Barbeiro: {a.barbeiro?.nome}
            </p>

            <p className="text-gray-400 text-sm">
              {formatDataHora(a.dataHora)}
            </p>

            <div className="flex gap-3 mt-2">

              <span className="text-purple-400 font-bold">
                R$ {a.valorTotal?.toFixed(2)}
              </span>

              <span className="text-xs px-2 py-1 rounded bg-gray-700 text-white">
                {a.status}
              </span>

            </div>

            <div className="flex gap-3 mt-4">

              <button
                onClick={() => setAgendamentoParaEditar(a)}
                className="px-4 py-2 bg-purple-600 cursor-pointer text-white rounded-xl"
              >
                Editar
              </button>

              <button
                onClick={() => {
                  setAgendamentoParaExcluir(a.id)
                  setConfirmarDelete(true)
                }}
                className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-xl"
              >
                Excluir
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* PAGINAÇÃO */}
      <div className="flex gap-3 mt-6 items-center">

        <button
          disabled={paginaAtual === 1}
          onClick={() => setPaginaAtual(p => p - 1)}
          className="cursor-pointer px-4 py-2 bg-gray-800 text-white rounded-xl"
        >
          Anterior
        </button>

        <span className="text-gray-400">
          Página {paginaAtual} de {totalPaginas || 1}
        </span>

        <button
          disabled={paginaAtual === totalPaginas}
          onClick={() => setPaginaAtual(p => p + 1)}
          className="cursor-pointer px-4 py-2 bg-gray-800 text-white rounded-xl"
        >
          Próxima
        </button>

      </div>

      {/* MODAIS */}
      {modalAberto && (
        <CriarAgendamento
          onFechar={() => setModalAberto(false)}
          onCriado={buscarAgendamentos}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-gray-900 p-6 rounded-2xl">

            <p className="text-white mb-4">
              Confirmar exclusão?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setConfirmarDelete(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-xl"
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl"
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