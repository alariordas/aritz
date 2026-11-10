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
  var nombre = String(destino).trim();
  if (nombre === "") {
    return { creada: false, mensaje: "El destino es obligatorio", expedicion: null };
  }
  var capacidad = Number(capacidadMaxima);
  if (isNaN(capacidad) || capacidad <= 0) {
    return { creada: false, mensaje: "La capacidad debe ser mayor que cero", expedicion: null };
  }
  var consumo = Number(consumoBase);
  if (isNaN(consumo) || consumo <= 0) {
    return { creada: false, mensaje: "El consumo base debe ser mayor que cero", expedicion: null };
  }
  var id = 1;
  for (var i = 0; i < expediciones.length; i++) {
    if (expediciones[i].id >= id) {
      id = expediciones[i].id + 1;
    }
  }
  var expedicion = {
    id: id,
    destino: nombre,
    capacidadMaxima: capacidad,
    consumoBase: consumo,
    paquetes: [],
    estado: "preparando"
  };
  return { creada: true, mensaje: "Expedición creada correctamente", expedicion: expedicion };
}

function validarPaquete(expedicion, nuevoPaquete) {
  if (expedicion.estado !== "preparando") {
    return { valido: false, mensaje: "Solo se pueden añadir paquetes a una expedición en preparación" };
  }
  var codigo = String(nuevoPaquete.codigo).trim();
  if (codigo === "") {
    return { valido: false, mensaje: "El código es obligatorio" };
  }
  var peso = Number(nuevoPaquete.peso);
  if (isNaN(peso) || peso <= 0) {
    return { valido: false, mensaje: "El peso debe ser mayor que cero" };
  }
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    if (expedicion.paquetes[i].codigo.trim().toLowerCase() === codigo.toLowerCase()) {
      return { valido: false, mensaje: "El código ya existe" };
    }
  }
  var total = calcularPesoTotal(expedicion.paquetes) + peso;
  if (total > expedicion.capacidadMaxima) {
    return { valido: false, mensaje: "Se supera la capacidad máxima" };
  }
  return { valido: true, mensaje: "Paquete válido" };
}

function calcularCoste(expedicion) {
  var peso = calcularPesoTotal(expedicion.paquetes);
  var urgentes = 0;
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    if (expedicion.paquetes[i].urgente === true) {
      urgentes = urgentes + 1;
    }
  }
  var subtotal = expedicion.consumoBase * 2 + peso * 0.5 + urgentes * 3;
  if (peso > expedicion.capacidadMaxima * 0.8) {
    subtotal = subtotal + subtotal * 0.15;
  }
  return Math.round(subtotal * 100) / 100;
}

function obtenerSiguienteEstado(expedicion) {
  if (expedicion.estado === "preparando") {
    if (expedicion.paquetes.length === 0) {
      return { cambiado: false, nuevoEstado: "preparando", mensaje: "No se puede iniciar una expedición vacía" };
    }
    return { cambiado: true, nuevoEstado: "en ruta", mensaje: "La expedición está en ruta" };
  }
  if (expedicion.estado === "en ruta") {
    return { cambiado: true, nuevoEstado: "entregada", mensaje: "La expedición ha sido entregada" };
  }
  return { cambiado: false, nuevoEstado: "entregada", mensaje: "La expedición ya está entregada" };
}

function generarResumen(expedicion) {
  var pesoTotal = calcularPesoTotal(expedicion.paquetes);
  var urgentes = 0;
  var masPesado = null;
  var pesoMaximo = -1;
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    var paquete = expedicion.paquetes[i];
    if (paquete.urgente === true) {
      urgentes = urgentes + 1;
    }
    if (Number(paquete.peso) > pesoMaximo) {
      pesoMaximo = Number(paquete.peso);
      masPesado = paquete.codigo;
    }
  }
  var ocupacion = 0;
  if (expedicion.capacidadMaxima > 0) {
    ocupacion = Math.round(pesoTotal / expedicion.capacidadMaxima * 10000) / 100;
  }
  return {
    totalPaquetes: expedicion.paquetes.length,
    pesoTotal: pesoTotal,
    paquetesUrgentes: urgentes,
    paqueteMasPesado: masPesado,
    porcentajeOcupacion: ocupacion
  };
}

var expediciones = [];
var seleccionada = null;
var contadorMensaje = null;

function copiarIniciales() {
  return JSON.parse(JSON.stringify(expedicionesIniciales));
}

function guardarDatos() {
  localStorage.setItem("expediciones", JSON.stringify(expediciones));
}

function cargarDatos() {
  var texto = localStorage.getItem("expediciones");
  if (texto != null) {
    expediciones = JSON.parse(texto);
  } else {
    expediciones = copiarIniciales();
  }
  if (expediciones.length === 0) {
    expediciones = copiarIniciales();
  }
}

