import { useState, useEffect } from 'react'
import CriarAgendamento from './CriarAgendamento.jsx'
import { toast } from 'sonner'

function ListarAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [servicos, setServicos] = useState([])
  const [editData, setEditData] = useState('')
  const [editHorario, setEditHorario] = useState('')
  const [editServicosSelecionados, setEditServicosSelecionados] = useState([])
  const [editSlots, setEditSlots] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const itensPorPagina = 14

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const buscarAgendamentos = () => {
    const token = localStorage.getItem('token')
    fetch(`${import.meta.env.VITE_API_URL}/agendamentos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAgendamentos(data))
  }

  useEffect(() => {
    buscarAgendamentos()
    const token = localStorage.getItem('token')
    fetch(`${import.meta.env.VITE_API_URL}/servicos`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setServicos(data))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    const token = localStorage.getItem('token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/agendamentos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.ok) {
      setAgendamentos(agendamentos.filter(a => a.id !== id))
    } else {
      toast.error('Erro ao excluir agendamento!')
    }
  }

  const abrirEdicao = (agendamento) => {
    setEditandoId(agendamento.id)
    setEditData('')
    setEditHorario('')
    setEditSlots([])
    setEditServicosSelecionados(agendamento.servicos.map(s => s.id))
  }

  const buscarSlotsEdicao = async (barbeiroId, data) => {
    if (!barbeiroId || !data) return
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/disponibilidades/barbeiro/${barbeiroId}?data=${data}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (response.ok) {
      setEditSlots(await response.json())
    } else {
      setEditSlots([])
      toast.error('Barbeiro não trabalha nesse dia!')
    }
  }

  const toggleEditServico = (id) => {
    if (editServicosSelecionados.includes(id)) {
      setEditServicosSelecionados(editServicosSelecionados.filter(s => s !== id))
    } else {
      setEditServicosSelecionados([...editServicosSelecionados, id])
    }
  }

  const salvarEdicao = async (agendamento) => {
    const token = localStorage.getItem('token')
    const body = {}
    if (editServicosSelecionados.length > 0) body.servicoIds = editServicosSelecionados
    if (editData && editHorario) body.dataHora = `${editData}T${editHorario}`
    else if (editData && !editHorario) { toast.warning('Selecione um horário!'); return }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/agendamentos/${agendamento.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    if (response.ok) { buscarAgendamentos(); setEditandoId(null) }
    else { const erro = await response.json(); toast.error(erro.mensagem || 'Erro ao editar!') }
  }

  const EdicaoForm = ({ agendamento }) => (
    <div className="mt-3 p-3 bg-gray-700 rounded-lg flex flex-col gap-3">
      <div>
        <p className="text-gray-400 text-sm mb-2">Serviços</p>
        <div className="flex flex-wrap gap-2">
          {servicos.map(s => (
            <button key={s.id} onClick={() => toggleEditServico(s.id)}
              className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                editServicosSelecionados.includes(s.id) ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}>
              {s.nome}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">Nova data</p>
        <div className="flex gap-2 flex-wrap">
          <input type="date" value={editData} min={new Date().toISOString().split('T')[0]}
            onChange={(e) => { setEditData(e.target.value); setEditSlots([]); setEditHorario('') }}
            className="p-2 rounded-lg bg-gray-600 text-white outline-none text-sm" />
          <button onClick={() => buscarSlotsEdicao(agendamento.barbeiro.id, editData)}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer">
            Ver horários
          </button>
        </div>
      </div>
      {editSlots.length > 0 && (
        <div>
          <p className="text-gray-400 text-sm mb-2">Horários disponíveis</p>
          <div className="flex flex-wrap gap-2">
            {editSlots.map(slot => (
              <button key={slot} onClick={() => setEditHorario(slot)}
                className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  editHorario === slot ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}>
                {slot.substring(0, 5)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => salvarEdicao(agendamento)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer">
          Salvar
        </button>
        <button onClick={() => setEditandoId(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 cursor-pointer">
          Cancelar
        </button>
      </div>
    </div>
  )

  const totalPaginas = Math.ceil(agendamentos.length / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const itensPagina = agendamentos.slice(inicio, inicio + itensPorPagina)

  const Paginacao = () => (
    <div className="flex gap-2 mt-6 items-center">
      <button onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))} disabled={paginaAtual === 1}
        className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 cursor-pointer">Anterior</button>
      <span className="text-gray-400 text-sm">Página {paginaAtual} de {totalPaginas}</span>
      <button onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))} disabled={paginaAtual === totalPaginas}
        className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 cursor-pointer">Próxima</button>
    </div>
  )

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h3 className="text-xl font-bold">Agendamentos</h3>
        <button onClick={() => setModalAberto(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer text-sm">
          + Novo Agendamento
        </button>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-3">
          {itensPagina.map(a => (
            <div key={a.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-medium">{a.cliente.nome}</p>
                  <p className="text-gray-400 text-sm">{a.barbeiro.nome}</p>
                  <p className="text-gray-400 text-sm">{a.dataHora}</p>
                  <p className="text-sm mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      a.status === 'AGENDADO' ? 'bg-green-700' :
                      a.status === 'CANCELADO' ? 'bg-red-700' : 'bg-gray-600'
                    }`}>{a.status}</span>
                    <span className="ml-2 text-gray-300">R$ {a.valorTotal.toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEdicao(a)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(a.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer">
                    Excluir
                  </button>
                </div>
              </div>
              {editandoId === a.id && <EdicaoForm agendamento={a} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="pb-3">ID</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Barbeiro</th>
                <th className="pb-3">Data/Hora</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map(a => (
                <>
                  <tr key={a.id} className="border-b border-gray-800">
                    <td className="py-3">{a.id}</td>
                    <td className="py-3">{a.cliente.nome}</td>
                    <td className="py-3">{a.barbeiro.nome}</td>
                    <td className="py-3">{a.dataHora}</td>
                    <td className="py-3">{a.status}</td>
                    <td className="py-3">R$ {a.valorTotal.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => abrirEdicao(a)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer">
                          Editar
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editandoId === a.id && (
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <td colSpan={7} className="py-4 px-2">
                        <EdicaoForm agendamento={a} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Paginacao />

      {modalAberto && (
        <CriarAgendamento
          onFechar={() => setModalAberto(false)}
          onCriado={buscarAgendamentos}
        />
      )}
    </div>
  )
}

export default ListarAgendamentos