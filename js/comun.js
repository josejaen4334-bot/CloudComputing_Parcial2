/* Funciones comunes: aparición de secciones al hacer scroll y botón "volver arriba". */

// Marca que JavaScript está activo (el CSS solo oculta las secciones .Reveal si hay JS)
document.documentElement.classList.add("js-listo");

document.addEventListener("DOMContentLoaded", function () {
    var btnSubir = document.getElementById("btnSubir");

    // ===== Aparición de secciones al hacer scroll =====
    var elementosReveal = document.querySelectorAll(".Reveal");
    if ("IntersectionObserver" in window) {
        var observador = new IntersectionObserver(function (entradas, obs) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("Visible");
                    obs.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.06 });
        elementosReveal.forEach(function (el) { observador.observe(el); });
    } else {
        elementosReveal.forEach(function (el) { el.classList.add("Visible"); });
    }

    // ===== Botón volver arriba =====
    if (btnSubir) {
        window.addEventListener("scroll", function () {
            btnSubir.classList.toggle("Visible", window.scrollY > 500);
        }, { passive: true });

        btnSubir.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
});
