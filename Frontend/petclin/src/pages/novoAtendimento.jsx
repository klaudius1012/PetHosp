import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/novo-atendimento.css'; 

export default function NovoAtendimento() {
  const navigate = useNavigate();

  // 1. ESTADO COMPLETO DO FORMULÁRIO (Baseado no teu .js)
  const [formData, setFormData] = useState({
    tutorId: '',
    tutorNome: '',
    animalNome: '',
    veterinario: '',
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    peso: '',
    temperatura: '',
    frequenciaCardiaca: '',
    frequenciaRespiratoria: '',
    tpc: '',
    mucosas: 'Normocoradas',
    hidratacao: 'Normal',
    consciencia: 'Alerta',
    prioridade: 'Rotina',
    queixa: '',
    observacoes: '',
    ambiente: '',
    alimentacao: '',
    alergias: ''
  });

  // 2. ESTADOS PARA LISTAS E MODAL
  const [tutores, setTutores] = useState([]);
  const [animaisDoTutor, setAnimaisDoTutor] = useState([]);
  const [vacinas, setVacinas] = useState([]); // Vacinas finais
  const [showModalVacinas, setShowModalVacinas] = useState(false);
  const [vacinaTemp, setVacinaTemp] = useState({ nome: '', data: '', revacina: '' });
  const [alergiasLista, setAlergiasLista] = useState([]);
  const [showModalAlergias, setShowModalAlergias] = useState(false);
  const [alergiaTemp, setAlergiaTemp] = useState('');
  const [editingVacinaIndex, setEditingVacinaIndex] = useState(null);
  const [editingAlergiaIndex, setEditingAlergiaIndex] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    const dadosTutores = JSON.parse(localStorage.getItem('tutores')) || [];
    setTutores(dadosTutores);
  }, []);

  // Filtrar animais quando o tutor muda
  useEffect(() => {
    if (formData.tutorId) {
      const todosAnimais = JSON.parse(localStorage.getItem('animais')) || [];
      const filtrados = todosAnimais.filter(a => a.tutorId == formData.tutorId);
      setAnimaisDoTutor(filtrados);
      
      const t = tutores.find(item => item.id == formData.tutorId);
      if(t) setFormData(prev => ({...prev, tutorNome: t.nome}));
    }
  }, [formData.tutorId, tutores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Lógica de Vacinas (Modal)
  const adicionarVacinaLista = () => {
    if (vacinaTemp.nome) {
      if (editingVacinaIndex !== null) {
        const novasVacinas = [...vacinas];
        novasVacinas[editingVacinaIndex] = vacinaTemp;
        setVacinas(novasVacinas);
        setEditingVacinaIndex(null);
      } else {
        setVacinas([...vacinas, vacinaTemp]);
      }
      setVacinaTemp({ nome: '', data: '', revacina: '' });
    }
  };

  const adicionarAlergiaLista = () => {
    if (alergiaTemp) {
      if (editingAlergiaIndex !== null) {
        const novasAlergias = [...alergiasLista];
        novasAlergias[editingAlergiaIndex] = alergiaTemp;
        setAlergiasLista(novasAlergias);
        setEditingAlergiaIndex(null);
      } else {
        setAlergiasLista([...alergiasLista, alergiaTemp]);
      }
      setAlergiaTemp('');
    }
  };

  const removerVacina = (index) => {
    setVacinas(vacinas.filter((_, i) => i !== index));
  };

  const removerAlergia = (index) => {
    setAlergiasLista(alergiasLista.filter((_, i) => i !== index));
  };

  const prepararEdicaoVacina = (index) => {
    setVacinaTemp(vacinas[index]);
    setEditingVacinaIndex(index);
  };

  const prepararEdicaoAlergia = (index) => {
    setAlergiaTemp(alergiasLista[index]);
    setEditingAlergiaIndex(index);
  };

  const handleSalvarAtendimento = (e) => {
    e.preventDefault();
    const atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
    
    const novo = {
      ...formData,
      id: Date.now(),
      status: 'Aguardando',
      vacinas: vacinas,
      alergias: alergiasLista
    };

    localStorage.setItem('atendimentos', JSON.stringify([...atendimentos, novo]));
    alert('Atendimento registado com sucesso!');
    navigate('/recepcao');
  };

  return (
    <div className="container">
      
        <div className="header-actions">
          <h2>Novo Atendimento</h2>
          <button type="button" className="btn-back" onClick={() => navigate('/recepcao')}>← Voltar</button>
        </div>

        <form onSubmit={handleSalvarAtendimento}>
          <div className="form-grid">
            {/* LINHA 1: IDENTIFICAÇÃO */}
            <div className="form-group">
              <label>Tutor</label>
              <select name="tutorId" value={formData.tutorId} onChange={handleChange} required>
                <option value="">Selecione o tutor...</option>
                {tutores.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Animal</label>
              <select name="animalNome" value={formData.animalNome} onChange={handleChange} required disabled={!formData.tutorId}>
                <option value="">Selecione o animal...</option>
                {animaisDoTutor.map((a, i) => <option key={i} value={a.nome}>{a.nome}</option>)}
              </select>
            </div>

            {/* LINHA 2: VETERINÁRIO E DATA */}
            <div className="form-group">
              <label>Veterinário</label>
              <select name="veterinario" value={formData.veterinario} onChange={handleChange}>
                <option value="">Selecione...</option>
                <option value="Dr. João">Dr. João</option>
                <option value="Dra. Maria">Dra. Maria</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prioridade</label>
              <select name="prioridade" value={formData.prioridade} onChange={handleChange}>
                <option value="Rotina">Rotina</option>
                <option value="Urgente">Urgente</option>
                <option value="Emergência">Emergência</option>
              </select>
            </div>
            <div className="form-group">
              <label>Data</label>
              <input type="date" name="data" value={formData.data} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Hora</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
            </div>

            {/* TRIAGEM (CAMPOS QUE ESTAVAM FALTANDO) */}
            <div className="form-group">
              <label>Peso (kg)</label>
              <input type="number" name="peso" step="0.1" value={formData.peso} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Temp (°C)</label>
              <input type="number" name="temperatura" step="0.1" value={formData.temperatura} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>FC (bpm)</label>
              <input type="number" name="frequenciaCardiaca" value={formData.frequenciaCardiaca} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>FR (mpm)</label>
              <input type="number" name="frequenciaRespiratoria" value={formData.frequenciaRespiratoria} onChange={handleChange} />
            </div>

            {/* PARÂMETROS CLÍNICOS */}
            <div className="form-group">
              <label>TPC (seg)</label>
              <input type="text" name="tpc" value={formData.tpc} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Mucosas</label>
              <select name="mucosas" value={formData.mucosas} onChange={handleChange}>
                <option value="Normocoradas">Normocoradas</option>
                <option value="Pálidas">Pálidas</option>
                <option value="Cianóticas">Cianóticas</option>
                <option value="Ictéricas">Ictéricas</option>
              </select>
            </div>
            <div className="form-group">
              <label>Hidratação</label>
              <select name="hidratacao" value={formData.hidratacao} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Leve (5%)">Leve (5%)</option>
                <option value="Moderada (6-8%)">Moderada (6-8%)</option>
                <option value="Grave (+10%)">Grave (+10%)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nível de Consciência</label>
              <select name="consciencia" value={formData.consciencia} onChange={handleChange}>
                <option value="Alerta">Alerta</option>
                <option value="Deprimido">Deprimido</option>
                <option value="Estupor">Estupor</option>
                <option value="Coma">Coma</option>
              </select>
            </div>

            {/* ALERGIAS */}
            <div className="form-group full-width">
              <label>Alergias</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn-add-vacina" onClick={() => {
                  setAlergiaTemp('');
                  setEditingAlergiaIndex(null);
                  setShowModalAlergias(true);
                }}>
                  + Gerir Alergias
                </button>
                {alergiasLista.map((a, i) => (
                  <span key={i} className="vacina-tag" style={{backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5'}}>{a}</span>
                ))}
              </div>
            </div>

            {/* BOTÃO DE VACINAS (Como tinhas no HTML) */}
            <div className="form-group full-width">
              <label>Vacinação</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="btn-add-vacina" onClick={() => {
                  setVacinaTemp({ nome: '', data: '', revacina: '' });
                  setEditingVacinaIndex(null);
                  setShowModalVacinas(true);
                }}>
                  + Gerir Vacinas
                </button>
                {vacinas.map((v, i) => (
                  <span key={i} className="vacina-tag">{v.nome}</span>
                ))}
              </div>
            </div>

            {/* QUEIXA E OBSERVAÇÕES */}
            <div className="form-group full-width">
              <label>Queixa Principal</label>
              <textarea name="queixa" rows="2" value={formData.queixa} onChange={handleChange}></textarea>
            </div>
          </div>

          <div className="btn-toolbar" style={{marginTop: '2rem'}}>
            <button type="submit" className="btn btn-primary salvar">Salvar Atendimento</button>
          </div>
        </form>

        {/* MODAL DE VACINAS (Simulado dentro do JSX) */}
        {showModalVacinas && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Histórico de Vacinação</h3>
              <div className="form-grid">
                <input type="text" placeholder="Nome da Vacina" value={vacinaTemp.nome} 
                       onChange={(e) => setVacinaTemp({...vacinaTemp, nome: e.target.value})} />
                <input type="date" value={vacinaTemp.data} 
                       onChange={(e) => setVacinaTemp({...vacinaTemp, data: e.target.value})} />
                <button type="button" onClick={adicionarVacinaLista}>
                  {editingVacinaIndex !== null ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
              <ul style={{marginTop: '10px'}}>
                {vacinas.map((v, i) => (
                  <li key={i}>
                    <span className="editable-text" onClick={() => prepararEdicaoVacina(i)} title="Clique para editar">
                      {v.nome} - {v.data}
                    </span>
                    <button type="button" className="btn-delete-item" onClick={() => removerVacina(i)} title="Remover">🗑️</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowModalVacinas(false)}>Fechar</button>
            </div>
          </div>
        )}

        {/* MODAL DE ALERGIAS */}
        {showModalAlergias && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Gerenciar Alergias</h3>
              <div className="form-grid">
                <input type="text" placeholder="Alergia" value={alergiaTemp} 
                       onChange={(e) => setAlergiaTemp(e.target.value)} />
                <button type="button" onClick={adicionarAlergiaLista}>
                  {editingAlergiaIndex !== null ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
              <ul style={{marginTop: '10px'}}>
                {alergiasLista.map((a, i) => (
                  <li key={i}>
                    <span className="editable-text" onClick={() => prepararEdicaoAlergia(i)} title="Clique para editar">
                      {a}
                    </span>
                    <button type="button" className="btn-delete-item" onClick={() => removerAlergia(i)} title="Remover">🗑️</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowModalAlergias(false)}>Fechar</button>
            </div>
          </div>
        )}
    
    </div>
  );
}