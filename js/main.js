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
