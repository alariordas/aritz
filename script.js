const expedicionesIniciales = [
  {
    id: 1,
    destino: "Bilbao",
    capacidadMaxima: 20,
    consumoBase: 8,
    paquetes: [
      { codigo: "P01", peso: 6, urgente: true },
      { codigo: "P02", peso: 9, urgente: false }
    ],
    estado: "preparando"
  },
  {
    id: 2,
    destino: "Zaragoza",
    capacidadMaxima: 30,
    consumoBase: 11,
    paquetes: [],
    estado: "preparando"
  },
  {
    id: 3,
    destino: "Madrid",
    capacidadMaxima: 25,
    consumoBase: 10,
    paquetes: [
      { codigo: "P03", peso: 4, urgente: false },
      { codigo: "P04", peso: 7, urgente: true }
    ],
    estado: "en ruta"
  }
];

function calcularPesoTotal(paquetes) {
  var total = 0;
  for (var i = 0; i < paquetes.length; i++) {
    total = total + Number(paquetes[i].peso);
  }
  return total;
}

function crearExpedicion(expediciones, destino, capacidadMaxima, consumoBase) {
  var ultimoId = 0;
  for (var i = 0; i < expediciones.length; i++) {
    if (expediciones[i].id > ultimoId) {
      ultimoId = expediciones[i].id;
    }
  }
  var expedicion = {
    id: ultimoId + 1,
    destino: String(destino).trim(),
    capacidadMaxima: Number(capacidadMaxima),
    consumoBase: Number(consumoBase),
    paquetes: [],
    estado: "preparando"
  };
  expediciones.push(expedicion);
  return expedicion;
}

function validarPaquete(expedicion, nuevoPaquete) {
  var codigo = String(nuevoPaquete.codigo).trim();
  var peso = Number(nuevoPaquete.peso);
  if (codigo == "" || isNaN(peso) || peso <= 0) {
    return false;
  }
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    if (expedicion.paquetes[i].codigo.toLowerCase() == codigo.toLowerCase()) {
      return false;
    }
  }
  var total = calcularPesoTotal(expedicion.paquetes) + peso;
  if (total > expedicion.capacidadMaxima) {
    return false;
  }
  return true;
}

function calcularCoste(expedicion) {
  var peso = calcularPesoTotal(expedicion.paquetes);
  var coste = expedicion.consumoBase * 2 + peso * 1.25;
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    if (expedicion.paquetes[i].urgente == true) {
      coste = coste + 3;
    }
  }
  return Math.round(coste * 100) / 100;
}

function obtenerSiguienteEstado(expedicion) {
  if (expedicion.estado == "preparando") {
    return "en ruta";
  } else if (expedicion.estado == "en ruta") {
    return "entregado";
  } else {
    return "entregado";
  }
}

function generarResumen(expedicion) {
  var peso = calcularPesoTotal(expedicion.paquetes);
  var coste = calcularCoste(expedicion);
  var urgentes = 0;
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    if (expedicion.paquetes[i].urgente == true) {
      urgentes = urgentes + 1;
    }
  }
  var texto = "Expedición #" + expedicion.id + " a " + expedicion.destino + "\n";
  texto = texto + "Estado: " + expedicion.estado + "\n";
  texto = texto + "Paquetes: " + expedicion.paquetes.length + " (" + urgentes + " urgentes)\n";
  texto = texto + "Peso total: " + peso.toFixed(2) + " kg de " + expedicion.capacidadMaxima + " kg\n";
  texto = texto + "Coste estimado: " + coste.toFixed(2) + " €";
  return texto;
}

var expediciones = [];
var seleccionada = null;
var contadorMensaje = null;

function copiarIniciales() {
  return JSON.parse(JSON.stringify(expedicionesIniciales));
}

function guardarDatos() {
  localStorage.setItem("expedicionesDWEC", JSON.stringify(expediciones));
}

function cargarDatos() {
  var texto = localStorage.getItem("expedicionesDWEC");
  if (texto != null) {
    expediciones = JSON.parse(texto);
  } else {
    expediciones = copiarIniciales();
  }
  if (expediciones.length == 0) {
    expediciones = copiarIniciales();
  }
}

function buscarSeleccionada() {
  for (var i = 0; i < expediciones.length; i++) {
    if (expediciones[i].id == seleccionada) {
      return expediciones[i];
    }
  }
  return null;
}

function mostrarAviso(texto, error) {
  var caja = document.getElementById("mensaje");
  caja.innerHTML = texto;
  if (error) {
    caja.className = "mensaje visible error";
  } else {
    caja.className = "mensaje visible";
  }
  clearTimeout(contadorMensaje);
  contadorMensaje = setTimeout(function () {
    caja.className = "mensaje";
  }, 3000);
}

function dibujarSelect() {
  var select = document.getElementById("expedicionSelect");
  var html = "";
  for (var i = 0; i < expediciones.length; i++) {
    html = html + "<option value='" + expediciones[i].id + "'>#" + expediciones[i].id + " - " + expediciones[i].destino + "</option>";
  }
  select.innerHTML = html;
  if (seleccionada == null && expediciones.length > 0) {
    seleccionada = expediciones[0].id;
  }
  if (seleccionada != null) {
    select.value = seleccionada;
  }
}

