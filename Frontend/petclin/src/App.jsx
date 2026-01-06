import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Recepcao from './pages/recepcao'; // <-- VOCÊ IMPORTOU AQUI


// APAGUE as linhas abaixo que declaram 'const Recepcao' ou 'const NovoAtendimento'
// Mantenha apenas as que você ainda NÃO criou o arquivo .jsx
const Tutores = () => <div><h2>Tutores</h2><p>Em desenvolvimento...</p></div>;
const Animais = () => <div><h2>Animais</h2><p>Em desenvolvimento...</p></div>;
const Internacao = () => <div><h2>Internação</h2><p>Em desenvolvimento...</p></div>;
const Vacinas = () => <div><h2>Vacinas</h2><p>Em desenvolvimento...</p></div>;
const Login = () => <div><h2>Login</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="recepcao" element={<Recepcao />} />
  
          <Route path="tutores" element={<Tutores />} />
          <Route path="animais" element={<Animais />} />
          <Route path="internacao" element={<Internacao />} />
          <Route path="vacinas" element={<Vacinas />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;