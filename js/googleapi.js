const CLIENT_ID = "724621201237-g8e7fokp08i17ean8bsf6pl7sttp1aks.apps.googleusercontent.com";
const API_KEY = "AIzaSyBQ5S-wfRMM429M9R5DkWEG7iN1qWQ9h5w";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

let usuarioLogado = null;
let tokenClient = null;
let gapiInicializado = false;
let gisInicializado = false;
let calendarAutorizado = false;
let accessTokenAtual = null;

window.addEventListener("load", () => {
    gapi.load("client", async () => {
        await inicializarGapiClient();
    });

    inicializarGIS();
});

async function inicializarGapiClient() {
    try {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC]
        });

        gapiInicializado = true;
        console.log("gapi pronta");
    } catch (error) {
        console.error("Erro ao inicializar gapi:", error);
    }
}

function inicializarGIS() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (resp) => {
            if (resp.error) {
                console.error(resp);
                alert("Erro ao autorizar o Google.");
                return;
            }

            accessTokenAtual = resp.access_token;
            calendarAutorizado = true;

            await carregarPerfilUsuario();
            alert("Login e Google Calendar conectados com sucesso!");
        }
    });

    gisInicializado = true;
    console.log("GIS pronto");
}

function loginEConectarCalendar() {
    if (!gisInicializado) {
        alert("Login do Google ainda não foi inicializado.");
        return;
    }

    tokenClient.requestAccessToken({ prompt: "consent" });
}

async function carregarPerfilUsuario() {
    try {
        const resposta = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessTokenAtual}`
            }
        });

        const user = await resposta.json();
        usuarioLogado = user;
        mostrarUsuario(user);
        console.log("Usuário logado:", user);
    } catch (error) {
        console.error("Erro ao carregar perfil do usuário:", error);
    }
}

function mostrarUsuario(user) {
    const div = document.getElementById("usuario");

    div.innerHTML = `
        <div class="usuario-box">
            <img src="${user.picture}" alt="Foto do usuário" width="60" height="60">
            <div class="usuario-info">
                <p><strong>${user.name}</strong></p>
                <p>${user.email}</p>
            </div>
        </div>
    `;
}

function garantirCalendarConectado() {
    if (!calendarAutorizado) {
        alert("Clique em 'Entrar com Google + Calendar' primeiro.");
        return false;
    }

    return true;
}

async function criarEventoNoCalendar(tarefa) {
    if (!garantirCalendarConectado()) {
        return null;
    }

    const evento = {
        summary: tarefa.nome,
        description: "Criado pelo app Lista de Tarefas",
        start: {
            dateTime: `${tarefa.data}T${tarefa.inicio}:00`,
            timeZone: "America/Sao_Paulo"
        },
        end: {
            dateTime: `${tarefa.data}T${tarefa.fim}:00`,
            timeZone: "America/Sao_Paulo"
        }
    };

    const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: evento
    });

    return response.result;
}