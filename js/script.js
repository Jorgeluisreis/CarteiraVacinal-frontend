function toggleDropdown() {
  var dropdown = document.getElementById("dropdownMenu");
  dropdown.classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropdown-btn') && !event.target.matches('.dropdown-content a')) {
      var dropdown = document.getElementById("dropdownMenu");
      if (dropdown.classList.contains("show")) {
          dropdown.classList.remove("show");
      }
  }
}

function abrirModalCadastroPaciente(event) {
  event.preventDefault();

  console.log("Abrindo modal de cadastro de paciente...");

  fetch("/components/modal_cadastro_paciente.html")
      .then(response => {
          if (!response.ok) {
              throw new Error("Erro ao carregar o modal: " + response.statusText);
          }
          return response.text();
      })
      .then(html => {
          console.log("Modal carregado com sucesso!");
          document.getElementById("modalContainer").innerHTML = html;

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
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const sexo = document.getElementById("sexo").value;
    const dataNascimento = document.getElementById("data").value;

    if (!nome || !cpf || !sexo || !dataNascimento) {
      alert("Todos os campos devem estar preenchidos.");
      return;
    }

    const cpfNumeros = cpf.replace(/\D/g, "");
    if (cpfNumeros.length !== 11 || isNaN(cpfNumeros)) {
      alert("O CPF deve conter 11 números e não pode ter letras.");
      return;
    }

    const dataAtual = new Date();
    const dataNasc = new Date(dataNascimento);
    if (dataNasc > dataAtual) {
      alert("A data de nascimento não pode estarr no futuro.");
      return;
    }

    alert("Cadastro realizado com sucesso!");

    form.submit();
  });
});
