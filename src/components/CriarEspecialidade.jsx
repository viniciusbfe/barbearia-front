import { useState } from 'react'
import { toast } from 'sonner'

function CriarEspecialidade() {
    const [nome, setNome] = useState('')

    const handleSubmit = async () => {
        const token = localStorage.getItem('token')

        const response = await fetch(`${import.meta.env.VITE_API_URL}/especialidades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome })
        })

        if (response.ok) {
            toast.success('Especialidade criada com sucesso!')
            setNome('')
        } else {
            const erro = await response.json()
            toast.error(erro.mensagem)
        }
    }

    return (
        <div className="max-w-md">
            <h3 className="text-xl font-bold mb-6">Criar Especialidade</h3>

            <input
                type="text"
                placeholder="Nome da especialidade"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
            />

            <button
                onClick={handleSubmit}
                className="w-full p-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 cursor-pointer"
            >
                Criar
            </button>
        </div>
    )
}

export default CriarEspecialidade