let timeoutId;
let activeDropdown = null;

let url = "https://apicarteiravacinal.jorgedev.net";

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
        const response = await fetch(url+"/paciente/inserir", {
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

        setTimeout(() => {
            fecharModal("#modalCadastroPaciente");
        }, 3000);
    } catch (error) {
        let errorMessage = "Erro ao cadastrar paciente.";
        if (error instanceof SyntaxError) {
            errorMessage = "Erro ao processar a resposta da API.";
        } else if (error.message) {
            errorMessage = error.message;
        }

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

    const dia = String(dataNasc.getDate()).padStart(2, '0');
    const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
    const ano = dataNasc.getFullYear();
    const dataNascimentoFormatada = `${dia}-${mes}-${ano}`;

    console.log("Data formatada:", dataNascimentoFormatada);

    return { nome, cpf: cpfNumeros, sexo, dataNascimento: dataNascimentoFormatada };
}

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

async function listarPacientes(id) {
    if (id) {
        url += `/${id}`;
    }

    try {
        const response = await fetch(url+"/paciente/consultar", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        exibirPacientes(data);
    } catch (error) {
        console.error("Erro ao listar pacientes:", error);
        exibirMensagem(`Erro ao listar pacientes: ${error.message}`, "error");
    }
}

function exibirPacientes(pacientes) {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";

    if (!Array.isArray(pacientes)) {
        pacientes = [pacientes];
    }

    const table = document.createElement("table");
    table.className = "table table-striped table-center";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Sexo</th>
            <th>Data de Nascimento</th>
            <th>Ações</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    pacientes.forEach(paciente => {
        const dataNascimentoFormatada = formatarData(paciente.dataNascimento);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${paciente.id}</td>
            <td>${paciente.nome}</td>
            <td>${paciente.cpf}</td>
            <td>${paciente.sexo}</td>
            <td>${dataNascimentoFormatada}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarPaciente(${paciente.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="confirmarExclusao(${paciente.id}, '${paciente.nome}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultContainer.appendChild(table);
}

function formatarData(data) {
    const [dia, mes, ano] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function exibirMensagem(mensagem, tipo) {
    const mensagemContainer = document.createElement("div");
    mensagemContainer.className = `alert alert-${tipo === "success" ? "success" : "danger"}`;
    mensagemContainer.textContent = mensagem;

    const resultContainer = document.getElementById("resultContainer");
    resultContainer.prepend(mensagemContainer);

    setTimeout(() => mensagemContainer.remove(), 5000);
}

function editarPaciente(id) {
    console.log(`Editar paciente com ID: ${id}`);
}

function confirmarExclusao(id, nome) {
    const mensagemConfirmacao = document.getElementById("mensagemConfirmacao");
    mensagemConfirmacao.textContent = `Você tem certeza que deseja excluir o paciente ${nome} com o ID ${id}?`;

    const btnConfirmarExclusao = document.getElementById("btnConfirmarExclusao");
    btnConfirmarExclusao.onclick = function() {
        excluirPaciente(id);
    };

    const modalConfirmarExclusao = new bootstrap.Modal(document.getElementById("modalConfirmarExclusao"));
    modalConfirmarExclusao.show();
}

async function excluirPaciente(id) {
    try {
        const response = await fetch(url+`/paciente/excluir/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
        }

        const successMessage = data.message || "Paciente excluído com sucesso!";
        console.log("Resposta da API:", data);
        exibirToast(successMessage);

        const modalConfirmarExclusao = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusao"));
        if (modalConfirmarExclusao) {
            modalConfirmarExclusao.hide();
        }

        listarPacientes();
    } catch (error) {
        let errorMessage = "Erro ao excluir paciente.";
        if (error instanceof SyntaxError) {
            errorMessage = "Erro ao processar a resposta da API.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error("Erro ao excluir paciente:", errorMessage);
        exibirToast(`Erro ao excluir paciente: ${errorMessage}`);
    }
}

function exibirToast(mensagem) {
    const toastMensagem = document.getElementById("toastMensagem");
    toastMensagem.textContent = mensagem;

    const toastGeneric = new bootstrap.Toast(document.getElementById("toastGeneric"));
    toastGeneric.show();
}
