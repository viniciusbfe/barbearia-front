import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, senha })
        }
      )

      if (!response.ok) {
        toast.error('Email ou senha incorretos!')
        return
      }

      const token = await response.text()

      localStorage.setItem('token', token)

      toast.success('Login realizado!')

      navigate('/dashboard')

    } catch (error) {
      toast.error('Erro ao fazer login!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">

      <div className="w-full max-w-sm bg-gray-900/90 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Barbearia
          </h1>

          <p className="text-gray-400 text-sm">
            Faça login para continuar
          </p>
        </div>

        {/* 🔥 AQUI ESTÁ A MUDANÇA */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-800 text-white placeholder-gray-500 outline-none border border-gray-700 focus:border-purple-500 transition"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-800 text-white placeholder-gray-500 outline-none border border-gray-700 focus:border-purple-500 transition"
          />

          <button
            type="submit"
            className="w-full mt-2 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold hover:opacity-90 transition cursor-pointer"
          >
            Entrar
          </button>

        </form>

      </div>

    </div>
  )
}

export default Login