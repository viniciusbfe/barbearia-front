import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ListarClientes() {

  const [clientes, setClientes] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)

  const [confirmarDelete, setConfirmarDelete] = useState(false)
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null)

  const itensPorPagina = 14

  useEffect(() => {

    const token =
      localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/clientes`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => setClientes(data))

  }, [])

  const handleDelete = async () => {

    const token =
      localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/clientes/${clienteParaExcluir}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {

      setClientes(
        clientes.filter(
          c => c.id !== clienteParaExcluir
        )
      )

      toast.success(
        'Cliente deletado!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem
      )

    }

    setConfirmarDelete(false)

    setClienteParaExcluir(null)

  }

  const totalPaginas = Math.ceil(
    clientes.length /
    itensPorPagina
  )

  const inicio =
    (paginaAtual - 1) *
    itensPorPagina

  const itensPagina =
    clientes.slice(
      inicio,
      inicio + itensPorPagina
    )

  return (

    <div>

      {/* Header */}

      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">

        <div>

          <h3 className="text-2xl font-bold text-white">
            Clientes
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            Gerencie os clientes cadastrados
          </p>

        </div>

      </div>

      {/* Cards */}

      <div className="space-y-4">

        {itensPagina.map(c => (

          <div
            key={c.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl"
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div className="space-y-1">

                <p className="text-xs text-gray-500">
                  ID #{c.id}
                </p>

                <h4 className="text-lg font-semibold text-white">
                  {c.nome}
                </h4>

                <p className="text-gray-400 text-sm">
                  {c.telefone}
                </p>

                <p className="text-gray-400 text-sm break-all">
                  {c.email}
                </p>

              </div>

              <button
                onClick={() => {

                  setClienteParaExcluir(c.id)

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
              Excluir cliente
            </h3>

            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir este cliente?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => {

                  setConfirmarDelete(false)

                  setClienteParaExcluir(null)

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

export default ListarClientes