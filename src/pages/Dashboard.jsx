import { useState, useEffect } from 'react'
import ListarEspecialidades from '../components/ListarEspecialidades'
import ListarBarbeiros from '../components/ListarBarbeiros'
import ListarClientes from '../components/ListarClientes'
import ListarServicos from '../components/ListarServicos'
import ListarAgendamentos from '../components/ListarAgendamentos'
import CriarEspecialidade from '../components/CriarEspecialidade'
import CriarServico from '../components/CriarServico'
import CriarCliente from '../components/CriarCliente'
import CriarBarbeiro from '../components/CriarBarbeiro'

function Dashboard() {
  const [paginaAtiva, setPaginaAtiva] = useState('agendamentos')
  const [gerenciarAberto, setGerenciarAberto] = useState(false)
  const [subMenuAberto, setSubMenuAberto] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [menuAberto, setMenuAberto] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsuario(data))
  }, [])

  const subMenuGerenciar = [
    { id: 'barbeiros', label: 'Barbeiros' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'especialidades', label: 'Especialidades' },
  ]

  const toggleSubMenu = (id) => {
    setSubMenuAberto(subMenuAberto === id ? null : id)
  }

  const navegarPara = (pagina) => {
    setPaginaAtiva(pagina)
    setMenuAberto(false)
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-xl font-bold text-purple-400 mb-2">Barbearia</h1>
      {usuario && <p className="text-gray-400 text-sm mb-6">Olá, {usuario.nome}!</p>}

      <nav className="flex flex-col gap-2 flex-1">
        <button
          onClick={() => navegarPara('agendamentos')}
          className={`text-left p-3 rounded-lg font-medium transition-colors ${
            paginaAtiva === 'agendamentos' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          Agendamentos
        </button>

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
                      onClick={() => navegarPara(`listar-${item.id}`)}
                      className={`w-full text-left p-2 rounded-lg text-sm font-medium transition-colors ${
                        paginaAtiva === `listar-${item.id}` ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Listar {item.label}
                    </button>
                    <button
                      onClick={() => navegarPara(`criar-${item.id}`)}
                      className={`w-full text-left p-2 rounded-lg text-sm font-medium transition-colors ${
                        paginaAtiva === `criar-${item.id}` ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
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

      <button
        onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }}
        className="mt-4 p-3 rounded-lg text-red-400 hover:bg-gray-700 text-left font-medium cursor-pointer transition-colors"
      >
        Sair
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">

      {/* Menu lateral desktop */}
      {!isMobile && (
        <div className="w-64 bg-gray-800 flex flex-col">
          <Sidebar />
        </div>
      )}

      {/* Overlay mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Menu lateral mobile */}
      {isMobile && (
        <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 z-50 transform transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </div>
      )}

      {/* Área de conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header mobile */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 z-30">
            <button
              onClick={() => setMenuAberto(true)}
              className="text-gray-400 hover:text-white cursor-pointer text-2xl"
            >
              ☰
            </button>
            <h1 className="text-purple-400 font-bold">Barbearia</h1>
            <div className="w-8" />
          </div>
        )}

        <div className={`flex-1 overflow-auto p-4 ${isMobile ? 'mt-16' : 'p-8'}`}>
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

    </div>
  )
}

export default Dashboard