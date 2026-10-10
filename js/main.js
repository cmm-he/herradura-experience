// Herradura Experience — menú móvil y formulario que abre WhatsApp
(function () {
  var WSP = '56990332870';

  // Menú móvil
  var boton = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (boton && nav) {
    boton.addEventListener('click', function () {
      var abierta = nav.classList.toggle('abierta');
      boton.setAttribute('aria-expanded', abierta);
      boton.setAttribute('aria-label', abierta ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = abierta ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('abierta')) boton.click();
    });
  }

  // "Arma tu clase": actividad, fecha, horario, personas (+ nivel si es kitesurf) → WhatsApp.
  var NOMBRES = { kitesurf: 'una clase de kitesurf', surf: 'una clase de surf', sup: 'una salida de stand up paddle', ebike: 'una salida privada en e-bike' };

  function fechaLarga(valor) {
    if (!valor) return '';
    var p = valor.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  }

  function hoyISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  document.querySelectorAll('[data-arma]').forEach(function (f) {
    var el = f.elements;
    var nivel = f.querySelector('[data-solo-kite]');
    var vista = f.querySelector('[data-arma-vista]');
    if (el.fecha) el.fecha.min = hoyISO();

    function mensaje() {
      var act = el.actividad.value;
      var partes = 'Hola, quiero reservar ' + NOMBRES[act];
      if (el.fecha.value) partes += ' el ' + fechaLarga(el.fecha.value);
      partes += ', ' + el.horario.value;
      var n = el.personas.value;
      partes += ', para ' + n + (n === '1' ? ' persona' : ' personas') + '.';
      if (act === 'kitesurf' && el.nivel.value) partes += ' Mi nivel: ' + el.nivel.value + '.';
      return partes;
    }

    var genericos = Array.prototype.map.call(el.horario.options, function (o) { return [o.textContent, o.value]; });

    function horas(desde, hasta) {
      var r = [];
      for (var h = desde; h <= hasta; h++) { var t = (h < 10 ? '0' : '') + h + ':00'; r.push([t, 'a las ' + t]); }
      return r;
    }
    // Confirmado por Carlos (10-oct-2026). Hora de inicio: kite 11–18 h (Puclaro), surf 9–16 h, SUP y e-bike 8–18 h.
    var HORARIOS = { kitesurf: horas(11, 17), surf: horas(9, 15), sup: horas(8, 17), ebike: horas(8, 17) };
    // SUP y e-bike: mínimo 2 personas.
    var MINIMO = { sup: 2, ebike: 2 };
    var personasBase = Array.prototype.map.call(el.personas.options, function (o) { return [o.textContent, o.value]; });

    function cargarPersonas() {
      var min = MINIMO[el.actividad.value] || 1;
      var previo = el.personas.value;
      el.personas.innerHTML = '';
      personasBase.forEach(function (o) { if (isNaN(+o[1]) || +o[1] >= min) el.personas.add(new Option(o[0], o[1])); });
      if (+previo >= min || isNaN(+previo)) el.personas.value = previo;
    }
    el.actividad.addEventListener('change', cargarPersonas);
    cargarPersonas();

    function cargarHorarios() {
      var lista = HORARIOS[el.actividad.value] || genericos;
      var previo = el.horario.value;
      el.horario.innerHTML = '';
      lista.forEach(function (h) { el.horario.add(new Option(h[0], h[1])); });
      if (lista.some(function (h) { return h[1] === previo; })) el.horario.value = previo;
    }

    el.actividad.addEventListener('change', cargarHorarios);
    cargarHorarios();

    function actualizar() {
      if (nivel) nivel.hidden = el.actividad.value !== 'kitesurf';
      if (vista) vista.textContent = mensaje();
    }

    f.addEventListener('change', actualizar);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      window.open('https://wa.me/' + WSP + '?text=' + encodeURIComponent(mensaje()), '_blank', 'noopener');
    });
    actualizar();
  });

  // Selector de nivel de kitesurf → recomendación y WhatsApp con el nivel.
  document.querySelectorAll('[data-niveles]').forEach(function (bloque) {
    var titulo = bloque.querySelector('[data-rec-titulo]');
    var texto = bloque.querySelector('[data-rec-texto]');
    var wsp = bloque.querySelector('[data-rec-wsp]');
    bloque.addEventListener('change', function (e) {
      var r = e.target;
      if (r.type !== 'radio') return;
      titulo.textContent = r.dataset.titulo;
      texto.textContent = r.dataset.texto;
      wsp.href = 'https://wa.me/' + WSP + '?text=' + encodeURIComponent('Hola, quiero clases de kitesurf. Mi nivel: ' + r.dataset.nivel + '.');
    });
  });

  // Formulario: arma el mensaje y abre WhatsApp. No envía datos a ningún servidor.
  var form = document.getElementById('form-reserva');
  if (!form) return;
  var actividad = form.elements.actividad;
  var campoNivel = document.getElementById('campo-nivel');

  function mostrarNivel() {
    var esKite = /kite|viaje/i.test(actividad.value);
    campoNivel.hidden = !esKite;
  }
  actividad.addEventListener('change', mostrarNivel);
  mostrarNivel();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = form.elements.nombre;
    if (!nombre.value.trim()) {
      nombre.focus();
      nombre.setAttribute('aria-invalid', 'true');
      return;
    }
    nombre.removeAttribute('aria-invalid');

    var lineas = [
      'Hola Herradura Experience, soy ' + nombre.value.trim() + '.',
      'Me interesa: ' + actividad.value + '.'
    ];
    if (!campoNivel.hidden) lineas.push('Mi nivel: ' + form.elements.nivel.value + '.');
    lineas.push('Personas: ' + (form.elements.personas.value || '1') + '.');
    if (form.elements.fecha.value) {
      var p = form.elements.fecha.value.split('-');
      lineas.push('Fecha tentativa: ' + p[2] + '-' + p[1] + '-' + p[0] + '.');
    }
    if (form.elements.mensaje.value.trim()) lineas.push(form.elements.mensaje.value.trim());

    window.open('https://wa.me/' + WSP + '?text=' + encodeURIComponent(lineas.join('\n')), '_blank', 'noopener');
  });
})();
