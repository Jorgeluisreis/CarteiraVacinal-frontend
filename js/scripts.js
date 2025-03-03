let timeoutId;
let activeDropdown = null;
let zIndexCounter = 1050;

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

    fetch("/components/modal_cadastro_paciente.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("modalContainer").innerHTML = html;

            const modalElement = document.getElementById('modalCadastroPaciente');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            const btnCadastrar = document.getElementById("btnCadastrar");
            btnCadastrar.addEventListener("click", (event) => {
                event.preventDefault();
                cadastrarPaciente();
            });

            document.getElementById("cpf").addEventListener("input", mascararCPFInput);
        })
        .catch(error => console.error("Erro ao carregar o modal de cadastro de paciente:", error));
}

function abrirModalCadastroImunizacao(event) {
    event.preventDefault();

    fetch("/components/modal_cadastro_imunizacao.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("modalContainer").innerHTML = html;

            const modalElement = document.getElementById('modalCadastroImunizacao');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            carregarPacientes();
            carregarVacinas();

            const btnCadastrarImunizacao = document.getElementById("btnCadastrarImunizacao");
            btnCadastrarImunizacao.addEventListener("click", (event) => {
                event.preventDefault();
                cadastrarImunizacao();
            });
        })
        .catch(error => console.error("Erro ao carregar o modal de cadastro de imunização:", error));
}

document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/header.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("headerContainer").innerHTML = html;
        })
        .catch(error => console.error("Erro ao carregar o header:", error));

    fetch("/components/footer.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("footerContainer").innerHTML = html;
        })
        .catch(error => console.error("Erro ao carregar o footer:", error));

    if (document.getElementById("btnPesquisarImunizacao")) {
        document.getElementById("btnPesquisarImunizacao").addEventListener("click", function () {
            const searchId = document.getElementById("searchId").value.trim();
            const checkboxPaciente = document.getElementById("checkboxPaciente").checked;
            const checkboxImunizacao = document.getElementById("checkboxImunizacao").checked;

            if (checkboxPaciente && checkboxImunizacao) {
                exibirToast("Selecione apenas uma opção de filtro.");
                return;
            }

            if (searchId && checkboxPaciente) {
                listarImunizacoesPorPaciente(searchId);
            } else if (searchId && checkboxImunizacao) {
                listarImunizacoesPorId(searchId);
            } else if (!searchId && !checkboxPaciente && !checkboxImunizacao) {
                listarImunizacoes();
            } else {
                exibirToast("Digite um ID e selecione uma opção de filtro.");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/components/header.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("headerContainer").innerHTML = html;
            const script = document.createElement("script");
            script.src = "/js/scripts.js";
            script.onload = function () {
                console.log("Script carregado com sucesso.");
            };
            document.body.appendChild(script);
        })
        .catch(error => console.error("Erro ao carregar o header:", error));

    fetch("/components/footer.html")
        .then(response => response.text())
        .then(html => {
            document.getElementById("footerContainer").innerHTML = html;
        })
        .catch(error => console.error("Erro ao carregar o footer:", error));
});