function buscarSeleccionada() {
  for (var i = 0; i < expediciones.length; i++) {
    if (expediciones[i].id === seleccionada) {
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
    html = html + "<option value='" + expediciones[i].id + "'>" + expediciones[i].destino + " - " + expediciones[i].estado + "</option>";
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
  html = html + "<span class='dato'>Destino: " + expedicion.destino + "</span>";
  html = html + "<span class='dato'>Estado: " + expedicion.estado + "</span>";
  html = html + "<span class='dato'>Paquetes: " + expedicion.paquetes.length + "</span>";
  html = html + "<span class='dato'>Peso: " + peso.toFixed(2) + " / " + expedicion.capacidadMaxima + " kg</span>";
  html = html + "<span class='dato'>Consumo: " + expedicion.consumoBase + "</span>";
  caja.innerHTML = html;
}

function dibujarPaquetes() {
  var caja = document.getElementById("listaPaquetes");
  var expedicion = buscarSeleccionada();
  if (expedicion == null || expedicion.paquetes.length === 0) {
    caja.innerHTML = "<p class='vacio'>No hay paquetes en esta expedición.</p>";
    return;
  }
  var html = "";
  for (var i = 0; i < expedicion.paquetes.length; i++) {
    var paquete = expedicion.paquetes[i];
    var clase = "paquete";
    if (paquete.urgente === true) {
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

function dibujarBotonPaquete() {
  var expedicion = buscarSeleccionada();
  var boton = document.getElementById("btnAnadirPaquete");
  if (expedicion == null || expedicion.estado !== "preparando") {
    boton.disabled = true;
  } else {
    boton.disabled = false;
  }
}

function dibujarTodo() {
  dibujarSelect();
  dibujarDatos();
  dibujarPaquetes();
  dibujarBotonPaquete();
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
    document.getElementById("avisoPaquetes").innerHTML = "";
    dibujarTodo();
  };

  document.getElementById("btnCrearExpedicion").onclick = function () {
    var destino = document.getElementById("destinoExpedicion").value;
    var capacidad = document.getElementById("capacidadExpedicion").value;
    var consumo = document.getElementById("consumoExpedicion").value;
    var resultado = crearExpedicion(expediciones, destino, capacidad, consumo);
    if (resultado.creada === false) {
      mostrarAviso(resultado.mensaje, true);
      return;
    }
    expediciones.push(resultado.expedicion);
    seleccionada = resultado.expedicion.id;
    guardarDatos();
    document.getElementById("destinoExpedicion").value = "";
    document.getElementById("capacidadExpedicion").value = "";
    document.getElementById("consumoExpedicion").value = "";
    dibujarTodo();
    mostrarAviso(resultado.mensaje, false);
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
    var resultado = validarPaquete(expedicion, nuevo);
    if (resultado.valido === false) {
      document.getElementById("avisoPaquetes").innerHTML = resultado.mensaje;
      mostrarAviso(resultado.mensaje, true);
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
    mostrarAviso(resultado.mensaje, false);
  };

  document.getElementById("btnCalcularCoste").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("No hay expedición seleccionada", true);
      return;
    }
    var coste = calcularCoste(expedicion);
    document.getElementById("resultadoExpedicion").innerHTML = "Coste de la expedición: " + coste.toFixed(2).replace(".", ",") + " €";
  };

  document.getElementById("btnGenerarResumen").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("No hay expedición seleccionada", true);
      return;
    }
    var resumen = generarResumen(expedicion);
    var pesado = "ninguno";
    if (resumen.paqueteMasPesado != null) {
      pesado = resumen.paqueteMasPesado;
    }
    var html = "";
    html = html + "Paquetes: " + resumen.totalPaquetes + "<br>";
    html = html + "Peso total: " + resumen.pesoTotal + " kg<br>";
    html = html + "Urgentes: " + resumen.paquetesUrgentes + "<br>";
    html = html + "Paquete más pesado: " + pesado + "<br>";
    html = html + "Ocupación: " + resumen.porcentajeOcupacion + " %";
    document.getElementById("resultadoExpedicion").innerHTML = html;
  };

  document.getElementById("btnAvanzarEstado").onclick = function () {
    var expedicion = buscarSeleccionada();
    if (expedicion == null) {
      mostrarAviso("No hay expedición seleccionada", true);
      return;
    }
    var resultado = obtenerSiguienteEstado(expedicion);
    if (resultado.cambiado === true) {
      expedicion.estado = resultado.nuevoEstado;
      guardarDatos();
    }
    dibujarTodo();
    mostrarAviso(resultado.mensaje, resultado.cambiado === false);
  };

  document.getElementById("btnRestablecer").onclick = function () {
    localStorage.removeItem("expediciones");
    expediciones = copiarIniciales();
    seleccionada = expediciones[0].id;
    document.getElementById("resultadoExpedicion").innerHTML = "";
    document.getElementById("avisoPaquetes").innerHTML = "";
    dibujarTodo();
    mostrarAviso("Datos restablecidos", false);
  };
};
