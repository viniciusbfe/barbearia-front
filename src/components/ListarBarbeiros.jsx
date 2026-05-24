import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ListarBarbeiros() {

  const [barbeiros, setBarbeiros] = useState([])
  const [especialidades, setEspecialidades] = useState([])

  const [paginaAtual, setPaginaAtual] = useState(1)

  const [editandoId, setEditandoId] = useState(null)

  const [
    especialidadesSelecionadas,
    setEspecialidadesSelecionadas
  ] = useState([])

  const [
    confirmarDelete,
    setConfirmarDelete
  ] = useState(false)

  const [
    barbeiroParaExcluir,
    setBarbeiroParaExcluir
  ] = useState(null)

  const itensPorPagina = 4

  useEffect(() => {

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
      `${import.meta.env.VITE_API_URL}/barbeiros/${barbeiroParaExcluir}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {

      setBarbeiros(
        barbeiros.filter(
          b => b.id !== barbeiroParaExcluir
        )
      )

      toast.success(
        'Barbeiro deletado!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem
      )

    }

    setConfirmarDelete(false)

    setBarbeiroParaExcluir(null)

  }

  const abrirEdicao = (barbeiro) => {

    setEditandoId(barbeiro.id)

    setEspecialidadesSelecionadas(
      barbeiro.especialidades.map(
        e => e.id
      )
    )

  }

  const toggleEspecialidade = (id) => {

    if (
      especialidadesSelecionadas.includes(id)
    ) {

      setEspecialidadesSelecionadas(
        especialidadesSelecionadas.filter(
          e => e !== id
        )
      )

    } else {

      setEspecialidadesSelecionadas([
        ...especialidadesSelecionadas,
        id
      ])

    }

  }

  const salvarEdicao = async (
    barbeiroId
  ) => {

    const token =
      localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/barbeiros/${barbeiroId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type':
            'application/json',
          Authorization:
            `Bearer ${token}`
        },
        body: JSON.stringify({
          especialidades:
            especialidadesSelecionadas
        })
      }
    )

    if (response.ok) {

      const atualizado =
        await response.json()

      setBarbeiros(
        barbeiros.map(b =>
          b.id === barbeiroId
            ? atualizado
            : b
        )
      )

      setEditandoId(null)

      toast.success(
        'Barbeiro atualizado!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem
      )

    }

  }

  const totalPaginas = Math.ceil(
    barbeiros.length /
    itensPorPagina
  )

  const inicio =
    (paginaAtual - 1) *
    itensPorPagina

  const itensPagina =
    barbeiros.slice(
      inicio,
      inicio + itensPorPagina
    )

  return (

    <div>

      <div className="mb-6">

        <h3 className="text-2xl font-bold text-white">
          Barbeiros
        </h3>

        <p className="text-gray-400 text-sm mt-1">
          Gerencie barbeiros e especialidades
        </p>

      </div>

      <div className="space-y-4">

        {itensPagina.map(b => (

          <div
            key={b.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl"
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div className="space-y-2">

                <h4 className="text-lg font-semibold text-white">
                  {b.nome}
                </h4>

                <div className="flex flex-wrap gap-2">

                  {b.especialidades.length > 0 ? (

                    b.especialidades.map(e => (

                      <span
                        key={e.id}
                        className="px-3 py-1 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium"
                      >
                        {e.nome}
                      </span>

                    ))

                  ) : (

                    <span className="text-gray-500 text-sm">
                      Sem especialidades
                    </span>

                  )}

                </div>

              </div>

              <div className="flex gap-3 flex-wrap">

                <button
                  onClick={() =>
                    abrirEdicao(b)
                  }
                  className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {

                    setBarbeiroParaExcluir(
                      b.id
                    )

                    setConfirmarDelete(true)

                  }}
                  className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                >
                  Excluir
                </button>

              </div>

            </div>

            {editandoId === b.id && (

              <div className="mt-5 p-5 rounded-3xl bg-gray-800 border border-gray-700">

                <p className="text-sm text-gray-400 mb-4">
                  Especialidades
                </p>

                <div className="flex flex-wrap gap-3 mb-5">

                  {especialidades.map(esp => (

                    <button
                      key={esp.id}
                      onClick={() =>
                        toggleEspecialidade(
                          esp.id
                        )
                      }
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all cursor-pointer border ${
                        especialidadesSelecionadas.includes(
                          esp.id
                        )
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-purple-500 text-white shadow-lg'
                          : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {esp.nome}
                    </button>

                  ))}

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      salvarEdicao(
                        b.id
                      )
                    }
                    className="px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white transition cursor-pointer"
                  >
                    Salvar
                  </button>

                  <button
                    onClick={() =>
                      setEditandoId(null)
                    }
                    className="px-5 py-3 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                </div>

              </div>

            )}

          </div>

        ))}

      </div>

      <div className="flex gap-3 mt-8 items-center flex-wrap">

        <button
          onClick={() =>
            setPaginaAtual(p =>
              Math.max(p - 1, 1)
            )
          }
          disabled={paginaAtual === 1}
          className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white transition cursor-pointer"
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
          className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white transition cursor-pointer"
        >
          Próxima
        </button>

      </div>

      {/* Modal excluir */}

      {confirmarDelete && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6">

            <h3 className="text-xl font-bold text-white mb-2">
              Excluir barbeiro
            </h3>

            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir este barbeiro?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => {

                  setConfirmarDelete(false)

                  setBarbeiroParaExcluir(null)

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

export default ListarBarbeiros