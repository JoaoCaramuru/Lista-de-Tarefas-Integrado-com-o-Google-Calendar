

let contador = 0;
let input = document.getElementById("input");
let btnadd = document.getElementById("btnadd");
let main = document.getElementById("area");
const tarefas = [];
function addTarefa(){
    let valorInput = input.value;
    let inicio = document.getElementById('inicio').value;
    let fim = document.getElementById('fim').value;

    if(valorInput !== "" && inicio !== "" && fim !== ""){
        contador++;

        let novaTarefa = 
       `<div id="${contador}" class="tarefa">
            <div onclick="marcartarefa(${contador})" class="tarefa-icone">
                <span id="icone_${contador}" class="material-icons">
                    circle
                </span> 
            </div>

            <div onclick="marcartarefa(${contador})" class="tarefa-nome">
                ${valorInput}
            </div>

            <div class="tarefa-inicio">
                🕒 ${inicio}
            </div>

            <div class="tarefa-fim">
                ⏰ ${fim}
            </div>

            <div class="tarefa-botao">
                <button onclick="deletar(${contador})">
                    <span class="material-icons">delete</span>
                    Deletar
                </button>
            </div>
        </div>`;

        main.innerHTML += novaTarefa;

        input.value = "";
        input.focus();
    } else {
        alert("Preencha tudo!");
    }

   

    if(valorInput && inicio && fim){

        const tarefa = {
            nome: valorInput,
            inicio: inicio,
            fim: fim
        };

        tarefas.push(tarefa);

        console.log(tarefas); // 👈 aqui você já tem tudo organizado
    }
}


input.addEventListener("keyup", function (event){
    if (event.keyCode === 13){
        event.preventDefault();
        btnadd.click();
    }
})


function deletar(id){
    var tarefa = document.getElementById(id)
    tarefa.remove();

}

function marcartarefa(id){
    var item = document.getElementById(id);
    var classe = item.getAttribute('class')
    console.log(classe)
    if(classe=="tarefa"){
        

        
        item.classList.replace('tarefa', 'tarefa-feito')
        
    }
    else{
        item.classList.replace('tarefa-feito', 'tarefa')
    }
   

}


