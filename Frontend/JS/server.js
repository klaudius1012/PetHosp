const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

// Permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());

// Serve os arquivos do projeto (HTML, CSS, JS) estaticamente
app.use(express.static(__dirname));

// Rota específica para salvar os dados no arquivo tutores.json
app.put("/DATA/tutores.json", (req, res) => {
  const filePath = path.join(__dirname, "DATA", "tutores.json");

  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo:", err);
      return res.status(500).send("Erro ao salvar dados.");
    }
    res.send("Dados atualizados com sucesso.");
  });
});

// Rota específica para salvar os dados no arquivo pet.json
app.put("/DATA/pet.json", (req, res) => {
  const filePath = path.join(__dirname, "DATA", "pet.json");

  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo pet.json:", err);
      return res.status(500).send("Erro ao salvar dados de pets.");
    }
    res.send("Dados de pets atualizados com sucesso.");
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Acesse: http://localhost:${port}/home.html`);
});
