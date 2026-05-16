import { useState, useEffect } from 'react'

function CriarBarbeiro() {
  const [nome, setNome] = useState('')
  const [especialidades, setEspecialidades] = useState([])
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')

    fetch(`${import.meta.env.VITE_API_URL}/especialidades`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEspecialidades(data))
  }, [])

  const toggleEspecialidade = (id) => {
    if (especialidadesSelecionadas.includes(id)) {
      setEspecialidadesSelecionadas(
        especialidadesSelecionadas.filter(e => e !== id)
      )
    } else {
      setEspecialidadesSelecionadas([...especialidadesSelecionadas, id])
    }
  }

  const handleSubmit = async () => {
    if (!nome.trim()) {
      alert('Nome é obrigatório!')
      return
    }

    const token = localStorage.getItem('token')

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/barbeiros`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome,
          especialidades: especialidadesSelecionadas
        })
      }
    )

    if (response.ok) {
      alert('Barbeiro criado com sucesso!')
      setNome('')
      setEspecialidadesSelecionadas([])
    } else {
      const erro = await response.json()
      alert(erro.mensagem || 'Erro ao criar barbeiro')
    }
  }

  return (
    <div className="max-w-md">
      <h3 className="text-xl font-bold mb-6">Criar Barbeiro</h3>

      <input
        type="text"
        placeholder="Nome do barbeiro"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none"
      />

      <p className="text-gray-400 text-sm mb-2">Especialidades</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {especialidades.map(esp => (
          <button
            key={esp.id}
            onClick={() => toggleEspecialidade(esp.id)}
            className={`px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
              especialidadesSelecionadas.includes(esp.id)
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {esp.nome}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full p-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 cursor-pointer"
      >
        Criar
      </button>
    </div>
  )
}

export default CriarBarbeiro