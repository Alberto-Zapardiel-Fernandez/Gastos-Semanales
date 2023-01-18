/* Variables y selectores */
const formulario = document.querySelector('#agregar-gasto'),
  gastoListado = document.querySelector('#gastos ul');

/* Eventos */
eventListeners();
function eventListeners() {
  document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
  formulario.addEventListener('submit', agregarGasto);
}

/* Clases */
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }
  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
    this.calcularRestante();
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    /* Extraemos el valor */
    const { presupuesto, restante } = cantidad;
    /* Pintamos el HTML */
    document.querySelector('#total').textContent = presupuesto;
    document.querySelector('#restante').textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    /* Crear el div */
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('alert', 'text-center');

    if (tipo === 'error') {
      divMensaje.classList.add('alert-danger');
    } else {
      divMensaje.classList.add('alert-success');
    }
    divMensaje.textContent = mensaje;

    // Insertar en el html
    document.querySelector('.primario').insertBefore(divMensaje, formulario);
    /* Quitar el html */
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos) {
    this.limpiarHTML();
    /* Iterar sobre los gasto */
    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;
      /* Crear un li */
      const nuevoGasto = document.createElement('li');
      nuevoGasto.className =
        'list-group-item d-flex justify-content-between align-items-center';
      //nuevoGasto.setAttribute('data-id', id);
      /* Más correcto agregar el atributo así */
      nuevoGasto.dataset.id = id;

      /* Agregar el HTML */
      nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">€ ${cantidad}</span>`;

      /* Boton para borrar el gasto */
      const btnBorrar = document.createElement('button');
      btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
      btnBorrar.innerHTML = 'Borrar &times;';
      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };

      nuevoGasto.appendChild(btnBorrar);

      /* Agregar el html */
      gastoListado.appendChild(nuevoGasto);
    });
  }

  actualizarRestante(restante) {
    document.querySelector('#restante').textContent = restante;
  }

  comprobarPresupuesto(presupuestObj) {
    const { presupuesto, restante } = presupuestObj;

    const restanteDiv = document.querySelector('.restante');
    /* Comprobar 25% */
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove('alert-success', 'alert-warning');
      restanteDiv.classList.add('alert-danger');
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.add('alert-warning');
    } else {
      restanteDiv.classList.remove('alert-danger', 'alert-warning');
      restanteDiv.classList.add('alert-success');
    }

    /* Si el total es 0 o menor */
    if (restante <= 0) {
      ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
      formulario.querySelector('button[type="submit"]').disabled = true;
    } else {
      formulario.querySelector('button[type="submit"]').disabled = false;
    }
  }

  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }
}

/* Instanciar */
const ui = new UI();
let presupuesto;

/* Funciones */
function preguntarPresupuesto() {
  const presupuestoUsuario = Number(prompt('¿Cual es tu presupuesto?'));
  if (
    presupuestoUsuario === '' ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload();
  }
  presupuesto = new Presupuesto(presupuestoUsuario);
  ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e) {
  e.preventDefault();

  /* Leer datos del formulario */
  const nombre = document.querySelector('#gasto').value;
  const cantidad = Number(document.querySelector('#cantidad').value);

  /* Validar */
  if (nombre === '' || cantidad === '') {
    ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta('Cantidad no válida', 'error');
    return;
  }

  /* Agregando gasto */

  /* Generar un objeto gasto */
  const gasto = { nombre, cantidad, id: Date.now() };
  presupuesto.nuevoGasto(gasto);
  /* Mensaje todo bien */
  ui.imprimirAlerta('Gasto agregado correctamente');

  /* Imprimir lso gastos */
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuesto);

  /* Reiniciar el formulario */
  formulario.reset();
}

function eliminarGasto(id) {
  /* Elimina del array */
  presupuesto.eliminarGasto(id);
  // Elimina gastos del html
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuesto);
}
