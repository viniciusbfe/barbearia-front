import { useState } from 'react'
import { toast } from 'sonner'

function CriarCliente() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async () => {
    if (!nome.trim() || !telefone.trim() || !email.trim()) {
      toast.warning('Preencha todos os campos!')
      return
    }

    const token = localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/clientes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome, telefone, email })
      }
    )

    if (response.ok) {
      toast.success('Cliente criado com sucesso!')
      setNome('')
      setTelefone('')
      setEmail('')
    } else {
      const erro = await response.json()
      toast.error(erro.mensagem || 'Erro ao criar cliente')
    }
  }

  return (
    <div className="max-w-md">
      <h3 className="text-xl font-bold mb-6">Criar Cliente</h3>

      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
      />

      <input
        type="text"
        placeholder="Telefone"
        value={telefone || '('}
        maxLength={15}
        onChange={(e) => {
          let valor = e.target.value.replace(/\D/g, '')
          if (valor.length > 11) return
          valor = valor
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
          setTelefone(valor)
        }}
        className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

export default CriarCliente