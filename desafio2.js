const prompt = require('prompt-sync')()

class paciente{
  pacientes = []

  constructor(cpf,nome,data){
    this.cpf = cpf;
    this.nome = nome;
    this.data = data;
  }

  addPaciente(cpf,nome,data){
    this.cpf = cpf;
    this.nome = nome;
    this.data = data;

    this.pacientes.push(this.cpf,this.nome,this.data);
    
    console.log("Paciente adicionado com sucesso!");
  }

  removePaciente(cpf){
    const index = this.pacientes.find()
  }
}

let opcao = 0;

do{
  console.log("1 - Cadastrar paciente");
  console.log("2 - Agenda");
  console.log("3 - Sair");

  opcao = prompt("Digite a opção desejada: ");

  switch(opcao){
    case "1":
      do{
        console.log("1 - Cadastrar novo paciente");
        console.log("2 - Excluir paciente");
        console.log("3 - Listar pacientes (ordenado por cpf)");
        console.log("4 - Listar pacientes (ordenado por nome)");
        console.log("5 - Voltar");
        opcao = prompt("Digite a opção desejada: ");

        switch(opcao){

          case '5':
            break;
        }

      }
      while(opcao != 5)
      break;
    case "2":
      do{
        console.log("1 - Agendar consulta");
        console.log("2 - Cancelar agendamento");
        console.log("3 - Listar agenda ");
        console.log("4 - Voltar");

        opcao = prompt("Digite a opção desejada: ");

        switch(opcao){
          case '4':
            break;
        }

      }
      while(opcao != 4)
  }
} while(opcao != 3)
