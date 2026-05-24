import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ListarEspecialidades() {

  const [especialidades, setEspecialidades] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)

  const [confirmarDelete, setConfirmarDelete] = useState(false)
  const [especialidadeParaExcluir, setEspecialidadeParaExcluir] = useState(null)

  const itensPorPagina = 14

  useEffect(() => {

    const token =
      localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/especialidades`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => setEspecialidades(data))

  }, [])

  const handleDelete = async () => {

    const token =
      localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/especialidades/${especialidadeParaExcluir}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {

      setEspecialidades(
        especialidades.filter(
          esp => esp.id !== especialidadeParaExcluir
        )
      )

      toast.success(
        'Especialidade deletada!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem
      )

    }

    setConfirmarDelete(false)

    setEspecialidadeParaExcluir(null)

  }

  const totalPaginas = Math.ceil(
    especialidades.length /
    itensPorPagina
  )

  const inicio =
    (paginaAtual - 1) *
    itensPorPagina

  const itensPagina =
    especialidades.slice(
      inicio,
      inicio + itensPorPagina
    )

  return (

    <div>

      {/* Header */}

      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">

        <div>

          <h3 className="text-2xl font-bold text-white">
            Especialidades
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            Gerencie as especialidades da barbearia
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="space-y-4">

        {itensPagina.map(esp => (

          <div
            key={esp.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl"
          >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <p className="text-xs text-gray-500 mb-1">
                  ID #{esp.id}
                </p>

                <h4 className="text-lg font-semibold text-white">
                  {esp.nome}
                </h4>

              </div>

              <button
                onClick={() => {

                  setEspecialidadeParaExcluir(
                    esp.id
                  )

                  setConfirmarDelete(true)

                }}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
              >
                Deletar
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* Paginação */}

      <div className="flex flex-wrap gap-3 mt-8 items-center">

        <button
          onClick={() =>
            setPaginaAtual(p =>
              Math.max(p - 1, 1)
            )
          }
          disabled={paginaAtual === 1}
          className="px-4 py-2 rounded-2xl bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 transition cursor-pointer"
        >
          Anterior
        </button>

        <span className="text-gray-400 text-sm">
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          onClick={() =>
            setPaginaAtual(p =>
              Math.min(
                p + 1,
                totalPaginas
              )
            )
          }
          disabled={
            paginaAtual === totalPaginas
          }
          className="px-4 py-2 rounded-2xl bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 transition cursor-pointer"
        >
          Próxima
        </button>

      </div>

      {/* Modal excluir */}

      {confirmarDelete && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6">

            <h3 className="text-xl font-bold text-white mb-2">
              Excluir especialidade
            </h3>

            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir esta especialidade?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => {

                  setConfirmarDelete(false)

                  setEspecialidadeParaExcluir(null)

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

export default ListarEspecialidades