import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/tutores.css';

export default function Tutores() {
  const navigate = useNavigate();

  // 1. ESTADOS
  const [tutores, setTutores] = useState([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // 2. CARREGAR DADOS (Simulando o seu carregarTutores do JS)
  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem('tutores')) || [];
    // Ordenar alfabeticamente igual no seu JS original
    dados.sort((a, b) => a.nome.localeCompare(b.nome));
    setTutores(dados);
  }, []);

  // 3. LÓGICA DE FILTRO (Substitui a lógica de busca do JS)
  const tutoresFiltrados = tutores.filter(t => 
    t.nome.toLowerCase().includes(busca.toLowerCase()) || 
    t.cpf.includes(busca)
  );

  // 4. PAGINAÇÃO
  const totalPaginas = Math.ceil(tutoresFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const tutoresExibidos = tutoresFiltrados.slice(inicio, inicio + itensPorPagina);

  // 5. FUNÇÕES DE AÇÃO
  const excluirTutor = (id) => {
    if (window.confirm("Deseja realmente excluir este tutor?")) {
      const novosTutores = tutores.filter(t => t.id !== id);
      setTutores(novosTutores);
      localStorage.setItem('tutores', JSON.stringify(novosTutores));
    }
  };

  return (
    <article id="view-tutores">
      <h2>Tutores Cadastrados</h2>
      
      <div className="form-group">
        <input
          type="search"
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1); // Volta para a primeira página ao buscar
          }}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={() => navigate('/cadastro-tutor')} // Ajuste a rota se necessário
      >
        Cadastrar Novo Tutor
      </button>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tutoresExibidos.length > 0 ? (
            tutoresExibidos.map((t) => (
              <tr key={t.id}>
                <td>{t.nome}</td>
                <td>{t.cpf}</td>
                <td>{t.telefone}</td>
                <td>{t.cidade}</td>
                <td>
                  <button 
                    className="btn-icon" 
                    title="Editar"
                    onClick={() => navigate('/cadastro-tutor', { state: { id: t.id } })}
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon" 
                    title="Excluir"
                    onClick={() => excluirTutor(t.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                Nenhum tutor encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINAÇÃO */}
      {totalPaginas > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              className={paginaAtual === i + 1 ? 'active' : ''}
              onClick={() => setPaginaAtual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}