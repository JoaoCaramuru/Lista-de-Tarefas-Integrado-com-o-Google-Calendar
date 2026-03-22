let btnadd = document.getElementById('btnadd');
var nome = document.getElementById('input');


function addTarefa(){
    var inicio = document.getElementById('inicio').value;
    var fim = document.getElementById('fim').value;
    var nome = document.getElementById('input').value;
    
    const tarefas = {
        name: nome,
        inicio: inicio,
        fim: fim
    }

    document.getElementById('tarefinha').innerHTML += `${tarefas.name} - ${tarefas.inicio} até ${tarefas.fim} <br>`;
}

