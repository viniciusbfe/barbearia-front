import { useState } from 'react'
import { toast } from 'sonner'

function CriarServico() {
    const [nome, setNome] = useState('')
    const [duracao, setDuracao] = useState('')
    const [preco, setPreco] = useState('')

    const handleSubmit = async () => {
        if (!nome.trim() || !duracao || !preco) {
            toast.error('Preencha todos os campos!')
            return
        }

        const token = localStorage.getItem('token')
        const response = await fetch(`${import.meta.env.VITE_API_URL}/servicos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                nome, 
                duracao: parseInt(duracao), 
                preco: parseFloat(
                    preco.replace(/[R$\s.]/g, '').replace(',', '.')
                ) 
            })
        })

        if (response.ok) {
            toast.success('Serviço criado com sucesso!')
            setNome('')
            setDuracao('')
            setPreco('')
        } else {
            const erro = await response.json()
            toast.error(erro.mensagem)
        }
    }

    return (
        <div className="max-w-md">
            <h3 className="text-xl font-bold mb-6">Criar Serviço</h3>
            <input
                type="text"
                placeholder="Nome do serviço"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
            />
            <input
                type="number"
                placeholder="Duração (minutos)"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
            />
            <input
                type="text"
                placeholder="Preço (R$)"
                value={preco}
                onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '')
                    const formatado = (Number(valor) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    })
                    setPreco(formatado)
                }}
                className="w-full p-3 mb-6 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
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

export default CriarServico