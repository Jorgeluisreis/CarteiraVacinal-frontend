let timeoutId;
let activeDropdown = null;

function abrirDropdown(event) {
    const button = event.target;
    const dropdown = button.nextElementSibling;

    clearTimeout(timeoutId);
    
    if (activeDropdown && activeDropdown !== dropdown) {
        activeDropdown.classList.remove("show");
    }

    dropdown.classList.add("show");
    activeDropdown = dropdown;
}

function fecharDropdown(dropdown) {
    timeoutId = setTimeout(() => {
        dropdown.classList.remove("show");
        if (activeDropdown === dropdown) {
            activeDropdown = null;
        }
    }, 300); 
}


function manterDropdownAberto(event) {
    clearTimeout(timeoutId);
}


const dropdownButtons = document.querySelectorAll('.dropdown-btn');
dropdownButtons.forEach(button => {
    const dropdown = button.nextElementSibling;

    button.addEventListener('mouseenter', abrirDropdown);
    button.addEventListener('mouseleave', () => fecharDropdown(dropdown));

    dropdown.addEventListener('mouseenter', manterDropdownAberto);
    dropdown.addEventListener('mouseleave', () => fecharDropdown(dropdown));
});

document.addEventListener('mouseleave', () => {
    if (activeDropdown) {
        activeDropdown.classList.remove("show");
        activeDropdown = null;
    }
});

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
