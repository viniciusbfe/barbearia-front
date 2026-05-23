import { useState, useEffect } from 'react'

function ListarServicos() {
  const [servicos, setServicos] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const itensPorPagina = 14

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${import.meta.env.VITE_API_URL}/servicos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setServicos(data))
  }, [])

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/servicos/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {
      setServicos(servicos.filter(s => s.id !== id))
    } else {
      const erro = await response.json()
      alert(erro.mensagem)
    }
  }

  const totalPaginas = Math.ceil(servicos.length / itensPorPagina)

  const inicio = (paginaAtual - 1) * itensPorPagina

  const itensPagina = servicos.slice(
    inicio,
    inicio + itensPorPagina
  )

  const Paginacao = () => (
    <div className="flex gap-2 mt-6 items-center">
      <button
        onClick={() =>
          setPaginaAtual(p => Math.max(p - 1, 1))
        }
        disabled={paginaAtual === 1}
        className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 cursor-pointer"
      >
        Anterior
      </button>

      <span className="text-gray-400 text-sm">
        Página {paginaAtual} de {totalPaginas}
      </span>

      <button
        onClick={() =>
          setPaginaAtual(p =>
            Math.min(p + 1, totalPaginas)
          )
        }
        disabled={paginaAtual === totalPaginas}
        className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 cursor-pointer"
      >
        Próxima
      </button>
    </div>
  )

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">
        Serviços
      </h3>

      {isMobile ? (
        <div className="flex flex-col gap-3">
          {itensPagina.map(s => (
            <div
              key={s.id}
              className="bg-gray-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {s.nome}
                  </p>

                  <p className="text-gray-400 text-sm mt-1">
                    {s.duracao} min
                  </p>

                  <p className="text-gray-400 text-sm">
                    R$ {s.preco.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
                >
                  Deletar
                </button>
              </div>
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
                <th className="pb-3">
                  Duração (min)
                </th>
                <th className="pb-3">Preço</th>
                <th className="pb-3"></th>
              </tr>
            </thead>

            <tbody>
              {itensPagina.map(s => (
                <tr
                  key={s.id}
                  className="border-b border-gray-800"
                >
                  <td className="py-3">
                    {s.id}
                  </td>

                  <td className="py-3">
                    {s.nome}
                  </td>

                  <td className="py-3">
                    {s.duracao}
                  </td>

                  <td className="py-3">
                    R$ {s.preco.toFixed(2)}
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 cursor-pointer"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
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