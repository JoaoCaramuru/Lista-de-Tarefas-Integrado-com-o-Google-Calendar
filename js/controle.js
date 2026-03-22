let btnadd = document.getElementById("btnadd");
let campoNome = document.getElementById("input");
let campoData = document.getElementById("data");
let campoInicio = document.getElementById("inicio");
let campoFim = document.getElementById("fim");
let area = document.getElementById("area");
let campoLote = document.getElementById("tarefas-lote");

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let contador = tarefas.length > 0 ? Math.max(...tarefas.map(t => t.id)) : 0;

renderizarTarefas();

function salvarTarefas() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function formatarData(data) {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function criarHtmlTarefa(tarefa) {
    return `
        <div class="tarefa" id="tarefa-${tarefa.id}">
            <div class="tarefa-nome">
                <strong>${tarefa.nome}</strong>
            </div>

            <div class="tarefa-data">
                📅 ${formatarData(tarefa.data)}
            </div>

            <div class="tarefa-horario">
                ⏰ ${tarefa.inicio} até ${tarefa.fim}
            </div>

            <div class="tarefa-calendar">
                ${tarefa.calendarEventId ? "✅ Enviado ao Calendar" : "🕓 Pendente no Calendar"}
            </div>

            <div class="tarefa-botao">
                <button onclick="deletarTarefa(${tarefa.id})">Excluir</button>
            </div>
        </div>
    `;
}

function renderizarTarefas() {
    area.innerHTML = "";
    tarefas.forEach(tarefa => {
        area.innerHTML += criarHtmlTarefa(tarefa);
    });
}

function limparCampos() {
    campoNome.value = "";
    campoData.value = "";
    campoInicio.value = "";
    campoFim.value = "";
    campoFim.min = "";
    campoNome.focus();
}

function validarCampos(nome, data, inicio, fim) {
    if (!nome || !data || !inicio || !fim) {
        return "Preencha a tarefa, a data, a hora de início e a hora de fim.";
    }

    if (inicio >= fim) {
        return "O horário de início precisa ser menor que o horário de fim.";
    }

    return null;
}

function montarTarefa(nome, data, inicio, fim) {
    contador++;

    return {
        id: contador,
        nome,
        data,
        inicio,
        fim,
        usuario: typeof usuarioLogado !== "undefined" && usuarioLogado ? usuarioLogado.email : null,
        calendarEventId: null
    };
}

async function enviarTarefaParaCalendar(tarefa) {
    try {
        const eventoCriado = await criarEventoNoCalendar(tarefa);

        if (eventoCriado && eventoCriado.id) {
            tarefa.calendarEventId = eventoCriado.id;
        }
    } catch (error) {
        console.error("Erro ao criar evento no Calendar:", error);
        alert(`A tarefa "${tarefa.nome}" foi criada no site, mas não foi enviada ao Google Calendar.`);
    }
}

async function addTarefa() {
    const nome = campoNome.value.trim();
    const data = campoData.value;
    const inicio = campoInicio.value;
    const fim = campoFim.value;

    const erro = validarCampos(nome, data, inicio, fim);
    if (erro) {
        alert(erro);
        return;
    }

    const tarefa = montarTarefa(nome, data, inicio, fim);
    await enviarTarefaParaCalendar(tarefa);

    tarefas.push(tarefa);
    salvarTarefas();
    renderizarTarefas();
    limparCampos();
}

function deletarTarefa(id) {
    tarefas = tarefas.filter(tarefa => tarefa.id !== id);
    salvarTarefas();
    renderizarTarefas();
}

async function adicionarVariasTarefas() {
    const texto = campoLote.value.trim();

    if (!texto) {
        alert("Cole pelo menos uma tarefa no campo de várias tarefas.");
        return;
    }

    const linhas = texto.split("\n").map(l => l.trim()).filter(Boolean);
    let adicionadas = 0;
    let erros = [];

    for (let i = 0; i < linhas.length; i++) {
        const partes = linhas[i].split("|").map(p => p.trim());

        if (partes.length !== 4) {
            erros.push(`Linha ${i + 1}: use o formato Título | AAAA-MM-DD | HH:MM | HH:MM`);
            continue;
        }

        const [nome, data, inicio, fim] = partes;
        const erro = validarCampos(nome, data, inicio, fim);

        if (erro) {
            erros.push(`Linha ${i + 1}: ${erro}`);
            continue;
        }

        const tarefa = montarTarefa(nome, data, inicio, fim);
        tarefas.push(tarefa);
        adicionadas++;
    }

    salvarTarefas();
    renderizarTarefas();
    campoLote.value = "";

    if (erros.length > 0) {
        alert(`Adicionadas: ${adicionadas}\n\nErros:\n${erros.join("\n")}`);
        return;
    }

    alert(`${adicionadas} tarefas adicionadas com sucesso.`);
}

async function enviarTodasParaCalendar() {
    if (typeof garantirCalendarConectado === "function" && !garantirCalendarConectado()) {
        return;
    }

    const pendentes = tarefas.filter(tarefa => !tarefa.calendarEventId);

    if (pendentes.length === 0) {
        alert("Não há tarefas pendentes para enviar.");
        return;
    }

    let sucesso = 0;

    for (const tarefa of pendentes) {
        await enviarTarefaParaCalendar(tarefa);
        if (tarefa.calendarEventId) {
            sucesso++;
        }
    }

    salvarTarefas();
    renderizarTarefas();
    alert(`${sucesso} tarefa(s) enviada(s) ao Google Calendar.`);
}

campoNome.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        btnadd.click();
    }
});

campoInicio.addEventListener("change", function () {
    campoFim.min = this.value;

    if (campoFim.value && campoFim.value < this.value) {
        campoFim.value = "";
    }
});