function exibirImunizacoesCarteira(imunizacoes) {
    const container = document.getElementById("carteiraImunizacoesContainer");
    container.innerHTML = "";

    if (!imunizacoes || imunizacoes.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Sem imunizações cadastradas para este paciente.";
        container.appendChild(mensagem);
        return;
    }

    const table = document.createElement("table");
    table.className = "table table-striped table-center";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Vacina</th>
            <th>Dose</th>
            <th>Data de Aplicação</th>
            <th>Fabricante</th>
            <th>Lote</th>
            <th>Local de Aplicação</th>
            <th>Profissional Aplicador</th>
            <th>Ações</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    imunizacoes.forEach(imunizacao => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${imunizacao.id}</td>
            <td>${imunizacao.vacina}</td>
            <td>${imunizacao.dose}</td>
            <td>${formatarData(imunizacao.dataAplicacao)}</td>
            <td>${imunizacao.fabricante}</td>
            <td>${imunizacao.lote}</td>
            <td>${imunizacao.localAplicacao}</td>
            <td>${imunizacao.profissionalAplicador}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="confirmarExclusaoImunizacao(${imunizacao.id}, '${imunizacao.vacina}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

function confirmarExclusaoImunizacao(id, vacina) {
    const mensagemConfirmacaoImunizacao = document.getElementById("mensagemConfirmacaoImunizacao");
    mensagemConfirmacaoImunizacao.textContent = `Você tem certeza que deseja excluir a imunização ${vacina} com o ID ${id}?`;

    const btnConfirmarExclusaoImunizacao = document.getElementById("btnConfirmarExclusaoImunizacao");
    btnConfirmarExclusaoImunizacao.onclick = async function() {
        try {
            const response = await fetch(`${url}/imunizacao/excluir/${id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json"
                },
                mode: "cors"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
            }

            exibirToast(data.message || "Imunização excluída com sucesso!");

            const modalConfirmarExclusaoImunizacao = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusaoImunizacao"));
            if (modalConfirmarExclusaoImunizacao) {
                modalConfirmarExclusaoImunizacao.hide();
            }

            const modalCarteiraVacinal = bootstrap.Modal.getInstance(document.getElementById("modalCarteiraVacinal"));
            if (modalCarteiraVacinal) {
                modalCarteiraVacinal.hide();
            }

            setTimeout(() => {
                abrirModalCarteiraVacinal(document.getElementById("carteiraId").value);
            }, 100); 

        } catch (error) {
            console.error("Erro ao excluir imunização:", error);
            exibirToast(`Erro ao excluir imunização: ${error.message}`);
        }
    };

    const modalConfirmarExclusaoImunizacao = new bootstrap.Modal(document.getElementById("modalConfirmarExclusaoImunizacao"));
    modalConfirmarExclusaoImunizacao.show();
}

async function excluirImunizacao(id) {
    try {
        const response = await fetch(`${url}/imunizacao/excluir/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            mode: "cors"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
        }

        exibirToast(data.message || "Imunização excluída com sucesso!");

        const modalConfirmarExclusaoImunizacao = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusaoImunizacao"));
        if (modalConfirmarExclusaoImunizacao) {
            modalConfirmarExclusaoImunizacao.hide();
        }

        const pacienteId = document.getElementById("carteiraId").value;
        abrirModalCarteiraVacinal(pacienteId);
    } catch (error) {
        console.error("Erro ao excluir imunização:", error);
        exibirToast(`Erro ao excluir imunização: ${error.message}`);
    }
}

function abrirModalCarteiraVacinal(id) {
    const loading = document.getElementById("loading");
    const carteiraContent = document.getElementById("carteiraContent");
    loading.style.display = "block";
    carteiraContent.style.display = "none";

    const modalCarteiraVacinal = new bootstrap.Modal(document.getElementById("modalCarteiraVacinal"));
    modalCarteiraVacinal.show();

    fetch(url + `/paciente/consultar/${id}`)
        .then(response => response.json())
        .then(paciente => {
            document.getElementById("carteiraId").value = paciente.id;
            document.getElementById("carteiraNome").value = paciente.nome;
            document.getElementById("carteiraSexo").value = paciente.sexo;
            document.getElementById("carteiraCpf").value = mascararCPF(paciente.cpf);
            document.getElementById("carteiraDataNascimento").value = formatarData(paciente.dataNascimento);

            return Promise.all([
                listarImunizacoesPorPaciente(paciente.id),
                obterEstatisticasPaciente(paciente.id)
            ]);
        })
        .then(([imunizacoes, estatisticas]) => {
            exibirImunizacoesModal(imunizacoes);
            exibirEstatisticas(estatisticas);
            loading.style.display = "none";
            carteiraContent.style.display = "block";

            const btnExcluirTodasImunizacoes = document.getElementById("btnExcluirTodasImunizacoes");
            btnExcluirTodasImunizacoes.onclick = function() {
                confirmarExclusaoTodasImunizacoes(document.getElementById("carteiraId").value, document.getElementById("carteiraNome").value);
            };
        })
        .catch(error => {
            console.error("Erro ao carregar os dados do paciente:", error);
            exibirToast(`Erro ao carregar os dados do paciente: ${error.message}`);
            loading.style.display = "none";
        });
}

async function excluirTodasImunizacoes(id) {
    try {
        const response = await fetch(`${url}/imunizacao/excluir/paciente/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            mode: "cors"
        });

        let data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error("Resposta da API não está no formato JSON.");
        }

        if (!response.ok) {
            throw new Error(data.message || "Erro ao excluir todas as imunizações.");
        }

        exibirToast(data.message || "Todas as imunizações foram excluídas com sucesso!");

        const modalConfirmarExclusaoImunizacoes = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusaoImunizacoes"));
        if (modalConfirmarExclusaoImunizacoes) {
            modalConfirmarExclusaoImunizacoes.hide();
        }

        const modalCarteiraVacinal = bootstrap.Modal.getInstance(document.getElementById("modalCarteiraVacinal"));
        if (modalCarteiraVacinal) {
            modalCarteiraVacinal.hide();
        }

        setTimeout(() => {
            abrirModalCarteiraVacinal(id);
        }, 500);
    } catch (error) {
        console.error("Erro ao excluir todas as imunizações:", error);
        exibirToast(`Erro ao excluir todas as imunizações: ${error.message}`);
    }
}

function exibirImunizacoesModal(imunizacoes) {
    const container = document.getElementById("carteiraImunizacoesContainer");
    container.innerHTML = "";

    const btnExcluirTodasImunizacoes = document.getElementById("btnExcluirTodasImunizacoes");
    if (imunizacoes.length > 1) {
        btnExcluirTodasImunizacoes.style.display = "block";
    } else {
        btnExcluirTodasImunizacoes.style.display = "none";
    }

    if (!imunizacoes || imunizacoes.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Sem imunizações cadastradas para este paciente.";
        container.appendChild(mensagem);
        return;
    }

    const table = document.createElement("table");
    table.className = "table table-striped table-responsive";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Vacina</th>
            <th>Dose</th>
            <th>Data de Aplicação</th>
            <th>Fabricante</th>
            <th>Lote</th>
            <th>Local de Aplicação</th>
            <th>Profissional Aplicador</th>
            <th>Ações</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    imunizacoes.forEach(imunizacao => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", imunizacao.id);
        tr.innerHTML = `
            <td>${imunizacao.id}</td>
            <td>${imunizacao.vacina}</td>
            <td>${imunizacao.dose}</td>
            <td>${formatarData(imunizacao.dataAplicacao)}</td>
            <td>${imunizacao.fabricante}</td>
            <td>${imunizacao.lote}</td>
            <td>${imunizacao.localAplicacao}</td>
            <td>${imunizacao.profissionalAplicador}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="abrirModalEditarImunizacao(${imunizacao.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="confirmarExclusaoImunizacao(${imunizacao.id}, '${imunizacao.vacina}')">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

function abrirModalEditarImunizacao(id) {
    fetch(`/components/modal_editar_imunizacao.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("modalContainer").innerHTML = html;

            const modalElement = document.getElementById('modalEditarImunizacao');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            const pacienteNome = document.getElementById("carteiraNome").value;
            const imunizacaoRow = document.querySelector(`#carteiraImunizacoesContainer tr[data-id="${id}"]`);
            const vacinaNome = imunizacaoRow.querySelector("td:nth-child(2)").textContent;
            const dose = imunizacaoRow.querySelector("td:nth-child(3)").textContent;
            const dataAplicacao = imunizacaoRow.querySelector("td:nth-child(4)").textContent;
            const fabricante = imunizacaoRow.querySelector("td:nth-child(5)").textContent;
            const lote = imunizacaoRow.querySelector("td:nth-child(6)").textContent;
            const localAplicacao = imunizacaoRow.querySelector("td:nth-child(7)").textContent;
            const profissionalAplicador = imunizacaoRow.querySelector("td:nth-child(8)").textContent;

            document.getElementById("paciente").value = pacienteNome;
            document.getElementById("vacina").value = `${vacinaNome} - ${dose}`;
            document.getElementById("dataAplicacao").value = formatarDataParaInput(dataAplicacao);
            document.getElementById("fabricante").value = fabricante;
            document.getElementById("lote").value = lote;
            document.getElementById("localAplicacao").value = localAplicacao;
            document.getElementById("profissionalAplicador").value = profissionalAplicador;

            carregarVacinas().then(vacinas => {
                const vacina = vacinas.find(v => v.vacina === vacinaNome && v.dose === dose);
                if (vacina) {
                    document.getElementById("vacina").dataset.idDose = vacina.id;
                }
            });

            document.getElementById("btnSalvarEdicaoImunizacao").onclick = function() {
                salvarEdicaoImunizacao(id);
            };
        })
        .catch(error => console.error("Erro ao carregar o modal de edição de imunização:", error));
}

async function salvarEdicaoImunizacao(id) {
    const idPaciente = document.getElementById("carteiraId").value;
    const idDose = document.getElementById("vacina").dataset.idDose;
    const dataAplicacao = document.getElementById("dataAplicacao").value;
    const fabricante = document.getElementById("fabricante").value.trim();
    const lote = document.getElementById("lote").value.trim();
    const localAplicacao = document.getElementById("localAplicacao").value.trim();
    const profissionalAplicador = document.getElementById("profissionalAplicador").value.trim();

    const dataAplicacaoFormatada = formatarDataParaEnvio(dataAplicacao);

    const imunizacaoData = { idPaciente, idDose, dataAplicacao: dataAplicacaoFormatada, fabricante, lote, localAplicacao, profissionalAplicador };

    try {
        const response = await fetch(`${url}/imunizacao/alterar/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(imunizacaoData),
            mode: "cors"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erro ao editar a imunização.");
        }

        exibirToast(data.message || "Imunização editada com sucesso!");

        const modalEditarImunizacao = bootstrap.Modal.getInstance(document.getElementById("modalEditarImunizacao"));
        if (modalEditarImunizacao) {
            modalEditarImunizacao.hide();
        }

        const modalCarteiraVacinal = bootstrap.Modal.getInstance(document.getElementById("modalCarteiraVacinal"));
        if (modalCarteiraVacinal) {
            modalCarteiraVacinal.hide();
        }

        setTimeout(() => {
            abrirModalCarteiraVacinal(idPaciente);
        }, 500);
    } catch (error) {
        console.error("Erro ao editar imunização:", error);
        exibirToast(`Erro ao editar imunização: ${error.message}`);
    }
}

function carregarPacientes() {
    fetch(url + "/paciente/consultar")
        .then(response => response.json())
        .then(pacientes => {
            const pacienteSelect = document.getElementById("paciente");
            pacientes.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.id;
                option.textContent = paciente.nome;
                pacienteSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar pacientes:", error));
}

async function carregarVacinas() {
    try {
        const response = await fetch(url + "/vacinas/consultar");
        const vacinas = await response.json();
        return vacinas;
    } catch (error) {
        console.error("Erro ao carregar vacinas:", error);
        return [];
    }
}

async function cadastrarImunizacao() {
    const imunizacaoData = obterDadosImunizacao();
    if (!imunizacaoData) {
        return;
    }

    try {
        const response = await fetch(url + "/imunizacao/inserir", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(imunizacaoData),
            mode: "cors"
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                exibirToast(data.message || "Este paciente já possui esta imunização cadastrada.");
                return;
            }
        }

        exibirToast(data.message || "Imunização cadastrada com sucesso!");

        const modalCadastroImunizacao = bootstrap.Modal.getInstance(document.getElementById("modalCadastroImunizacao"));
        if (modalCadastroImunizacao) {
            modalCadastroImunizacao.hide();
        }

    } catch (error) {
        console.error("Erro ao cadastrar imunização:", error);
        exibirToast(`Erro ao cadastrar imunização: ${error.message}`);
    }
}

function obterDadosImunizacao() {
    const idPaciente = document.getElementById("paciente").value;
    const idDose = document.getElementById("vacina").value;
    const dataAplicacao = document.getElementById("dataAplicacao").value;
    const fabricante = document.getElementById("fabricante").value.trim();
    const lote = document.getElementById("lote").value.trim();
    const localAplicacao = document.getElementById("localAplicacao").value.trim();
    const profissionalAplicador = document.getElementById("profissionalAplicador").value.trim();

    if (!idPaciente || !idDose || !dataAplicacao) {
        exibirToast("Os campos Paciente, Vacina e Data de Aplicação são obrigatórios.");
        return null;
    }

    const dataAplicacaoFormatada = formatarDataParaEnvio(dataAplicacao);

    return { idPaciente, idDose, dataAplicacao: dataAplicacaoFormatada, fabricante, lote, localAplicacao, profissionalAplicador };
}

async function listarVacinas() {
    try {
        const response = await fetch(url + "/vacinas/consultar", {
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
        exibirVacinas(data);
    } catch (error) {
        console.error("Erro ao listar vacinas:", error);
        exibirToast(`Erro ao listar vacinas: ${error.message}`);
    }
}

function exibirVacinas(vacinas) {
    const resultContainer = document.getElementById("resultContainer");
    if (!resultContainer) {
        console.warn("Elemento resultContainer não encontrado no DOM.");
        return;
    }
    resultContainer.innerHTML = "";

    const table = document.createElement("table");
    table.className = "table table-striped table-center";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Vacina</th>
            <th>Dose</th>
            <th>Idade Recomendada (meses)</th>
            <th>Limite de Aplicação</th>
            <th>Público Alvo</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    vacinas.forEach(vacina => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${vacina.id}</td>
            <td>${vacina.vacina}</td>
            <td>${vacina.dose}</td>
            <td>${vacina.idadeRecomendadaMeses}</td>
            <td>${vacina.limiteAplicacao}</td>
            <td>${vacina.publicoAlvo}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultContainer.appendChild(table);
}

async function listarImunizacoes() {
    try {
        const response = await fetch(url + "/imunizacao/consultar", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        if (!response.ok) {
            const data = await response.json();
            exibirToast(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
            return;
        }

        const data = await response.json();
        exibirImunizacoes(data);
    } catch (error) {
        console.error("Erro ao listar imunizações:", error);
        exibirToast(`Erro ao listar imunizações: ${error.message}`);
    }
}

async function listarImunizacoesPorId(id) {
    try {
        const response = await fetch(url + `/imunizacao/consultar/${id}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        const data = await response.text();

        if (!response.ok) {
            const mensagemErro = data || `Erro na API: ${response.status} - ${response.statusText}`;
            exibirToast(mensagemErro);
            return;
        }

        exibirImunizacoes(JSON.parse(data));
    } catch (error) {
        console.error("Erro ao listar imunizações por ID:", error);
        exibirToast(`Erro ao listar imunizações por ID: ${error.message}`);
    }
}
async function listarImunizacoesPorPaciente(id) {
    try {
        const response = await fetch(url + `/imunizacao/consultar/paciente/${id}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        const data = await response.text();

        if (!response.ok) {
            const mensagemErro = data || `Erro na API: ${response.status} - ${response.statusText}`;
            exibirToast(mensagemErro);
            return [];
        }

        exibirImunizacoes(JSON.parse(data));
    } catch (error) {
        console.error("Erro ao listar imunizações por paciente:", error);
        exibirToast(`Erro ao listar imunizações por paciente: ${error.message}`);
    }
}

async function listarImunizacoesPorPaciente(id) {
    try {
        const response = await fetch(url + `/imunizacao/consultar/paciente/${id}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        const data = await response.text();

        if (!response.ok) {
            const mensagemErro = data || `Erro na API: ${response.status} - ${response.statusText}`;
            exibirToast(mensagemErro);
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao listar imunizações por paciente:", error);
        exibirToast(`Erro ao listar imunizações por paciente: ${error.message}`);
        return [];
    }
}


function exibirImunizacoes(imunizacoes) {
    const resultContainer = document.getElementById("resultContainer");
    if (!resultContainer) {
        console.warn("Elemento resultContainer não encontrado no DOM.");
        return;
    }
    resultContainer.innerHTML = "";

    if (imunizacoes.length === 0) {
        const mensagem = document.createElement("p");
        mensagem.textContent = "Não há imunizações cadastradas.";
        mensagem.className = "text-center";
        resultContainer.appendChild(mensagem);
        return;
    }

    const table = document.createElement("table");
    table.className = "table table-striped table-center";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Vacina</th>
            <th>Dose</th>
            <th>Data de Aplicação</th>
            <th>Fabricante</th>
            <th>Lote</th>
            <th>Local de Aplicação</th>
            <th>Profissional Aplicador</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    imunizacoes.forEach(imunizacao => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${imunizacao.id}</td>
            <td>${imunizacao.nome}</td>
            <td>${imunizacao.vacina}</td>
            <td>${imunizacao.dose}</td>
            <td>${formatarData(imunizacao.dataAplicacao)}</td>
            <td>${imunizacao.fabricante}</td>
            <td>${imunizacao.lote}</td>
            <td>${imunizacao.localAplicacao}</td>
            <td>${imunizacao.profissionalAplicador}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultContainer.appendChild(table);
}

async function cadastrarPaciente() {
    const pacienteData = obterDadosPaciente();
    if (!pacienteData) {
        return;
    }

    try {
        const response = await fetch(url + "/paciente/inserir", {
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

        exibirToast(data.message || "Cadastro realizado com sucesso!");

        const modalCadastroPaciente = bootstrap.Modal.getInstance(document.getElementById("modalCadastroPaciente"));
        if (modalCadastroPaciente) {
            modalCadastroPaciente.hide();
        }

    } catch (error) {
        console.error("Erro ao cadastrar paciente:", error);
        exibirToast(`Erro ao cadastrar paciente: ${error.message}`);
    }
}

function obterDadosPaciente() {
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const sexo = document.getElementById("sexo").value;
    const dataNascimento = document.getElementById("data").value;

    if (!nome || !cpf || !sexo || !dataNascimento) {
        exibirToast("Todos os campos devem estar preenchidos.");
        return null;
    }

    const cpfNumeros = cpf.replace(/\D/g, "");
    if (cpfNumeros.length !== 11 || isNaN(cpfNumeros)) {
        exibirToast("O CPF deve conter exatamente 11 números.");
        return null;
    }

    const dataNasc = new Date(dataNascimento);
    const dataAtual = new Date();
    if (dataNasc > dataAtual) {
        exibirToast("A data de nascimento não pode estar no futuro.");
        return null;
    }

    const dia = String(dataNasc.getDate()).padStart(2, '0');
    const mes = String(dataNasc.getMonth() + 1).padStart(2, '0');
    const ano = dataNasc.getFullYear();
    const dataNascimentoFormatada = `${dia}-${mes}-${ano}`;

    return { nome, cpf: cpfNumeros, sexo, dataNascimento: dataNascimentoFormatada };
}

async function listarPacientes(id) {
    let urlConsulta = url + "/paciente/consultar";
    if (id) {
        urlConsulta += `/${id}`;
    }

    try {
        const response = await fetch(urlConsulta, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            mode: "cors"
        });

        if (!response.ok) {
            if (response.status === 500) {
                exibirMensagemNaoEncontrado();
                return;
            }
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        if (data.length === 0 || (id && !data.id)) {
            exibirMensagemNaoEncontrado();
        } else {
            exibirPacientes(data);
        }
    } catch (error) {
        console.error("Erro ao listar pacientes:", error);
        exibirMensagemNaoEncontrado();
    }
}

function exibirMensagemNaoEncontrado() {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";

    const mensagem = document.createElement("p");
    mensagem.textContent = "Não há pacientes cadastrados.";
    mensagem.className = "text-center";
    resultContainer.appendChild(mensagem);
}


function exibirPacientes(pacientes) {
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";

    if (!Array.isArray(pacientes)) {
        pacientes = [pacientes];
    }

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        pacientes.forEach(paciente => {
            const dataNascimentoFormatada = formatarData(paciente.dataNascimento);
            const cpfMascarado = mascararCPF(paciente.cpf);

            const card = document.createElement("div");
            card.className = "card mb-3";

            const cardBody = document.createElement("div");
            cardBody.className = "card-body";

            cardBody.innerHTML = `
                <h5 class="card-title">${paciente.nome}</h5>
                <p class="card-text"><strong>ID:</strong> ${paciente.id}</p>
                <p class="card-text"><strong>CPF:</strong> ${cpfMascarado}</p>
                <p class="card-text"><strong>Sexo:</strong> ${paciente.sexo}</p>
                <p class="card-text"><strong>Data de Nascimento:</strong> ${dataNascimentoFormatada}</p>
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="acoesDropdown${paciente.id}" data-bs-toggle="dropdown" aria-expanded="false">
                        Ações
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="acoesDropdown${paciente.id}">
                        <li><a class="dropdown-item" href="#" onclick="editarPaciente(${paciente.id})">Editar</a></li>
                        <li><a class="dropdown-item" href="#" onclick="confirmarExclusao(${paciente.id}, '${paciente.nome}')">Excluir</a></li>
                        <li><a class="dropdown-item" href="#" onclick="abrirModalCarteiraVacinal(${paciente.id})">Carteira Vacinal</a></li>
                    </ul>
                </div>
            `;

            card.appendChild(cardBody);
            resultContainer.appendChild(card);
        });
    } else {
        const table = document.createElement("table");
        table.className = "table table-striped table-responsive";

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
            const cpfMascarado = mascararCPF(paciente.cpf);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${paciente.id}</td>
                <td>${paciente.nome}</td>
                <td>${cpfMascarado}</td>
                <td>${paciente.sexo}</td>
                <td>${dataNascimentoFormatada}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="acoesDropdown${paciente.id}" data-bs-toggle="dropdown" aria-expanded="false">
                            Ações
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="acoesDropdown${paciente.id}">
                            <li><a class="dropdown-item" href="#" onclick="editarPaciente(${paciente.id})">Editar</a></li>
                            <li><a class="dropdown-item" href="#" onclick="confirmarExclusao(${paciente.id}, '${paciente.nome}')">Excluir</a></li>
                            <li><a class="dropdown-item" href="#" onclick="abrirModalCarteiraVacinal(${paciente.id})">Carteira Vacinal</a></li>
                        </ul>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        resultContainer.appendChild(table);
    }
}

function formatarData(data) {
    const [dia, mes, ano] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function exibirToast(mensagem) {
    const toastMensagem = document.getElementById("toastMensagem");
    if (!toastMensagem) {
        console.error("Elemento toastMensagem não encontrado no DOM.");
        return;
    }
    toastMensagem.textContent = mensagem;

    const toastGeneric = new bootstrap.Toast(document.getElementById("toastGeneric"));
    toastGeneric.show();
}

function formatarDataParaInput(data) {
    const [dia, mes, ano] = data.split("-");
    return `${ano}-${mes}-${dia}`;
}

function formatarDataParaInput(data) {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
}

function editarPaciente(id) {
    if (!document.getElementById("modalEditarPaciente")) {
        fetch("/components/modal_editar_paciente.html")
            .then(response => response.text())
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);
                carregarDadosPaciente(id);
                document.getElementById("editarCpf").addEventListener("input", mascararCPFInput);
            })
            .catch(error => {
                console.error("Erro ao carregar o modal de edição de paciente:", error);
                exibirToast(`Erro ao carregar o modal de edição de paciente: ${error.message}`);
            });
    } else {
        carregarDadosPaciente(id);
        document.getElementById("editarCpf").addEventListener("input", mascararCPFInput);
    }
}

function carregarDadosPaciente(id) {
    fetch(url + `/paciente/consultar/${id}`)
        .then(response => response.json())
        .then(paciente => {
            document.getElementById("editarNome").value = paciente.nome;
            document.getElementById("editarCpf").value = mascararCPF(paciente.cpf);
            document.getElementById("editarSexo").value = paciente.sexo;
            document.getElementById("editarData").value = formatarDataParaInput(paciente.dataNascimento);

            const btnEditarPaciente = document.getElementById("btnEditarPaciente");
            btnEditarPaciente.onclick = function() {
                atualizarPaciente(id);
            };

            const modalEditarPaciente = new bootstrap.Modal(document.getElementById("modalEditarPaciente"));
            modalEditarPaciente.show();
        })
        .catch(error => {
            console.error("Erro ao carregar os dados do paciente:", error);
            exibirToast(`Erro ao carregar os dados do paciente: ${error.message}`);
        });
}

async function atualizarPaciente(id) {
    const nome = document.getElementById("editarNome").value.trim();
    const cpf = document.getElementById("editarCpf").value.trim().replace(/\D/g, ''); // Remove a pontuação do CPF
    const sexo = document.getElementById("editarSexo").value;
    const dataNascimento = document.getElementById("editarData").value;

    const pacienteData = {
        nome,
        cpf,
        sexo,
        dataNascimento: formatarDataParaEnvio(dataNascimento)
    };

    try {
        const response = await fetch(url + `/paciente/alterar/${id}`, {
            method: "PUT",
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

        exibirToast(data.message || "Paciente atualizado com sucesso!");

        const modalEditarPaciente = bootstrap.Modal.getInstance(document.getElementById("modalEditarPaciente"));
        if (modalEditarPaciente) {
            modalEditarPaciente.hide();
        }

        listarPacientes();
    } catch (error) {
        console.error("Erro ao atualizar paciente:", error);
        exibirToast(`Erro ao atualizar paciente: ${error.message}`);
    }
}

function confirmarExclusaoTodasImunizacoes(id, nome) {
    const mensagemConfirmacaoImunizacoes = document.getElementById("mensagemConfirmacaoImunizacoes");
    mensagemConfirmacaoImunizacoes.textContent = `Tem certeza que deseja excluir todas as imunizações do paciente ${nome}?`;

    const btnConfirmarExclusaoImunizacoes = document.getElementById("btnConfirmarExclusaoImunizacoes");
    btnConfirmarExclusaoImunizacoes.onclick = function() {
        excluirTodasImunizacoes(id);
    };

    const modalConfirmarExclusaoImunizacoes = new bootstrap.Modal(document.getElementById("modalConfirmarExclusaoImunizacoes"));
    modalConfirmarExclusaoImunizacoes.show();
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
        const response = await fetch(`${url}/paciente/excluir/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json"
            },
            mode: "cors"
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                const modalConfirmarExclusao = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusao"));
                if (modalConfirmarExclusao) {
                    modalConfirmarExclusao.hide();
                }

                confirmarExclusaoImunizacoes(id);
                return;
            }
            throw new Error(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
        }

        exibirToast(data.message || "Paciente excluído com sucesso!");

        const modalConfirmarExclusao = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusao"));
        if (modalConfirmarExclusao) {
            modalConfirmarExclusao.hide();
        }

        listarPacientes();
    } catch (error) {
        console.error("Erro ao excluir paciente:", error);
        exibirToast(`Erro ao excluir paciente: ${error.message}`);
    }
}

function confirmarExclusaoImunizacoes(id) {
    const mensagemConfirmacaoImunizacoes = document.getElementById("mensagemConfirmacaoImunizacoes");
    mensagemConfirmacaoImunizacoes.textContent = `O paciente possui imunizações cadastradas. Deseja excluir todas as imunizações do paciente para poder excluí-lo?`;

    const btnConfirmarExclusaoImunizacoes = document.getElementById("btnConfirmarExclusaoImunizacoes");
    btnConfirmarExclusaoImunizacoes.onclick = async function() {
        try {
            const response = await fetch(`${url}/imunizacao/excluir/paciente/${id}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json"
                },
                mode: "cors"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro na API: ${response.status} - ${response.statusText}`);
            }

            exibirToast(data.message || "Imunizações excluídas com sucesso!");

            const modalConfirmarExclusaoImunizacoes = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarExclusaoImunizacoes"));
            if (modalConfirmarExclusaoImunizacoes) {
                modalConfirmarExclusaoImunizacoes.hide();
            }

            excluirPaciente(id);
        } catch (error) {
            console.error("Erro ao excluir imunizações do paciente:", error);
            exibirToast(`Erro ao excluir imunizações do paciente: ${error.message}`);
        }
    };

    const modalConfirmarExclusaoImunizacoes = new bootstrap.Modal(document.getElementById("modalConfirmarExclusaoImunizacoes"));
    modalConfirmarExclusaoImunizacoes.show();
}

async function obterEstatisticasPaciente(id) {
    const estatisticas = {};

    try {
        const responseAplicadas = await fetch(`${url}/estatisticas/imunizacoes/paciente/${id}`);
        const dataAplicadas = await responseAplicadas.json();
        estatisticas.quantidadeAplicadas = dataAplicadas.quantidade || 0;

        const responseProximas = await fetch(`${url}/estatisticas/proximas_imunizacoes/paciente/${id}`);
        const dataProximas = await responseProximas.json();
        estatisticas.quantidadeProximas = dataProximas.quantidade || 0;

        const responseAtrasadas = await fetch(`${url}/estatisticas/imunizacoes_atrasadas/paciente/${id}`);
        const dataAtrasadas = await responseAtrasadas.json();
        estatisticas.quantidadeAtrasadas = dataAtrasadas.quantidade || 0;

        const idadeEmMeses = calcularIdadeEmMeses(document.getElementById("carteiraDataNascimento").value);
        const responseRecomendadas = await fetch(`${url}/estatisticas/imunizacoes/idade_maior/${idadeEmMeses}`);
        const dataRecomendadas = await responseRecomendadas.json();
        estatisticas.quantidadeRecomendadas = dataRecomendadas.quantidade || 0;

        const responseNaoAplicaveis = await fetch(`${url}/estatisticas/vacinas/nao_aplicaveis/paciente/${id}`);
        const dataNaoAplicaveis = await responseNaoAplicaveis.json();
        estatisticas.quantidadeNaoAplicaveis = dataNaoAplicaveis.quantidade || 0;

    } catch (error) {
        console.error("Erro ao obter estatísticas do paciente:", error);
    }

    return estatisticas;
}

function calcularIdadeEmMeses(dataNascimento) {
    const [dia, mes, ano] = dataNascimento.split("/");
    const dataNasc = new Date(`${ano}-${mes}-${dia}`);
    const dataAtual = new Date();

    let idadeEmMeses = (dataAtual.getFullYear() - dataNasc.getFullYear()) * 12 + (dataAtual.getMonth() - dataNasc.getMonth());

    if (dataAtual.getDate() < dataNasc.getDate()) {
        idadeEmMeses--;
    }

    return idadeEmMeses;
}
function exibirEstatisticas(estatisticas) {
    document.getElementById("quantidadeAplicadas").textContent = estatisticas.quantidadeAplicadas;
    document.getElementById("quantidadeProximas").textContent = estatisticas.quantidadeProximas;
    document.getElementById("quantidadeAtrasadas").textContent = estatisticas.quantidadeAtrasadas;
    document.getElementById("quantidadeRecomendadas").textContent = estatisticas.quantidadeRecomendadas;
    document.getElementById("quantidadeNaoAplicaveis").textContent = estatisticas.quantidadeNaoAplicaveis;
}

function formatarDataParaEnvio(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}-${mes}-${ano}`;
}

function mascararCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function mascararCPFInput(event) {
    let input = event.target;
    input.value = input.value.replace(/\D/g, '');
    input.value = input.value.replace(/(\d{3})(\d)/, '$1.$2');
    input.value = input.value.replace(/(\d{3})(\d)/, '$1.$2');
    input.value = input.value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

