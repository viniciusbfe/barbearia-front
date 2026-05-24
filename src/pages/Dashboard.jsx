import { useState, useEffect } from 'react'

import ListarEspecialidades from '../components/ListarEspecialidades'
import ListarBarbeiros from '../components/ListarBarbeiros'
import ListarClientes from '../components/ListarClientes'
import ListarServicos from '../components/ListarServicos'
import ListarAgendamentos from '../components/ListarAgendamentos'

import CriarEspecialidade from '../components/CriarEspecialidade'
import CriarServico from '../components/CriarServico'
import CriarCliente from '../components/CriarCliente'
import CriarBarbeiro from '../components/CriarBarbeiros'

function Dashboard() {

  const [paginaAtiva, setPaginaAtiva] = useState('agendamentos')

  const [gerenciarAberto, setGerenciarAberto] = useState(false)

  const [subMenuAberto, setSubMenuAberto] = useState(null)

  const [usuario, setUsuario] = useState(null)

  const [menuAberto, setMenuAberto] = useState(false)

  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  )

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      )
    }

  }, [])

  useEffect(() => {

    const token = localStorage.getItem('token')

    fetch(
      `${import.meta.env.VITE_API_URL}/usuarios/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
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
    setSubMenuAberto(
      subMenuAberto === id ? null : id
    )
  }

  const navegarPara = (pagina) => {
    setPaginaAtiva(pagina)
    setMenuAberto(false)
  }
  const Sidebar = () => (

    <div className="
    flex flex-col h-full p-5
    bg-black/40 backdrop-blur-xl
    border-r border-white/10
  ">

      {/* Logo */}

      <div className="mb-8">

        <div className="flex items-center gap-3 mb-3">

          <div className="
          w-12 h-12 rounded-2xl
          bg-gradient-to-br from-purple-600 to-fuchsia-600
          flex items-center justify-center
          shadow-lg shadow-purple-500/20
        ">
            <span className="text-white font-bold text-xl">
              B
            </span>
          </div>

          <div>

            <h1 className="text-2xl font-bold text-white">
              Barbearia
            </h1>

            <p className="text-xs text-gray-500">
              Painel administrativo
            </p>

          </div>

        </div>

        {usuario && (

          <div className="
          mt-4 p-3 rounded-2xl
          bg-white/5 border border-white/5
        ">

            <p className="text-xs text-gray-500 mb-1">
              Conectado como
            </p>

            <p className="text-sm text-white font-medium">
              {usuario.nome}
            </p>

          </div>

        )}

      </div>

      {/* Navegação */}

      <nav className="flex flex-col gap-2 flex-1">

        <button
          onClick={() => navegarPara('agendamentos')}
          className={`
          text-left p-4 rounded-2xl
          font-medium transition-all duration-300
          cursor-pointer border
          ${paginaAtiva === 'agendamentos'
              ? `
                bg-gradient-to-r
                from-purple-600/30
                to-fuchsia-600/20
                border-purple-500/30
                text-white
                shadow-lg shadow-purple-500/10
              `
              : `
                border-transparent
                text-gray-400
                hover:bg-white/5
                hover:text-white
              `
            }
        `}
        >
          Agendamentos
        </button>

        <button
          onClick={() =>
            setGerenciarAberto(!gerenciarAberto)
          }
          className="
          text-left p-4 rounded-2xl
          font-medium text-gray-400
          hover:bg-white/5
          hover:text-white
          transition-all duration-300
          flex justify-between items-center
          border border-transparent
          hover:border-white/5
          cursor-pointer
        "
        >

          <span>
            Gerenciar
          </span>

          <span className={`
          text-xs transition-transform duration-300
          ${gerenciarAberto ? 'rotate-180' : ''}
        `}>
            ▼
          </span>

        </button>

        {gerenciarAberto && (

          <div className="
          flex flex-col gap-2
          ml-2 mt-1 pl-3
          border-l border-white/10
        ">

            {subMenuGerenciar.map(item => (

              <div key={item.id}>

                <button
                  onClick={() =>
                    toggleSubMenu(item.id)
                  }
                  className="
                  w-full text-left p-3 rounded-xl
                  text-sm font-medium
                  text-gray-400
                  hover:bg-white/5
                  hover:text-white
                  transition-all duration-300
                  flex justify-between items-center
                  cursor-pointer
                "
                >

                  <span>
                    {item.label}
                  </span>

                  <span className={`
                  text-[10px]
                  transition-transform duration-300
                  ${subMenuAberto === item.id
                      ? 'rotate-180'
                      : ''
                    }
                `}>
                    ▼
                  </span>

                </button>

                {subMenuAberto === item.id && (

                  <div className="
                  flex flex-col gap-1
                  ml-2 mt-2
                ">

                    <button
                      onClick={() =>
                        navegarPara(
                          `listar-${item.id}`
                        )
                      }
                      className={`
                      w-full text-left p-3 rounded-xl
                      text-sm transition-all duration-300
                      cursor-pointer
                      ${paginaAtiva ===
                          `listar-${item.id}`
                          ? `
                            bg-purple-600/20
                            border border-purple-500/20
                            text-white
                          `
                          : `
                            text-gray-500
                            hover:bg-white/5
                            hover:text-white
                          `
                        }
                    `}
                    >
                      Listar {item.label}
                    </button>

                    <button
                      onClick={() =>
                        navegarPara(
                          `criar-${item.id}`
                        )
                      }
                      className={`
                      w-full text-left p-3 rounded-xl
                      text-sm transition-all duration-300
                      cursor-pointer
                      ${paginaAtiva ===
                          `criar-${item.id}`
                          ? `
                            bg-purple-600/20
                            border border-purple-500/20
                            text-white
                          `
                          : `
                            text-gray-500
                            hover:bg-white/5
                            hover:text-white
                          `
                        }
                    `}
                    >
                       Criar {item.label}
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </nav>

      {/* Botão sair */}

      <button
        onClick={() => {
          localStorage.removeItem('token')
          window.location.href = '/'
        }}
        className="
        mt-6 p-4 rounded-2xl
        bg-red-500/10
        border border-red-500/10
        text-red-400 font-semibold
        hover:bg-red-500
        hover:text-white
        hover:shadow-lg hover:shadow-red-500/20
        transition-all duration-300
        cursor-pointer
      "
      >
        Sair
      </button>

    </div>

  )

  return (

    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex">

      {/* Desktop */}

      {!isMobile && (

        <div className="w-72 min-h-screen">
          <Sidebar />
        </div>

      )}

      {/* Overlay */}

      {menuAberto && (

        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMenuAberto(false)}
        />

      )}

      {/* Mobile Sidebar */}

      {isMobile && (

        <div
          className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ${menuAberto
            ? 'translate-x-0'
            : '-translate-x-full'
            }`}
        >
          <Sidebar />
        </div>

      )}

      {/* Conteúdo */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* Header Mobile */}

        {isMobile && (

          <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 bg-gray-950/95 backdrop-blur border-b border-gray-800">

            <button
              onClick={() => setMenuAberto(true)}
              className="text-2xl text-gray-300 hover:text-white cursor-pointer"
            >
              ☰
            </button>

            <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
              Barbearia
            </h1>

            <div className="w-6" />

          </div>

        )}

        <div
          className={`flex-1 overflow-auto ${isMobile
            ? 'mt-20 p-4'
            : 'p-8'
            }`}
        >

          <div className="w-full p-1">

            {paginaAtiva === 'agendamentos' &&
              <ListarAgendamentos />}

            {paginaAtiva ===
              'listar-especialidades' &&
              <ListarEspecialidades />}

            {paginaAtiva ===
              'listar-barbeiros' &&
              <ListarBarbeiros />}

            {paginaAtiva ===
              'listar-clientes' &&
              <ListarClientes />}

            {paginaAtiva ===
              'listar-servicos' &&
              <ListarServicos />}

            {paginaAtiva ===
              'criar-especialidades' &&
              <CriarEspecialidade />}

            {paginaAtiva ===
              'criar-servicos' &&
              <CriarServico />}

            {paginaAtiva ===
              'criar-clientes' &&
              <CriarCliente />}

            {paginaAtiva ===
              'criar-barbeiros' &&
              <CriarBarbeiro />}

          </div>

        </div>

      </div>

    </div>

  )
}

export default Dashboard