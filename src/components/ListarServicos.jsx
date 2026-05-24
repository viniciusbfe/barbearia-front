import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ListarServicos() {
  const [servicos, setServicos] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [editandoId, setEditandoId] = useState(null)
  const [editDuracao, setEditDuracao] = useState('')
  const [editPreco, setEditPreco] = useState('')
  const itensPorPagina = 14

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${import.meta.env.VITE_API_URL}/servicos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setServicos(data))
  }, [])

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/servicos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.ok) {
      setServicos(servicos.filter(s => s.id !== id))
      toast.success('Serviço deletado!')
    } else {
      const erro = await response.json()
      toast.error(erro.mensagem)
    }
  }

  const abrirEdicao = (servico) => {
    setEditandoId(servico.id)
    setEditDuracao(servico.duracao.toString())
    setEditPreco(servico.preco.toFixed(2))
  }

  const salvarEdicao = async (id) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/servicos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        duracao: parseInt(editDuracao),
        preco: parseFloat(editPreco)
      })
    })
    if (response.ok) {
      const atualizado = await response.json()
      setServicos(servicos.map(s => s.id === id ? atualizado : s))
      setEditandoId(null)
      toast.success('Serviço atualizado!')
    } else {
      const erro = await response.json()
      toast.error(erro.mensagem)
    }
  }

  const EdicaoForm = ({ servico }) => (
    <div className="mt-3 p-3 bg-gray-700 rounded-lg flex flex-col gap-3">
      <div>
        <p className="text-gray-400 text-sm mb-1">Duração (min)</p>
        <input
          type="number"
          value={editDuracao}
          onChange={(e) => setEditDuracao(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-600 text-white outline-none text-sm"
        />
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">Preço (R$)</p>
        <input
          type="number"
          step="0.01"
          value={editPreco}
          onChange={(e) => setEditPreco(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-600 text-white outline-none text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => salvarEdicao(servico.id)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer"
        >
          Salvar
        </button>
        <button
          onClick={() => setEditandoId(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  )

  const totalPaginas = Math.ceil(servicos.length / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const itensPagina = servicos.slice(inicio, inicio + itensPorPagina)

  const Paginacao = () => (
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
  )

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Serviços</h3>

      {isMobile ? (
        <div className="flex flex-col gap-3">
          {itensPagina.map(s => (
            <div key={s.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{s.nome}</p>
                  <p className="text-gray-400 text-sm mt-1">{s.duracao} min</p>
                  <p className="text-gray-400 text-sm">R$ {s.preco.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirEdicao(s)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
                  >
                    Deletar
                  </button>
                </div>
              </div>
              {editandoId === s.id && <EdicaoForm servico={s} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="pb-3">ID</th>
                <th className="pb-3">Nome</th>
                <th className="pb-3">Duração (min)</th>
                <th className="pb-3">Preço</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map(s => (
                <>
                  <tr key={s.id} className="border-b border-gray-800">
                    <td className="py-3">{s.id}</td>
                    <td className="py-3">{s.nome}</td>
                    <td className="py-3">{s.duracao}</td>
                    <td className="py-3">R$ {s.preco.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => abrirEdicao(s)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editandoId === s.id && (
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <td colSpan={5} className="py-4 px-2">
                        <EdicaoForm servico={s} />
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
    </div>
  )
}

export default ListarServicos