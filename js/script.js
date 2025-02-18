document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (event) => {
    // Previne o envio padrão do formulário
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const sexo = document.getElementById("sexo").value;
    const dataNascimento = document.getElementById("data").value;

    // Se os campos estão vazios
    if (!nome || !cpf || !sexo || !dataNascimento) {
      alert("Todos os campos devem estar preenchidos.");
      return;
    }

    // Se o campo CPF tem letras ou é menor que 11 caracteres
    const cpfNumeros = cpf.replace(/\D/g, ""); // remove os trem nos números
    if (cpfNumeros.length !== 11 || isNaN(cpfNumeros)) {
      alert("O CPF deve conter 11 números e não pode ter letras.");
      return;
    }

    const dataAtual = new Date(); // Data atual
    const dataNasc = new Date(dataNascimento);
    if (dataNasc > dataAtual) {
      alert("A data de nascimento não pode estarr no futuro.");
      return;
    }

    // Se todas as validações passarem
    alert("Cadastro realizado com sucesso!");

    // Envia pra lugar nenhum
    form.submit();
  });
});
