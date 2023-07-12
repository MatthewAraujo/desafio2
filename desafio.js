import { format, parse, addMinutes, isAfter, isBefore } from 'date-fns';
import moment from 'moment/moment.js';
import PromptSync from 'prompt-sync';

const prompt = PromptSync({ sigint: true });

class Paciente {
  /**
   * Construtor da classe Paciente.
   * @param {string} cpf - O CPF do paciente.
   * @param {string} nome - O nome do paciente.
   * @param {string} data - A data de nascimento do paciente.
   */
  constructor(cpf, nome, data) {
    this.cpf = cpf;
    this.nome = nome;
    this.data = data;
  }

  /**
   * Formata o CPF adicionando pontos e traço.
   * @param {string} cpf - O CPF a ser formatado.
   * @returns {string} - O CPF formatado.
   */
  static formatarCpf(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Valida se um CPF é válido.
   * @param {string} cpf - O CPF a ser validado.
   * @returns {boolean} - True se o CPF for válido, False caso contrário.
   */
  static validarCpf(cpf) {
    const cpfFormatado = Paciente.formatarCpf(cpf);
    const cpfValido = cpfFormatado.match(/^[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}$/);
    if (cpfValido) {
      const cpfExistente = pacientes.find((paciente) => paciente.cpf === cpfFormatado);
      if (cpfExistente) {
        return false;
      }
      return true;
    }
    return false;
  }
  /**
   * Valida se um nome é válido.
   * @param {string} nome - O nome a ser validado.
   * @returns {boolean} - True se o nome for válido, False caso contrário.
   */
  static validarNome(nome) {
    return nome.length >= 5;
  }
   /**
   * Verifica se o paciente é menor de 13 anos.
   * @param {Date} dataFormatada - A data de nascimento do paciente formatada como objeto Date.
   * @returns {boolean} - True se o paciente for menor de 13 anos, False caso contrário.
   */
  static menorIdade(dataFormatada) {
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataFormatada.getFullYear();

    const aniversarioJaOcorreu =
      hoje.getMonth() > dataFormatada.getMonth() ||
      (hoje.getMonth() === dataFormatada.getMonth() && hoje.getDate() >= dataFormatada.getDate());

    if (!aniversarioJaOcorreu) {
      idade--;
    }

    return idade < 13;
  }

  /**
   * Valida se uma data de nascimento é válida.
   * @param {string} data - A data de nascimento a ser validada.
   * @returns {boolean} - True se a data for válida, False caso contrário.
   */
  static validarData(data) {
    if (data.length !== 10) {
      return false;
    }

    const dataFormatada = parse(data, 'dd/MM/yyyy', new Date());
    const dataFormatadaString = format(dataFormatada, 'dd/MM/yyyy');
    const dataValida = dataFormatadaString.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/);
    const idade = Paciente.menorIdade(dataFormatada);

    if (!dataValida || idade) {
      return false;
    }

    return true;
  }

  /**
   * Remove um paciente da lista de pacientes.
   * @param {string} cpf - O CPF do paciente a ser removido.
   * @returns {boolean|string} - True se o paciente for removido com sucesso, False caso contrário.
   */
  static removerPaciente(cpf) {
    const cpfFormatado = Paciente.formatarCpf(cpf);
    const index = pacientes.findIndex((paciente) => paciente.cpf === cpfFormatado);
    const possuiAgendamentoFuturo = Consultorio.verificarAgendamentoFuturo(cpfFormatado);
    const possuiAgendamentoPassado = Consultorio.verificarAgendamentoPassado(cpfFormatado);
    if(possuiAgendamentoFuturo){
      return false;
    }

    if (index != -1 && !possuiAgendamentoPassado) {
      pacientes.splice(index, 1);
      const cancelar = Consultorio.cancelarTodosAgendamentos(cpfFormatado);
      return 'Paciente removido com sucesso!';
    }

    return false;
  }

