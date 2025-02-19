// Função para alternar a visibilidade do menu dropdown
function toggleDropdown() {
  var dropdown = document.getElementById("dropdownMenu");
  dropdown.classList.toggle("show");
}

// Fecha o dropdown ao clicar fora
window.onclick = function(event) {
  if (!event.target.matches('.dropdown-btn') && !event.target.matches('.dropdown-content a')) {
      var dropdown = document.getElementById("dropdownMenu");
      if (dropdown.classList.contains("show")) {
          dropdown.classList.remove("show");
      }
  }
}

// Função para abrir o Modal de Cadastro de Paciente
function abrirModalCadastroPaciente(event) {
  event.preventDefault(); // Prevenir o comportamento padrão do link

  console.log("Abrindo modal de cadastro de paciente...");

  // Carregar o modal de forma assíncrona
  fetch("components/modal_cadastro_paciente.html")
      .then(response => {
          if (!response.ok) {
              throw new Error("Erro ao carregar o modal: " + response.statusText);
          }
          return response.text();
      })
      .then(html => {
          console.log("Modal carregado com sucesso!");
          document.getElementById("modalContainer").innerHTML = html;

          // Verifique se o modal foi carregado corretamente
          var modalElement = document.getElementById('modalCadastroPaciente');
          if (modalElement) {
              var modal = new bootstrap.Modal(modalElement);
              modal.show();
          } else {
              console.error("Erro: Modal não encontrado no conteúdo carregado.");
          }
      })
      .catch(error => {
          console.error("Erro ao carregar o modal:", error);
      });
}


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
