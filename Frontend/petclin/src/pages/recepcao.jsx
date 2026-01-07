// 1. Ferramentas (Imports)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Recepcao() {
  const navigate = useNavigate();

  // 2. Estados (Dados)
  const [atendimentos, setAtendimentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);

  // 3. Carregar dados (Simulando o recepcao.js)
  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem('atendimentos')) || [];
    setAtendimentos(dados);
  }, []);

  // 4. Lógica de Filtro
  const atendimentosFiltrados = atendimentos.filter(item => {
    const matchBusca = item.tutor.toLowerCase().includes(busca.toLowerCase()) || 
                       item.animal.toLowerCase().includes(busca.toLowerCase());
    const matchData = item.data === dataFiltro;
    return matchBusca && matchData;
  });

  return (
    <article id="view-recepcao">
      <h2>Recepção - Atendimentos Abertos</h2>
      
      <div className="actions-container">
        {/* No React, usamos navigate em vez de window.location */}
        <button
          className="btn btn-primary"
          onClick={() => navigate('/novo-atendimento')}
        >
          Novo Atendimento
        </button>
      </div>

      <div className="form-group search-container">
        <input
          type="date"
          className="form-control"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          title="Filtrar por data"
        />
        <input
          type="search"
          placeholder="Buscar por tutor ou animal..."
          className="form-control"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Tutor</th>
            <th>Animal</th>
            <th>Veterinário</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="tbody-recepcao">
          {atendimentosFiltrados.length > 0 ? (
            atendimentosFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{item.hora}</td>
                <td>{item.tutor}</td>
                <td>{item.animal}</td>
                <td>{item.veterinario}</td>
                <td>
                  <span className={`badge priority-${item.prioridade?.toLowerCase()}`}>
                    {item.prioridade}
                  </span>
                </td>
                <td>{item.status || 'Aguardando'}</td>
                <td>
                  <button className="btn-icon" title="Editar">✏️</button>
                  <button className="btn-icon" title="Finalizar">✅</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                Nenhum atendimento aberto para esta data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div id="pagination" className="pagination"></div>
    </article>
  );
}