  /**
   * Valida os dados de um paciente.
   * @param {string} cpf - O CPF do paciente.
   * @param {string} nome - O nome do paciente.
   * @param {string} data - A data de nascimento do paciente.
   * @returns {boolean} - True se os dados do paciente forem válidos, False caso contrário.
   */
  static validarPaciente(cpf,nome,data){
    const cpfValido = Paciente.validarCpf(cpf);
    const nomeValido = Paciente.validarNome(nome);
    const dataValida = Paciente.validarData(data);

    if (cpfValido && nomeValido && dataValida) {
      return true;
    }

    return false;
  }

  /**
   * Adiciona um paciente à lista de pacientes.
   * @param {string} cpf - O CPF do paciente.
   * @param {string} nome - O nome do paciente.
   * @param {string} data - A data de nascimento do paciente.
   * @returns {boolean} - True se o paciente for adicionado com sucesso, False caso contrário.
   */
  static adicionarPaciente(cpf,nome,data){

    const pacienteValido = Paciente.validarPaciente(cpf,nome,data);

    if(pacienteValido){
      const cpfFormatado = Paciente.formatarCpf(cpf);
      const paciente = new Paciente(cpfFormatado, nome, data);
      pacientes.push(paciente);
      return true;
    }
  return false;
  }
  
}
class Consultorio {
  static agendamentos = [];

  /**
   * Lista os pacientes do consultório em ordem específica.
   * @param {string} tipo - O tipo de ordenação dos pacientes ('cpf' ou 'nome').
   * @returns {Array} - Um array de pacientes ordenados pelo tipo especificado.
   */
  static listarPacientes(tipo) {
    let pacientesOrdenados = [];

    switch (tipo) {
      case 'cpf':
        pacientesOrdenados = pacientes.sort((a, b) => a.cpf.localeCompare(b.cpf));
        break;
      case 'nome':
        pacientesOrdenados = pacientes.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      default:
        break;
    }

    return pacientesOrdenados;
  }

  /**
   * Adiciona um agendamento à lista de agendamentos.
   * @param {Object} agendamento - O objeto que representa o agendamento.
   */
  static adicionarAgendamento(agendamento) {
    Consultorio.agendamentos.push(agendamento);
  }

  /**
   * Lista os agendamentos do consultório de acordo com o tipo e período especificados.
   * @param {string} tipo - O tipo de listagem ('data' ou 'todos').
   * @param {string} dataInicial - A data inicial do período (no formato 'DD/MM/YYYY').
   * @param {string} dataFinal - A data final do período (no formato 'DD/MM/YYYY').
   * @returns {Array} - Um array de agendamentos de acordo com os parâmetros especificados.
   */
  static listarAgenda(tipo, dataInicial, dataFinal) {
    switch (tipo) {
      case 'data':
        if (dataInicial && dataFinal) {
          const inicio = moment(dataInicial, 'DD/MM/YYYY');
          const fim = moment(dataFinal, 'DD/MM/YYYY');
          
          const agendaPeriodo = Consultorio.agendamentos.filter(agendamentos => {
            const dataEvento = moment(agendamentos.data, 'DD/MM/YYYY');
            return dataEvento.isBetween(inicio, fim, null, '[]');
          });

          return agendaPeriodo;
        }
        break;
        
      case 'todos':
        const agenda = Consultorio.agendamentos.sort((a, b) => a.data - b.data);
        return agenda;
        break;
    }
  }

  /**
   * Cancela o agendamento de uma consulta para um paciente.
   * @param {string} cpf - O CPF do paciente.
   * @returns {boolean} - True se o agendamento for cancelado com sucesso, False caso contrário.
   */
  static cancelarAgendamento(cpf) {
    const cpfFormatado = Paciente.formatarCpf(cpf);
    const agendamento = Consultorio.verificarAgendamentoFuturo(cpfFormatado);
  
    if (agendamento) {
      const index = Consultorio.agendamentos.findIndex((consulta) => consulta.cpf === cpfFormatado);
      Consultorio.agendamentos.splice(index, 1);
      return true;
    }
  }

