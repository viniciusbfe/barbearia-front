import { useState, useEffect } from 'react'

function ListarBarbeiros() {
  const [barbeiros, setBarbeiros] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [editandoId, setEditandoId] = useState(null)
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const itensPorPagina = 14

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${import.meta.env.VITE_API_URL}/barbeiros`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBarbeiros(data))

    fetch(`${import.meta.env.VITE_API_URL}/especialidades`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEspecialidades(data))
  }, [])

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/barbeiros/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response.ok) {
      setBarbeiros(barbeiros.filter(b => b.id !== id))
    } else {
      const erro = await response.json()
      alert(erro.mensagem)
    }
  }

  const abrirEdicao = (barbeiro) => {
    setEditandoId(barbeiro.id)
    setEspecialidadesSelecionadas(barbeiro.especialidades.map(e => e.id))
  }

  const toggleEspecialidade = (id) => {
    if (especialidadesSelecionadas.includes(id)) {
      setEspecialidadesSelecionadas(especialidadesSelecionadas.filter(e => e !== id))
    } else {
      setEspecialidadesSelecionadas([...especialidadesSelecionadas, id])
    }
  }

  const salvarEdicao = async (barbeiroId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/barbeiros/${barbeiroId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ especialidades: especialidadesSelecionadas })
    })
    if (response.ok) {
      const atualizado = await response.json()
      setBarbeiros(barbeiros.map(b => b.id === barbeiroId ? atualizado : b))
      setEditandoId(null)
    } else {
      const erro = await response.json()
      alert(erro.mensagem)
    }
  }

  const EdicaoEspecialidades = ({ barbeiroId }) => (
    <div className="mt-3 p-3 bg-gray-700 rounded-lg">
      <p className="text-gray-400 text-sm mb-2">Especialidades</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {especialidades.map(esp => (
          <button
            key={esp.id}
            onClick={() => toggleEspecialidade(esp.id)}
            className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
              especialidadesSelecionadas.includes(esp.id)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {esp.nome}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => salvarEdicao(barbeiroId)}
          className="px-4 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer"
        >
          Salvar
        </button>
        <button
          onClick={() => setEditandoId(null)}
          className="px-4 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  )

  const totalPaginas = Math.ceil(barbeiros.length / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const itensPagina = barbeiros.slice(inicio, inicio + itensPorPagina)

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
      <h3 className="text-xl font-bold mb-4">Barbeiros</h3>

      {isMobile ? (
        // Cards mobile
        <div className="flex flex-col gap-3">
          {itensPagina.map(b => (
            <div key={b.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{b.nome}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {b.especialidades.length > 0
                      ? b.especialidades.map(e => e.nome).join(', ')
                      : 'Sem especialidades'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirEdicao(b)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
                  >
                    Deletar
                  </button>
                </div>
              </div>
              {editandoId === b.id && <EdicaoEspecialidades barbeiroId={b.id} />}
            </div>
          ))}
        </div>
      ) : (
        // Tabela desktop
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="pb-3">ID</th>
                <th className="pb-3">Nome</th>
                <th className="pb-3">Especialidades</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {itensPagina.map(b => (
                <>
                  <tr key={b.id} className="border-b border-gray-800">
                    <td className="py-3">{b.id}</td>
                    <td className="py-3">{b.nome}</td>
                    <td className="py-3">{b.especialidades.map(e => e.nome).join(', ')}</td>
                    <td className="py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => abrirEdicao(b)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editandoId === b.id && (
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <td colSpan={4} className="py-4 px-2">
                        <EdicaoEspecialidades barbeiroId={b.id} />
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

export default ListarBarbeiros