function dibujarDatos() {
  var caja = document.getElementById("datosExpedicion");
  var expedicion = buscarSeleccionada();
  if (expedicion == null) {
    caja.innerHTML = "<span class='dato'>Sin expediciones</span>";
    return;
  }
  var peso = calcularPesoTotal(expedicion.paquetes);
  var html = "";
  html = html + "<span class='dato'>Estado: " + expedicion.estado + "</span>";
  html = html + "<span class='dato'>Paquetes: " + expedicion.paquetes.length + "</span>";
  html = html + "<span class='dato'>Peso: " + peso.toFixed(2) + " / " + expedicion.capacidadMaxima + " kg</span>";
  html = html + "<span class='dato'>Consumo: " + expedicion.consumoBase + "</span>";
  caja.innerHTML = html;
}

function dibujarPaquetes() {
  var caja = document.getElementById("listaPaquetes");
  var expedicion = buscarSeleccionada();
  if (expedicion == null || expedicion.paquetes.length == 0) {
    caja.innerHTML = "<p class='vacio'>No hay paquetes en esta expedición.</p>";
    return;
  }
  var html = "";
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    var paquete = expedicion.paquetes[i];
    var clase = "paquete";
    if (paquete.urgente == true) {
      clase = "paquete urgente";
    }
    html = html + "<div class='" + clase + "'>";
    html = html + "<strong>" + paquete.codigo + "</strong>";
    html = html + "<span>" + paquete.peso + " kg</span>";
    html = html + "<span>" + (paquete.urgente ? "urgente" : "normal") + "</span>";
    html = html + "</div>";
  }
  caja.innerHTML = html;
}

function dibujarTodo() {
  dibujarSelect();
  dibujarDatos();
  dibujarPaquetes();
}

window.onload = function () {
  cargarDatos();
  if (expediciones.length > 0) {
    seleccionada = expediciones[0].id;
  }
  dibujarTodo();

  document.getElementById("expedicionSelect").onchange = function () {
    seleccionada = Number(this.value);
    document.getElementById("resultadoExpedicion").innerHTML = "";
    dibujarTodo();
  };

  document.getElementById("btnCrearExpedicion").onclick = function () {
    var destino = document.getElementById("destinoExpedicion").value;
    var capacidad = document.getElementById("capacidadExpedicion").value;
    var consumo = document.getElementById("consumoExpedicion").value;
    if (destino.trim() == "" || capacidad == "" || Number(capacidad) <= 0 || consumo == "" || Number(consumo) <= 0) {
      mostrarAviso("Rellena bien el destino, la capacidad y el consumo", true);
      return;
    }
    var nueva = crearExpedicion(expediciones, destino, capacidad, consumo);
    seleccionada = nueva.id;
    guardarDatos();
    document.getElementById("destinoExpedicion").value = "";
    document.getElementById("capacidadExpedicion").value = "";
    document.getElementById("consumoExpedicion").value = "";
    dibujarTodo();
    mostrarAviso("Expedición #" + nueva.id + " creada", false);
  };

  document.getElementById("btnAnadirPaquete").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("Primero tienes que crear una expedición", true);
      return;
    }
    var codigo = document.getElementById("codigoPaquete").value;
    var peso = document.getElementById("pesoPaquete").value;
    var urgente = document.getElementById("urgentePaquete").checked;
    var nuevo = { codigo: codigo, peso: Number(peso), urgente: urgente };
    if (validarPaquete(expedicion, nuevo) == false) {
      document.getElementById("avisoPaquetes").innerHTML = "Ese paquete no se puede añadir";
      mostrarAviso("Revisa el código, el peso o la capacidad", true);
      return;
    }
    document.getElementById("avisoPaquetes").innerHTML = "";
    expedicion.paquetes.push({ codigo: codigo.trim(), peso: Number(peso), urgente: urgente });
    guardarDatos();
    document.getElementById("codigoPaquete").value = "";
    document.getElementById("pesoPaquete").value = "";
    document.getElementById("urgentePaquete").checked = false;
    dibujarDatos();
    dibujarPaquetes();
    mostrarAviso("Paquete añadido", false);
  };

  document.getElementById("btnCalcularCoste").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("No hay expedición seleccionada", true);
      return;
    }
    var coste = calcularCoste(expedicion);
    document.getElementById("resultadoExpedicion").innerHTML = "Coste de la expedición #" + expedicion.id + ": " + coste.toFixed(2) + " €";
  };

  document.getElementById("btnGenerarResumen").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("No hay expedición seleccionada", true);
      return;
    }
    document.getElementById("resultadoExpedicion").innerHTML = generarResumen(expedicion);
  };

  document.getElementById("btnAvanzarEstado").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("No hay expedición seleccionada", true);
      return;
    }
    if (expedicion.estado == "entregado") {
      mostrarAviso("Esta expedición ya está entregada", true);
      return;
    }
    expedicion.estado = obtenerSiguienteEstado(expedicion);
    guardarDatos();
    dibujarDatos();
    mostrarAviso("La expedición ahora está: " + expedicion.estado, false);
  };

  document.getElementById("btnRestablecer").onclick = function () {
    localStorage.removeItem("expedicionesDWEC");
    expediciones = copiarIniciales();
    seleccionada = expediciones[0].id;
    document.getElementById("resultadoExpedicion").innerHTML = "";
    document.getElementById("avisoPaquetes").innerHTML = "";
    dibujarTodo();
    mostrarAviso("Datos restablecidos", false);
  };
};
