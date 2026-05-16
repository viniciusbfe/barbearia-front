import { useState, useEffect } from 'react'
import CriarAgendamento from './CriarAgendamento.jsx'

function ListarAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)
  const itensPorPagina = 14

  const buscarAgendamentos = () => {
    const token = localStorage.getItem('token')
    fetch(`${import.meta.env.VITE_API_URL}/agendamentos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAgendamentos(data))
  }

  useEffect(() => {
    buscarAgendamentos()
  }, [])

  const totalPaginas = Math.ceil(agendamentos.length / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const itensPagina = agendamentos.slice(inicio, inicio + itensPorPagina)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Agendamentos</h3>
        <button
          onClick={() => setModalAberto(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer"
        >
          + Novo Agendamento
        </button>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="pb-3">ID</th>
            <th className="pb-3">Cliente</th>
            <th className="pb-3">Barbeiro</th>
            <th className="pb-3">Data/Hora</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Valor</th>
          </tr>
        </thead>
        <tbody>
          {itensPagina.map(a => (
            <tr key={a.id} className="border-b border-gray-800">
              <td className="py-3">{a.id}</td>
              <td className="py-3">{a.cliente.nome}</td>
              <td className="py-3">{a.barbeiro.nome}</td>
              <td className="py-3">{a.dataHora}</td>
              <td className="py-3">{a.status}</td>
              <td className="py-3">R$ {a.valorTotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 mt-6 items-center">
        <button
          onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
          disabled={paginaAtual === 1}
          className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 cursor-pointer"
        >
          Anterior
        </button>

        <span className="text-gray-400 text-sm">
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas}
          className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 cursor-pointer"
        >
          Próxima
        </button>
      </div>

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