import { useState, useEffect } from 'react'
import CriarAgendamento from './CriarAgendamento.jsx'
import { toast } from 'sonner'

function ListarAgendamentos() {

  const [agendamentos, setAgendamentos] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)

  const [confirmarDelete, setConfirmarDelete] = useState(false)
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState(null)

  const [editandoId, setEditandoId] = useState(null)
  const [servicos, setServicos] = useState([])
  const [editData, setEditData] = useState('')
  const [editHorario, setEditHorario] = useState('')
  const [editServicosSelecionados, setEditServicosSelecionados] = useState([])
  const [editSlots, setEditSlots] = useState([])

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const itensPorPagina = 14

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
      .then(data => setAgendamentos(data))

  }

  useEffect(() => {

    buscarAgendamentos()

    const token =
      localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/servicos`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => setServicos(data))

  }, [])

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

  const abrirEdicao = (agendamento) => {

    setEditandoId(agendamento.id)

    setEditData('')

    setEditHorario('')

    setEditSlots([])

    setEditServicosSelecionados(
      agendamento.servicos.map(s => s.id)
    )

  }

  const buscarSlotsEdicao = async (
    barbeiroId,
    data
  ) => {

    if (!barbeiroId || !data)
      return

    const token =
      localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${barbeiroId}?data=${data}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {

      setEditSlots(
        await response.json()
      )

    } else {

      setEditSlots([])

      toast.error(
        'Barbeiro não trabalha nesse dia!'
      )

    }

  }

  const toggleEditServico = (id) => {

    if (
      editServicosSelecionados.includes(id)
    ) {

      setEditServicosSelecionados(
        editServicosSelecionados.filter(
          s => s !== id
        )
      )

    } else {

      setEditServicosSelecionados([
        ...editServicosSelecionados,
        id
      ])

    }

  }

  const salvarEdicao = async (
    agendamento
  ) => {

    const token =
      localStorage.getItem('token')

    const body = {}

    if (
      editServicosSelecionados.length > 0
    ) {
      body.servicoIds =
        editServicosSelecionados
    }

    if (editData && editHorario) {

      body.dataHora =
        `${editData}T${editHorario}`

    } else if (
      editData &&
      !editHorario
    ) {

      toast.warning(
        'Selecione um horário!'
      )

      return

    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/agendamentos/${agendamento.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
          Authorization:
            `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    )

    if (response.ok) {

      buscarAgendamentos()

      setEditandoId(null)

      toast.success(
        'Agendamento atualizado!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem ||
        'Erro ao editar!'
      )

    }

  }

  const totalPaginas = Math.ceil(
    agendamentos.length /
    itensPorPagina
  )

  const inicio =
    (paginaAtual - 1) *
    itensPorPagina

  const itensPagina =
    agendamentos.slice(
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
                  {a.dataHora}
                </p>

                <div className="flex items-center gap-3 mt-2">

                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    a.status === 'AGENDADO'
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
                  onClick={() =>
                    abrirEdicao(a)
                  }
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

      {/* Modal criar */}

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

      {/* Modal excluir */}

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