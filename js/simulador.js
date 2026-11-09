/* Simulador de costos en la nube (tarifas ilustrativas, no corresponden a ningún proveedor real). */
document.addEventListener("DOMContentLoaded", function () {
    var formulario = document.getElementById("formSimulador");
    if (!formulario) { return; }

    var selectServicio = document.getElementById("selectServicio");
    var inputHoras = document.getElementById("inputHoras");
    var inputInstancias = document.getElementById("inputInstancias");
    var inputAlmacenamiento = document.getElementById("inputAlmacenamiento");
    var resultadoDOM = document.getElementById("resultadoDOM");
    var btnLimpiar = document.getElementById("btnLimpiar");

    var TARIFAS = { IaaS: 0.05, PaaS: 0.12, SaaS: 0.25 }; // USD por instancia-hora
    var TARIFA_GB = 0.02;                                   // USD por GB al mes
    var MAX_HORAS = 744;                                    // horas de un mes de 31 días

    function dinero(n) {
        return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function crear(etiqueta, clase, texto) {
        var el = document.createElement(etiqueta);
        if (clase) { el.className = clase; }
        if (texto !== undefined) { el.textContent = texto; }
        return el;
    }

    function linea(rotulo, valor) {
        var div = crear("div", "ResLinea", rotulo + " ");
        div.appendChild(crear("strong", "", valor));
        return div;
    }

    function marcarInvalido(campo, invalido) {
        campo.classList.toggle("Invalido", invalido);
        if (invalido) { campo.setAttribute("aria-invalid", "true"); }
        else { campo.removeAttribute("aria-invalid"); }
    }

    function mostrarErrores(mensajes, primerCampo) {
        resultadoDOM.innerHTML = "";
        var tarjeta = crear("div", "TarjetaResultado Error");
        mensajes.forEach(function (m) { tarjeta.appendChild(crear("div", "ResError", "⚠️ " + m)); });
        resultadoDOM.appendChild(tarjeta);
        if (primerCampo) { primerCampo.focus(); }
    }

    function validar() {
        var errores = [];
        var primero = null;
        var horas = parseFloat(inputHoras.value);
        var instancias = parseInt(inputInstancias.value, 10);
        var gb = inputAlmacenamiento.value.trim() === "" ? 0 : parseFloat(inputAlmacenamiento.value);

        var horasMal = isNaN(horas) || horas <= 0 || horas > MAX_HORAS;
        var instMal = isNaN(instancias) || instancias < 1 || instancias > 100;
        var gbMal = isNaN(gb) || gb < 0 || gb > 100000;

        marcarInvalido(inputHoras, horasMal);
        marcarInvalido(inputInstancias, instMal);
        marcarInvalido(inputAlmacenamiento, gbMal);

        if (horasMal) { errores.push("Las horas deben ser un número mayor que 0 y de máximo " + MAX_HORAS + " (un mes)."); primero = primero || inputHoras; }
        if (instMal) { errores.push("Las instancias deben ser un número entero entre 1 y 100."); primero = primero || inputInstancias; }
        if (gbMal) { errores.push("El almacenamiento debe estar entre 0 y 100000 GB."); primero = primero || inputAlmacenamiento; }

        return { errores: errores, primero: primero, horas: horas, instancias: instancias, gb: gb };
    }

    function costoCompleto(servicio, horas, instancias, gb) {
        var computo = horas * instancias * TARIFAS[servicio];
        var almacenamiento = gb * TARIFA_GB;
        return { computo: computo, almacenamiento: almacenamiento, total: computo + almacenamiento };
    }

    function pintarResultado(servicio, d, c) {
        resultadoDOM.innerHTML = "";
        var tarjeta = crear("div", "TarjetaResultado Exito");
        tarjeta.appendChild(crear("div", "ResTitulo", "Resumen de estimación mensual"));
        tarjeta.appendChild(linea("Modelo:", servicio + " (" + dinero(TARIFAS[servicio]) + " por instancia-hora)"));
        tarjeta.appendChild(linea("Uso:", d.instancias + " instancia(s) × " + d.horas + " h"));
        tarjeta.appendChild(linea("Cómputo:", dinero(c.computo)));
        tarjeta.appendChild(linea("Almacenamiento:", dinero(c.almacenamiento) + " (" + d.gb + " GB)"));

        var pctComputo = c.total > 0 ? Math.round((c.computo / c.total) * 100) : 0;
        var barra = crear("div", "Barra");
        barra.setAttribute("role", "img");
        barra.setAttribute("aria-label", "Cómputo " + pctComputo + " por ciento, almacenamiento " + (100 - pctComputo) + " por ciento");
        var a = crear("div", "TramoA"); a.style.width = pctComputo + "%";
        var b = crear("div", "TramoB"); b.style.width = (100 - pctComputo) + "%";
        barra.appendChild(a); barra.appendChild(b);
        tarjeta.appendChild(barra);

        var leyenda = crear("div", "Leyenda");
        var l1 = crear("span", ""); l1.appendChild(Object.assign(document.createElement("i"), { style: "background:var(--acento)" })); l1.appendChild(document.createTextNode("Cómputo " + pctComputo + "%"));
        var l2 = crear("span", ""); l2.appendChild(Object.assign(document.createElement("i"), { style: "background:var(--acento-2)" })); l2.appendChild(document.createTextNode("Almacenamiento " + (100 - pctComputo) + "%"));
        leyenda.appendChild(l1); leyenda.appendChild(l2);
        tarjeta.appendChild(leyenda);

        tarjeta.appendChild(document.createElement("hr"));
        tarjeta.appendChild(crear("div", "ResTotal", "Costo total: " + dinero(c.total) + " USD"));
        resultadoDOM.appendChild(tarjeta);
    }

    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        var d = validar();
        if (d.errores.length) {
            mostrarErrores(d.errores, d.primero);
            return;
        }
        var servicio = selectServicio.value;
        pintarResultado(servicio, d, costoCompleto(servicio, d.horas, d.instancias, d.gb));
    });

    // Cada vez que el usuario corrige un campo se quita el aviso de error de ese campo
    [inputHoras, inputInstancias, inputAlmacenamiento].forEach(function (campo) {
        campo.addEventListener("input", function () { marcarInvalido(campo, false); });
    });

    // Deshacer: volver al estado inicial
    btnLimpiar.addEventListener("click", function () {
        formulario.reset();
        [inputHoras, inputInstancias, inputAlmacenamiento].forEach(function (c) { marcarInvalido(c, false); });
        resultadoDOM.innerHTML = "";
        inputHoras.focus();
    });
});
