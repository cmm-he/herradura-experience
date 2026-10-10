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
  var NOMBRES = { kitesurf: 'una clase de kitesurf', surf: 'una clase de surf', sup: 'una salida de stand up paddle', ebike: 'una ruta en e-bike' };

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
