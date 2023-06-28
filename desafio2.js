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



  formatarCpf(cpf){
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  adicionarData(data){
    var dataNascimentoParts = data.split("/");
    var dia = parseInt(dataNascimentoParts[0]);
    var mes = parseInt(dataNascimentoParts[1]) - 1; 
    var ano = parseInt(dataNascimentoParts[2]);
    var dataNascimentoObj = new Date(ano, mes, dia);
    var dataAtual = new Date();


    if (isNaN(dataNascimentoObj) || dataNascimentoObj >= dataAtual) {
      console.log("Erro: A data de nascimento deve estar no formato DD/MM/AAAA e ser anterior à data atual.");
      validarCliente()
      return;
    }
  
    var idade = calcularIdade(dataNascimentoObj, dataAtual);
    if (idade < 13) {
      console.log("Erro: O cliente deve ter um acompanhante.");
      validarCliente()
      return;
    }
  

  }

  formatarData(data){
    var dia = adicionarZeroEsquerda(data.getDate());
    var mes = adicionarZeroEsquerda(data.getMonth() + 1);
    var ano = data.getFullYear();
    return dia + "/" + mes + "/" + ano;
  }

  adicionarZeroEsquerda(valor) {
    return valor < 10 ? "0" + valor : valor;
  }  

  calcularIdade(dataNascimento, dataAtual) {
    var diffAnos = dataAtual.getFullYear() - dataNascimento.getFullYear();
    var diffMeses = dataAtual.getMonth() - dataNascimento.getMonth();
    var diffDias = dataAtual.getDate() - dataNascimento.getDate();
  
    if (diffMeses < 0 || (diffMeses === 0 && diffDias < 0)) {
      diffAnos--;
    }
  
    return diffAnos;
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