  /**
   * Cancela todos os agendamentos de um paciente.
   * @param {string} cpf - O CPF do paciente.
   * @returns {boolean} - True se todos os agendamentos forem cancelados com sucesso, False caso contrário.
   */
  static cancelarTodosAgendamentos(cpf) {
    const agendamentosDosPacientes = Consultorio.agendamentos.filter((consulta) => consulta.cpf === cpf);
    
    if (agendamentosDosPacientes.length == 0) {
      return false;
    }

    agendamentosDosPacientes.forEach((consulta) => {
      const index = Consultorio.agendamentos.findIndex((consulta) => consulta.cpf === cpf);
      Consultorio.agendamentos.splice(index, 1);
    });

    return true;
  }

  /**
   * Verifica se um paciente possui agendamentos futuros.
   * @param {string} cpf - O CPF do paciente.
   * @returns {boolean} - True se o paciente tiver agendamentos futuros, False caso contrário.
   */
  static verificarAgendamentoFuturo(cpf) {
    const agora = moment();
    return Consultorio.agendamentos.some((agendamento) => {
      const horaAgendamento = moment(agendamento.hora);
      return agendamento.cpf === cpf && horaAgendamento.isBefore(agora);
    });
  }

  /**
   * Verifica se um paciente possui agendamentos passados.
   * @param {string} cpf - O CPF do paciente.
   * @returns {boolean} - True se o paciente tiver agendamentos passados, False caso contrário.
   */
  static verificarAgendamentoPassado(cpf) {
    const agora = moment();
    return Consultorio.agendamentos.some((agendamento) => {
      const horaAgendamento = moment(agendamento.hora);
      return agendamento.cpf === cpf && horaAgendamento.isAfter(agora);
    });
  }

  /**
   * Verifica se um agendamento possui sobreposição de horários com outros agendamentos.
   * @param {string} dataConsulta - A data da consulta no formato 'DD/MM/YYYY'.
   * @param {string} horaInicial - A hora inicial da consulta no formato 'HHmm'.
   * @param {string} horaFinal - A hora final da consulta no formato 'HHmm'.
   * @returns {boolean} - True se houver sobreposição de horários, False caso contrário.
   */
  static verificarSobreposicaoHorarios(dataConsulta, horaInicial, horaFinal) {
    const novaData = moment(dataConsulta).set({
      hour: horaInicial.hours(),
      minute: horaInicial.minutes(),
    });
  
    const possuiSobreposicao = Consultorio.agendamentos.some((agendamento) => {
      const agendamentoDataHora = moment(agendamento.data).set({
        hour: moment(agendamento.hora).hours(),
        minute: moment(agendamento.hora).minutes(),
      });
  
      const mesmaDataHora = agendamentoDataHora.isSame(novaData);
  
      return mesmaDataHora;
    });
  
    return possuiSobreposicao;
  }

  /**
   * Verifica se um horário de consulta está fora do horário de expediente.
   * @param {moment} horaInicialFormatada - A hora inicial da consulta formatada com Moment.js.
   * @param {moment} horaFinalFormatada - A hora final da consulta formatada com Moment.js.
   * @returns {boolean} - True se o horário estiver fora do expediente, False caso contrário.
   */
  static horarioForaDoExpediente(horaInicialFormatada, horaFinalFormatada) {
    const horaInicioLimite = moment().set({ hour: 8, minute: 0 });
    const horaFimLimite = moment().set({ hour: 19, minute: 0 });

    if (horaInicialFormatada.isBefore(horaInicioLimite) || horaFinalFormatada.isAfter(horaFimLimite)) {
      return true;
    }

    return false;
  }

