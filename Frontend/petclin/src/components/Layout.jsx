import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Lógica de logout aqui (limpar token, session, etc)
    console.log("Logout realizado");
    navigate('/login');
  };

  return (
    <>
      <main className="login-card card">
        {/* Coluna Esquerda: Sidebar */}
        <aside className="sidebar">
          <h3>Serviços</h3>
          <ul>
            {/* Note o uso de <Link> ao invés de onclick/href */}
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/agenda">Agenda</Link></li>
            <li><Link to="/recepcao">Recepção</Link></li>
            <li><Link to="/tutores">Tutores</Link></li>
            <li><Link to="/animais">Animais</Link></li>
            <li><Link to="/internacao">Internação</Link></li>
            <li><Link to="/vacinas">Vacinas</Link></li>
          </ul>
        </aside>

        {/* Coluna Direita: Onde as páginas mudarão dinamicamente */}
        <section className="content-area">
          <button id="menuBtn" className="menu-btn" aria-label="Abrir menu">☰</button>
          
          <div id="conteudoServico" role="tabpanel">
             {/* O Outlet é onde o React Router renderiza a página filha (Dashboard, Agenda, etc) */}
            <Outlet />
          </div>
        </section>
      </main>

      <button onClick={handleLogout} className="btn-btn-logout">Sair</button>
    </>
  );
}