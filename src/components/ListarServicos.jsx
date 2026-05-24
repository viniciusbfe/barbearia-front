import { useState, useEffect } from 'react'
import { toast } from 'sonner'

function ListarServicos() {

  const [servicos, setServicos] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)

  const [editandoId, setEditandoId] = useState(null)

  const [editDuracao, setEditDuracao] = useState('')
  const [editPreco, setEditPreco] = useState('')

  const [confirmarDelete, setConfirmarDelete] = useState(false)
  const [servicoParaExcluir, setServicoParaExcluir] = useState(null)

  const itensPorPagina = 4

  useEffect(() => {

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
      `${import.meta.env.VITE_API_URL}/servicos/${servicoParaExcluir}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.ok) {

      setServicos(
        servicos.filter(
          s => s.id !== servicoParaExcluir
        )
      )

      toast.success(
        'Serviço deletado!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem
      )

    }

    setConfirmarDelete(false)

    setServicoParaExcluir(null)

  }

  const abrirEdicao = (servico) => {

    setEditandoId(servico.id)

    setEditDuracao(
      servico.duracao.toString()
    )

    setEditPreco(
      servico.preco.toFixed(2)
    )

  }

  const salvarEdicao = async (id) => {

    const token =
      localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/servicos/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json',
          Authorization:
            `Bearer ${token}`
        },
        body: JSON.stringify({
          duracao:
            parseInt(editDuracao),
          preco:
            parseFloat(editPreco)
        })
      }
    )

    if (response.ok) {

      const atualizado =
        await response.json()

      setServicos(
        servicos.map(s =>
          s.id === id
            ? atualizado
            : s
        )
      )

      setEditandoId(null)

      toast.success(
        'Serviço atualizado!'
      )

    } else {

      const erro =
        await response.json()

      toast.error(
        erro.mensagem
      )

    }

  }

  const EdicaoForm = ({ servico }) => (

    <div className="mt-5 p-5 bg-gray-800 border border-gray-700 rounded-3xl flex flex-col gap-4">

      <div>

        <p className="text-gray-400 text-sm mb-2">
          Duração (min)
        </p>

        <input
          type="number"
          value={editDuracao}
          onChange={(e) =>
            setEditDuracao(
              e.target.value
            )
          }
          className="w-full p-4 rounded-2xl bg-gray-900 border border-gray-700 text-white outline-none focus:border-purple-500 transition"
        />

      </div>

      <div>

        <p className="text-gray-400 text-sm mb-2">
          Preço (R$)
        </p>

        <input
          type="number"
          step="0.01"
          value={editPreco}
          onChange={(e) =>
            setEditPreco(
              e.target.value
            )
          }
          className="w-full p-4 rounded-2xl bg-gray-900 border border-gray-700 text-white outline-none focus:border-purple-500 transition"
        />

      </div>

      <div className="flex gap-3">

        <button
          onClick={() =>
            salvarEdicao(servico.id)
          }
          className="flex-1 p-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold transition cursor-pointer"
        >
          Salvar
        </button>

        <button
          onClick={() =>
            setEditandoId(null)
          }
          className="flex-1 p-3 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition cursor-pointer"
        >
          Cancelar
        </button>

      </div>

    </div>

  )

  const totalPaginas = Math.ceil(
    servicos.length /
    itensPorPagina
  )

  const inicio =
    (paginaAtual - 1) *
    itensPorPagina

  const itensPagina =
    servicos.slice(
      inicio,
      inicio + itensPorPagina
    )

  const Paginacao = () => (

    <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">

      <button
        onClick={() =>
          setPaginaAtual(p =>
            Math.max(p - 1, 1)
          )
        }
        disabled={paginaAtual === 1}
        className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-40 transition cursor-pointer"
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
        className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-40 transition cursor-pointer"
      >
        Próxima
      </button>

    </div>

  )

  return (

    <div>

      <div className="mb-8">

        <h3 className="text-2xl font-bold text-white">
          Serviços
        </h3>

        <p className="text-gray-400 text-sm mt-1">
          Gerencie os serviços da barbearia
        </p>

      </div>

      <div className="space-y-4">

        {itensPagina.map(s => (

          <div
            key={s.id}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-xl"
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div className="space-y-2">

                <h4 className="text-lg font-semibold text-white">
                  {s.nome}
                </h4>

                <div className="flex flex-wrap items-center gap-3">

                  <span className="px-3 py-1 rounded-xl bg-gray-800 text-gray-300 text-sm">
                    {s.duracao} min
                  </span>

                  <span className="text-purple-400 font-semibold">
                    R$ {s.preco.toFixed(2)}
                  </span>

                </div>

              </div>

              <div className="flex gap-3 flex-wrap">

                <button
                  onClick={() =>
                    abrirEdicao(s)
                  }
                  className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  Editar
                </button>

                <button
                  onClick={() => {

                    setServicoParaExcluir(s.id)

                    setConfirmarDelete(true)

                  }}
                  className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                >
                  Excluir
                </button>

              </div>

            </div>

            {editandoId === s.id && (
              <EdicaoForm servico={s} />
            )}

          </div>

        ))}

      </div>

      <Paginacao />

      {confirmarDelete && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-6">

            <h3 className="text-xl font-bold text-white mb-2">
              Excluir serviço
            </h3>

            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir este serviço?
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => {

                  setConfirmarDelete(false)

                  setServicoParaExcluir(null)

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

export default ListarServicos