  /**
   * Valida se um horário de consulta está dentro dos parâmetros permitidos.
   * @param {moment} horaInicialFormatada - A hora inicial da consulta formatada com Moment.js.
   * @param {moment} horaFinalFormatada - A hora final da consulta formatada com Moment.js.
   * @returns {boolean} - True se o horário estiver fora dos parâmetros permitidos, False caso contrário.
   */
  static validarHorarioConsulta(horaInicialFormatada, horaFinalFormatada) {
    const minutosInicial = moment(horaInicialFormatada).minutes();
    const minutosFinal = moment(horaFinalFormatada).minutes();

    if (minutosInicial % 15 !== 0 || minutosFinal % 15 !== 0) {
      return true; 
    }

    return false; 
  }

  /**
   * Agenda uma consulta para um paciente.
   * @param {string} cpf - O CPF do paciente.
   * @param {string} dataConsulta - A data da consulta no formato 'DD/MM/YYYY'.
   * @param {string} horaFinal - A hora final da consulta no formato 'HHmm'.
   * @param {string} horaInicial - A hora inicial da consulta no formato 'HHmm'.
   * @returns {string} - Uma mensagem indicando o resultado do agendamento.
   */
  static agendarConsulta(cpf, dataConsulta, horaFinal, horaInicial) {
    const cpfFormatado = Paciente.formatarCpf(cpf);
    const pacienteExistente = pacientes.find((paciente) => paciente.cpf === cpfFormatado);
    
    if (horaInicial.length !== 4 || horaFinal.length !== 4) {
      return 'Formato inválido da hora.';
    }

    if (!pacienteExistente) {
      return 'CPF não encontrado no cadastro.';
    }

    const possuiAgendamentoFuturo = Consultorio.verificarAgendamentoFuturo(cpfFormatado);

    if (possuiAgendamentoFuturo) {
      return 'Paciente já possui um agendamento para o futuro.';
    }
  
    const dataConsultaFormatada = moment(dataConsulta, 'DD/MM/YYYY');
  
    if (!dataConsultaFormatada.isValid()) {
      return 'Formato inválido da data da consulta. Utilize o formato DD/MM/AAAA.';
    }
  
    const horaInicialFormatada = moment(horaInicial, 'HHmm');
  
    if (!horaInicialFormatada.isValid()) {
      return 'Formato inválido da hora inicial. Utilize o formato HHMM.';
    }
  
    const horaFinalFormatada = moment(horaFinal, 'HHmm');
  
    if (!horaFinalFormatada.isValid()) {
      return 'Formato inválido da hora final. Utilize o formato HHMM.';
    }
  
    const agora = moment();
  
    if (dataConsultaFormatada.isBefore(agora)) {
      return 'Data da consulta deve ser no futuro.';
    }
  
    if (horaFinalFormatada.isBefore(horaInicialFormatada)) {
      return 'Hora final deve ser maior do que a hora inicial.';
    }
  
    const horarioForaDoExpediente = Consultorio.horarioForaDoExpediente(horaInicialFormatada, horaFinalFormatada);

    if (horarioForaDoExpediente) {
      return 'Horário fora do expediente.';
    }

    const horarioForaDaHoraValida = Consultorio.validarHorarioConsulta(horaFinalFormatada, horaInicialFormatada);

    if (horarioForaDaHoraValida) {
      return 'Horário fora da hora válida.';
    }

    const possuiSobreposicao = Consultorio.verificarSobreposicaoHorarios(
      dataConsultaFormatada,
      horaInicialFormatada,
      horaFinalFormatada
    );
  
    if (possuiSobreposicao) {
      return 'Já existe um agendamento para esse horário.';
    }
  
    const duracao = Math.round(horaFinalFormatada.diff(horaInicialFormatada, 'minutes'));
    const consulta = {
      cpf: cpfFormatado,
      data: dataConsultaFormatada.toDate(),
      hora: horaInicialFormatada.toDate(),
      duracao,
    };
  
    Consultorio.adicionarAgendamento(consulta);
  
    return 'Consulta agendada com sucesso!';
  }
}

