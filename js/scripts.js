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

                // Adiciona o evento de clique ao botão dentro do modal
                const btnCadastrar = document.getElementById("btnCadastrar");
                if (btnCadastrar) {
                    btnCadastrar.addEventListener("click", (event) => {
                        event.preventDefault();
                        console.log("Botão 'Cadastrar' clicado!");

                        cadastrarPaciente();
                    });
                } else {
                    console.error("Botão 'Cadastrar' não encontrado no modal.");
                }
            } else {
                console.error("Erro: Modal não encontrado no conteúdo carregado.");
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o modal:", error);
        });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM completamente carregado.");

    // Adiciona o evento de clique ao botão que abre o modal
    const btnAbrirModal = document.getElementById("btnAbrirModalCadastro");
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", abrirModalCadastroPaciente);
    } else {
        console.error("Botão para abrir o modal não encontrado no DOM.");
    }
});


async function cadastrarPaciente() {
    const pacienteData = obterDadosPaciente();
    if (!pacienteData) {
        console.warn("Erro: Dados inválidos, abortando envio.");
        return;
    }

    console.log("Enviando os seguintes dados para a API:", JSON.stringify(pacienteData, null, 2));

    try {
        const response = await fetch("https://apicarteiravacinal.jorgedev.net/paciente/inserir", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(pacienteData),
            mode: "cors"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
        }

        const successMessage = data.message || "Cadastro realizado com sucesso!";
        console.log("Resposta da API:", data);
        exibirMensagem(successMessage, "success");

        // Fecha o modal após um pequeno atraso para permitir que a mensagem seja vista
        setTimeout(() => {
            fecharModal("#modalCadastroPaciente");
        }, 3000); // 3 segundos de atraso
    } catch (error) {
        let errorMessage = "Erro ao cadastrar paciente.";
        if (error instanceof SyntaxError) {
            errorMessage = "Erro ao processar a resposta da API.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Tenta extrair a mensagem de erro da resposta da API
        try {
            const errorResponse = await error.json();
            if (errorResponse && errorResponse.message) {
                errorMessage = errorResponse.message;
            }
        } catch (e) {
            console.error("Erro ao processar a mensagem de erro da API:", e);
        }

        console.error("Erro ao cadastrar paciente:", errorMessage);
        exibirMensagem(`Erro ao cadastrar paciente: ${errorMessage}`, "error");
    }
}

// Obtém os dados do paciente e faz validações
function obterDadosPaciente() {
    const nome = document.getElementById("nome")?.value.trim();
    const cpf = document.getElementById("cpf")?.value.trim();
    const sexo = document.getElementById("sexo")?.value;
    const dataNascimento = document.getElementById("data")?.value;

    if (!nome || !cpf || !sexo || !dataNascimento) {
        exibirMensagem("Todos os campos devem estar preenchidos.", "error");
        return null;
    }

    const cpfNumeros = cpf.replace(/\D/g, "");
    if (cpfNumeros.length !== 11 || isNaN(cpfNumeros)) {
        exibirMensagem("O CPF deve conter exatamente 11 números.", "error");
        return null;
    }

    const dataNasc = new Date(dataNascimento);
    const dataAtual = new Date();
    if (dataNasc > dataAtual) {
        exibirMensagem("A data de nascimento não pode estar no futuro.", "error");
        return null;
    }

    // Formata a data para dd-mm-YYYY
    const dia = String(dataNasc.getDate()).padStart(2, '0');
    const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
    const ano = dataNasc.getFullYear();
    const dataNascimentoFormatada = `${dia}-${mes}-${ano}`;

    console.log("Data formatada:", dataNascimentoFormatada);

    return { nome, cpf: cpfNumeros, sexo, dataNascimento: dataNascimentoFormatada };
}

// Exibe mensagens no modal
function exibirMensagem(mensagem, tipo) {
    const mensagemContainer = document.createElement("div");
    mensagemContainer.className = `alert alert-${tipo === "success" ? "success" : "danger"}`;
    mensagemContainer.textContent = mensagem;

    const modalBody = document.querySelector("#modalCadastroPaciente .modal-body");
    modalBody.prepend(mensagemContainer);

    setTimeout(() => mensagemContainer.remove(), 5000);
}

function fecharModal(modalId) {
    const modalElement = document.querySelector(modalId);
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}