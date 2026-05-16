import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            })

            if (!response.ok) {
                alert('Email ou senha incorretos!')
                return
            }

            const token = await response.text()
            localStorage.setItem('token', token)
            navigate('/dashboard')
        } catch (error) {
            alert('Erro ao fazer login!')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-white text-2xl font-bold mb-6 text-center">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 rounded bg-gray-700 text-white placeholder-gray-400 outline-none"
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full p-3 mb-6 rounded bg-gray-700 text-white placeholder-gray-400 outline-none"
                />
                <button
                    onClick={handleLogin}
                    className="w-full p-3 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 cursor-pointer"
                >
                    Entrar
                </button>
            </div>
        </div>
    )
}

export default Login