import { useState, useEffect } from 'react';

export default function Agenda() {
  // Função auxiliar para obter a data de hoje (YYYY-MM-DD)
  const obterHoje = () => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  };

  // --- ESTADOS ---
  const [agendamentos, setAgendamentos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroData, setFiltroData] = useState(obterHoje());
  const [modalAberto, setModalAberto] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [idExclusao, setIdExclusao] = useState(null);

  // Estado do formulário agora com 'data'
  const [form, setForm] = useState({
    data: '', // Novo campo
    hora: '', 
    animal: '', 
    especie: '', 
    tutor: '', 
    telefone: '', 
    veterinario: '', 
    tipo: 'Consulta'
  });

  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("agenda")) || [];
    setAgendamentos(dadosSalvos);
  }, []);

  const atualizarLocalStorage = (novaLista) => {
    setAgendamentos(novaLista);
    localStorage.setItem("agenda", JSON.stringify(novaLista));
  };

  const abrirNovoAgendamento = () => {
    setForm({
      data: obterHoje(),
      hora: '',
      animal: '',
      especie: '',
      tutor: '',
      telefone: '',
      veterinario: '',
      tipo: 'Consulta'
    });
    setIdEdicao(null);
    setModalAberto(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    let novaLista;

    if (idEdicao) {
      novaLista = agendamentos.map(item => 
        item.id === idEdicao ? { ...form, id: idEdicao } : item
      );
    } else {
      const novoItem = { ...form, id: Date.now().toString() };
      novaLista = [...agendamentos, novoItem];
    }

    // Ordenação automática por data e depois por hora
    novaLista.sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));

    atualizarLocalStorage(novaLista);
    fecharModal();
  };

  const handleExcluir = (id) => {
    setIdExclusao(id);
    setModalExclusaoAberto(true);
  };

  const confirmarExclusao = () => {
    const novaLista = agendamentos.filter(item => item.id !== idExclusao);
    atualizarLocalStorage(novaLista);
    setModalExclusaoAberto(false);
    setIdExclusao(null);
  };

  const prepararEdicao = (item) => {
    setIdEdicao(item.id);
    setForm(item);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setIdEdicao(null);
    setForm({ data: '', hora: '', animal: '', especie: '', tutor: '', telefone: '', veterinario: '', tipo: 'Consulta' });
  };

  // Filtro de busca
  const agendamentosFiltrados = agendamentos.filter(item => {
    const matchTexto = item.tutor.toLowerCase().includes(termoBusca.toLowerCase()) || 
                       item.animal.toLowerCase().includes(termoBusca.toLowerCase());
    const matchData = filtroData ? item.data === filtroData : true;
    return matchTexto && matchData;
  });

  return (
    <article id="view-agenda">
      <h2>Agenda de Atendimentos</h2>
      
      <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
        <input
          type="search"
          placeholder="Buscar por animal ou tutor..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{ flex: 2 }}
        />
        <input 
          type="date" 
          value={filtroData} 
          onChange={(e) => setFiltroData(e.target.value)}
          style={{ flex: 1 }}
          title="Filtrar por data"
        />
      </div>

      <button className="btn btn-primary" onClick={abrirNovoAgendamento}>
        Novo Agendamento
      </button>

      <table>
        <thead>
          <tr>
            <th>Data</th> {/* Nova Coluna */}
            <th>Hora</th>
            <th>Tutor</th>
            <th>Animal</th>
            <th>Veterinário</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentosFiltrados.length > 0 ? (
            agendamentosFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                <td>{item.hora}</td>
                <td>{item.tutor}</td>
                <td>{item.animal}</td>
                <td>{item.veterinario}</td>
                <td>{item.tipo}</td>
                <td>
                  <button className="btn-icon" onClick={() => prepararEdicao(item)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleExcluir(item.id)}>🗑️</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" style={{textAlign:'center'}}>Nenhum agendamento encontrado.</td></tr>
          )}
        </tbody>
      </table>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{idEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
            <form onSubmit={handleSalvar}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Data</label>
                  <input type="date" required value={form.data} 
                    onChange={e => setForm({...form, data: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Hora</label>
                  <input type="time" required value={form.hora} 
                    onChange={e => setForm({...form, hora: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group">
                <label>Animal</label>
                <input type="text" required value={form.animal} 
                  onChange={e => setForm({...form, animal: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Tutor</label>
                <input type="text" required value={form.tutor} 
                  onChange={e => setForm({...form, tutor: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Veterinário</label>
                <input type="text" required value={form.veterinario} 
                  onChange={e => setForm({...form, veterinario: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                  <option value="Consulta">Consulta</option>
                  <option value="Vacina">Vacina</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Exame">Exame</option>
                  <option value="Cirurgia">Cirurgia</option>
                </select>
              </div>

              <div className="btn-toolbar">
                <button type="button" className="btn btn-secondary" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalExclusaoAberto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este agendamento?</p>
            <div className="btn-toolbar">
              <button className="btn btn-secondary" onClick={() => setModalExclusaoAberto(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmarExclusao}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}