/* Filtros por categoría (páginas de Aplicaciones y Proveedores).
   Los botones llevan data-filtro="categoria" y los elementos a filtrar data-categoria="cat1 cat2". */
document.addEventListener("DOMContentLoaded", function () {
    var grupos = document.querySelectorAll("[data-filtros]");

    grupos.forEach(function (grupo) {
        var botones = grupo.querySelectorAll("[data-filtro]");
        var contenedor = document.querySelector(grupo.getAttribute("data-filtros"));
        var conteo = document.getElementById(grupo.getAttribute("data-conteo"));
        if (!contenedor) { return; }
        var elementos = contenedor.querySelectorAll("[data-categoria]");

        function aplicar(filtro) {
            var visibles = 0;
            elementos.forEach(function (el) {
                var categorias = el.getAttribute("data-categoria").split(" ");
                var mostrar = filtro === "todos" || categorias.indexOf(filtro) !== -1;
                el.hidden = !mostrar;
                if (mostrar) { visibles++; }
            });

            botones.forEach(function (b) {
                b.setAttribute("aria-pressed", String(b.getAttribute("data-filtro") === filtro));
            });

            if (conteo) {
                conteo.textContent = "Mostrando " + visibles + " de " + elementos.length + " elementos.";
            }
        }

        botones.forEach(function (b) {
            b.addEventListener("click", function () { aplicar(b.getAttribute("data-filtro")); });
        });

        aplicar("todos");
    });
});