/**
 * Adiciona um novo paciente à lista de pacientes.
 * @returns {Object} - O objeto do paciente adicionado.
 */
function adicionarPaciente() {
  const cpf = prompt('Digite o CPF do paciente: ');
  const nome = prompt('Digite o nome do paciente: ');
  const data = prompt('Digite a data de nascimento do paciente (DD/MM/AAAA): ');

  const pacient = Paciente.adicionarPaciente(cpf, nome, data);

  return pacient;
}

/**
 * Remove um paciente da lista de pacientes.
 * @returns {string} - Uma mensagem indicando o resultado da remoção.
 */
function removerPaciente() {
  const cpf = prompt('Digite o CPF do paciente que deseja remover: ');
  
  const removido = Paciente.removerPaciente(cpf);

  if (removido) {
    return 'Paciente removido';
  }
  return 'CPF inválido ou paciente possui agendamentos futuros.';
}

/**
 * Lista os pacientes de acordo com o tipo de ordenação especificado.
 * @param {string} tipo - O tipo de ordenação dos pacientes ('cpf' ou 'nome').
 * @returns {Array} - Um array de pacientes ordenados pelo tipo especificado.
 */
function listarPacientes(tipo) {
  let pacientesOrdenados = [];

  switch (tipo) {
    case 'cpf':
      pacientesOrdenados = Consultorio.listarPacientes('cpf');
      console.log('--- Pacientes por CPF ---');
      if (pacientesOrdenados.length == 0) {
        console.log('Não há pacientes cadastrados');
      }
      pacientesOrdenados.forEach((paciente) => {
        console.log(`CPF: ${paciente.cpf} | Nome: ${paciente.nome} | Data de Nascimento: ${paciente.data}`);
      });
      break;
    case 'nome':
      pacientesOrdenados = Consultorio.listarPacientes('nome');
      console.log('--- Pacientes por Nome ---');
      if (pacientesOrdenados.length == 0) {
        console.log('Não há pacientes cadastrados');
      }
      pacientesOrdenados.forEach((paciente) => {
        console.log(`Nome: ${paciente.nome} | CPF: ${paciente.cpf} | Data de Nascimento: ${paciente.data}`);
      });
      break;
    default:
      break;
  }

  return pacientesOrdenados;
}
const pacientes = []
/**
 * Lista os agendamentos de acordo com o tipo especificado.
 * @param {string} tipo - O tipo de listagem ('data' ou 'todos').
 */
function listarAgenda(tipo) {
  let agenda = [];

  switch (tipo) {
    case 'data':
      const dataInicial = prompt('Digite a data inicial da agenda (DD/MM/AAAA): ');
      const dataFinal = prompt('Digite a data final da agenda (DD/MM/AAAA): ');
      agenda = Consultorio.listarAgenda('data', dataInicial, dataFinal);
      console.log('--- Agenda ---');
      if (agenda.length == 0) {
        console.log('Não há agendamentos para hoje');
      } else {
        agenda.forEach((consulta) => {
          const dataFormatada = format(consulta.data, 'dd/MM/yyyy');
          const horaInicialFormatada = format(consulta.hora, 'HH:mm');
          const horaFinalFormatada = format(addMinutes(consulta.hora, consulta.duracao), 'HH:mm');
          console.log(
            `CPF: ${consulta.cpf} | Data: ${dataFormatada} | Horário: ${horaInicialFormatada} - ${horaFinalFormatada}`
          );
        });
        console.log('--- Fim da Agenda ---');
      }
      break;
    case 'todos':
      agenda = Consultorio.listarAgenda('todos');
      console.log('--- Agenda ---');
      if (agenda.length == 0) {
        console.log('Não há agendamentos para hoje');
      } else {
        agenda.forEach((consulta) => {
          const dataFormatada = format(consulta.data, 'dd/MM/yyyy');
          const horaInicialFormatada = format(consulta.hora, 'HH:mm');
          const horaFinalFormatada = format(addMinutes(consulta.hora, consulta.duracao), 'HH:mm');
          console.log(
            `CPF: ${consulta.cpf} | Data: ${dataFormatada} | Horário: ${horaInicialFormatada} - ${horaFinalFormatada}`
          );
        });
        console.log('--- Fim da Agenda ---');
      }
      break;
  }
}

