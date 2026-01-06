import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NovoAtendimento() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <main className="card">
        <div className="header-actions">
          <h2>Novo Atendimento</h2>
          <button className="btn-secondary" onClick={() => navigate('/recepcao')}>
            ← Voltar
          </button>
        </div>
        <p>Conteúdo do formulário em migração...</p>
      </main>
    </div>
  );
}