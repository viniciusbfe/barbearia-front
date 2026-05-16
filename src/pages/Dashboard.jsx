import { useState } from 'react'
import ListarAgendamentos from '../components/ListarAgendamentos'
import ListarEspecialidades from '../components/ListarEspecialidades'
import ListarBarbeiros from '../components/ListarBarbeiros'
import ListarClientes from '../components/ListarClientes'
import ListarServicos from '../components/ListarServicos'
import CriarEspecialidade from '../components/CriarEspecialidade'
import CriarServico from '../components/CriarServico'
import CriarCliente from '../components/CriarCliente'
import CriarBarbeiro from '../components/CriarBarbeiros'


function Dashboard() {
  const [paginaAtiva, setPaginaAtiva] = useState('agendamentos')
  const [gerenciarAberto, setGerenciarAberto] = useState(false)
  const [subMenuAberto, setSubMenuAberto] = useState(null)

  const subMenuGerenciar = [
    { id: 'barbeiros', label: 'Barbeiros' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'especialidades', label: 'Especialidades' },
  ]

  const toggleSubMenu = (id) => {
    setSubMenuAberto(subMenuAberto === id ? null : id)
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">

      {/* Menu lateral */}
      <div className="w-64 bg-gray-800 p-6 flex flex-col">
        <h1 className="text-xl font-bold text-purple-400 mb-8">Barbearia</h1>
        <nav className="flex flex-col gap-2">

          {/* Agendamentos */}
          <button
            onClick={() => setPaginaAtiva('agendamentos')}
            className={`text-left p-3 rounded-lg font-medium transition-colors ${paginaAtiva === 'agendamentos'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
              }`}
          >
            Agendamentos
          </button>

          {/* Gerenciar */}
          <button
            onClick={() => setGerenciarAberto(!gerenciarAberto)}
            className="text-left p-3 rounded-lg font-medium text-gray-400 hover:bg-gray-700 transition-colors flex justify-between items-center"
          >
            Gerenciar
            <span>{gerenciarAberto ? '▲' : '▼'}</span>
          </button>

          {gerenciarAberto && (
            <div className="flex flex-col gap-1 ml-3">
              {subMenuGerenciar.map(item => (
                <div key={item.id}>
                  <button
                    onClick={() => toggleSubMenu(item.id)}
                    className="w-full text-left p-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-700 transition-colors flex justify-between items-center"
                  >
                    {item.label}
                    <span>{subMenuAberto === item.id ? '▲' : '▼'}</span>
                  </button>

                  {subMenuAberto === item.id && (
                    <div className="flex flex-col gap-1 ml-3">
                      <button
                        onClick={() => setPaginaAtiva(`listar-${item.id}`)}
                        className={`w-full text-left p-2 rounded-lg text-sm font-medium transition-colors ${paginaAtiva === `listar-${item.id}`
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                          }`}
                      >
                        Listar {item.label}
                      </button>
                      <button
                        onClick={() => setPaginaAtiva(`criar-${item.id}`)}
                        className={`w-full text-left p-2 rounded-lg text-sm font-medium transition-colors ${paginaAtiva === `criar-${item.id}`
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                          }`}
                      >
                        + Criar {item.label}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

        </nav>
      </div>

      {/* Área de conteúdo */}

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold capitalize mb-6">{paginaAtiva}</h2>
        {paginaAtiva === 'agendamentos' && <ListarAgendamentos />}
        {paginaAtiva === 'listar-especialidades' && <ListarEspecialidades />}
        {paginaAtiva === 'listar-barbeiros' && <ListarBarbeiros />}
        {paginaAtiva === 'listar-clientes' && <ListarClientes />}
        {paginaAtiva === 'listar-servicos' && <ListarServicos />}
        {paginaAtiva === 'criar-especialidades' && <CriarEspecialidade />}
        {paginaAtiva === 'criar-servicos' && <CriarServico />}
        {paginaAtiva === 'criar-clientes' && <CriarCliente />}
        {paginaAtiva === 'criar-barbeiros' && <CriarBarbeiro />}
      </div>

    </div>
  )
}

export default Dashboard