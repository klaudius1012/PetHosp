import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/cadastro-tutor.css';

export default function CadastroTutor() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. ESTADO PARA O FORMULÁRIO
  const [tutor, setTutor] = useState({
    id: Date.now().toString(),
    nome: '',
    cpf: '',
    nascimento: '',
    telefone: '',
    telefone2: '',
    endereco: '',
    complemento: '',
    bairro: '',
    cidade: ''
  });

  // 1.1 CARREGAR DADOS SE FOR EDIÇÃO
  useEffect(() => {
    if (location.state?.id) {
      const tutores = JSON.parse(localStorage.getItem('tutores')) || [];
      const tutorEncontrado = tutores.find(t => t.id === location.state.id);
      if (tutorEncontrado) {
        setTutor(tutorEncontrado);
      }
    }
  }, [location.state]);

  // 2. MUDANÇA NOS INPUTS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTutor(prev => ({ ...prev, [name]: value }));
  };

  // 3. SALVAR NO LOCALSTORAGE
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (tutor.nome.length < 3) {
      alert("Por favor, insira o nome completo.");
      return;
    }

    const tutoresExistentes = JSON.parse(localStorage.getItem('tutores')) || [];
    
    // Verifica se o CPF já existe
    const cpfExiste = tutoresExistentes.some(t => t.cpf === tutor.cpf && t.id !== tutor.id);
    if (cpfExiste) {
      alert("Este CPF já está cadastrado para outro tutor!");
      return;
    }

    const index = tutoresExistentes.findIndex(t => t.id === tutor.id);
    if (index !== -1) {
      // Edição: Atualiza o registro existente
      tutoresExistentes[index] = tutor;
    } else {
      // Novo: Adiciona ao final
      tutoresExistentes.push(tutor);
    }
    
    localStorage.setItem('tutores', JSON.stringify(tutoresExistentes));

    alert("Tutor salvo com sucesso!");
    navigate('/tutores'); // Volta para a listagem
  };

  return (
    <div className="container">
      <main className="card_tutor">
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="header-actions">
            <h2>{location.state?.id ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}</h2>
            <button type="button" className="btn-back" onClick={() => navigate('/tutores')}>
              Voltar
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="nome">Nome Completo</label>
              <input 
                type="text" 
                id="nome"
                name="nome" 
                value={tutor.nome} 
                onChange={handleChange} 
                required 
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input 
                type="text" 
                id="cpf"
                name="cpf" 
                placeholder="000.000.000-00"
                value={tutor.cpf} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="nascimento">Data de Nascimento</label>
              <input 
                type="date" 
                id="nascimento"
                name="nascimento" 
                value={tutor.nascimento} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input 
                type="tel" 
                id="telefone"
                name="telefone" 
                placeholder="(00) 00000-0000"
                value={tutor.telefone} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone2">Telefone 2</label>
              <input 
                type="tel" 
                id="telefone2"
                name="telefone2" 
                placeholder="(00) 00000-0000"
                value={tutor.telefone2} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="endereco">Endereço</label>
              <input 
                type="text" 
                id="endereco"
                name="endereco" 
                value={tutor.endereco} 
                onChange={handleChange} 
                required 
                placeholder="Rua, número"
              />
            </div>

            <div className="form-group">
              <label htmlFor="complemento">Complemento</label>
              <input 
                type="text" 
                id="complemento"
                name="complemento" 
                value={tutor.complemento} 
                onChange={handleChange} 
                placeholder="Apto, Bloco, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="bairro">Bairro</label>
              <input 
                type="text" 
                id="bairro"
                name="bairro" 
                value={tutor.bairro} 
                onChange={handleChange} 
                required
                placeholder="Bairro"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cidade">Cidade</label>
              <input 
                type="text" 
                id="cidade"
                name="cidade" 
                value={tutor.cidade} 
                onChange={handleChange} 
                required
                placeholder="Cidade"
              />
            </div>
          </div>

          <div className="btn-toolbar">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate('/tutores')}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save">Salvar Dados</button>
          </div>
        </form>
      </main>
    </div>
  );
}