/**
 * Cancela o agendamento de uma consulta para um paciente.
 * @returns {boolean} - True se o agendamento for cancelado com sucesso, False caso contrário.
 */
function cancelarAgendamento() {
  const cpf = prompt('Digite o CPF do paciente que deseja cancelar o agendamento: ');

  const cancelar = Consultorio.cancelarAgendamento(cpf);

  if (!cancelar) {
    return false;
  }
  
  return true;
}

/**
 * Agenda uma consulta para um paciente.
 */
function agendarConsulta() {
  const cpf = prompt('Digite o CPF do paciente: ');
  const dataConsulta = prompt('Digite a data da consulta (DD/MM/AAAA): ');
  const horaInicial = prompt('Digite a hora inicial (HHMM): ');
  const horaFinal = prompt('Digite a hora final (HHMM): ');

  const agendarConsulta = Consultorio.agendarConsulta(cpf, dataConsulta, horaFinal, horaInicial);
  console.log(agendarConsulta);
}



let opcao = 0;
do {
  console.log('======= Consultório Médico =======');
  console.log('1. Cadastro de pacientes');
  console.log('2. Agenda');
  console.log('3. Sair');
  console.log('==================================');

  opcao = prompt('Selecione uma opção: ');

  switch (opcao) {
    case '1':
      do {
        console.log('1 - Cadatrar novo paciente');
      console.log('2 - Excluir Paciente');
      console.log('3 - Listar pacientes por CPF');
      console.log('4 - Listar pacientes por nome');
      console.log('5 - Voltar ao menu principal');

         opcao = prompt('Digite a opção desejada: ');

      switch (opcao) {
          case '1':
            const adicionado = adicionarPaciente();
            if (adicionado) {
              console.log('Paciente adicionado com sucesso!');
            } else {
              console.log('Dados inválidos. Não foi possível adicionar o paciente.');
            }
            break;
          case '2':
            const removido = removerPaciente();
            if (removido) {
              console.log(removido);
            } else {
              console.log(removido);
            }
            break;
          case '3':
            const pacientesCpf = listarPacientes('cpf');

            
            
            break;
          case '4':
            const pacientesNome = listarPacientes('nome');
           
            break;
            }
      } while (opcao !== '5');
      break;
    
    case '2':
      do{
        console.log('1 - Agendar consulta');
        console.log('2 - Cancelar agendamento');
        console.log('3 - Listar data agenda escolhida');
        console.log('4 - Listar toda escolhida')
        console.log('5 - Voltar ao menu principal');

        opcao = prompt('Digite a opção desejada: ');

        switch (opcao) {
          case '1':
            const agendado = agendarConsulta();
            if (agendado) {
              console.log('Consulta agendada com sucesso!');
            }
            break;
          case '2':
            const cancelar = cancelarAgendamento();

            if (cancelar) {
              console.log('Agendamento cancelado com sucesso!');
            } else {
              console.log('CPF inválido ou paciente não possui agendamentos futuros.');
            }
            break;
          case '3':
            const agenda = listarAgenda('data')
            
            break;

          case '4':
            const agendaToda = listarAgenda('todos');


        }
      }while(opcao !== '5')
      break;

    case '3':
      console.log('Saindo do programa...');
      process.exit();
      break;

    default:
      console.log('Opção inválida. Tente novamente.');
      break;
  }
} while (opcao !== '3');

