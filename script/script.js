!(function ($) {
  var defaults = {
    sectionContainer: "> section",
    angle: 50,
    opacity: true,
    scale: true,
    outAnimation: true,
    pageContainer: ".page_container",
    pageOpacity: true,
  };
  $.fn.tiltedpage_scroll = function (options) {
    var settings = $.extend({}, defaults, options),
      el = $(this);
    el.find(settings.sectionContainer).addClass("tps-section");
    el.find(".tps-section").each(function () {
      var el2 = $(this);
      el2.wrapInner("<div class='tps-wrapper'></div>");
    });

    function isElementInViewport(el3) {
      var docViewTop = $(window).scrollTop(),
        docViewBottom = docViewTop + $(window).height(),
        elemTop = el3.offset().top,
        elemBottom = elemTop + el3.outerHeight(true);
      return elemBottom >= docViewTop && elemTop <= docViewBottom;
    }

    function elementVisibilityMayChange(el4) {
      if (isElementInViewport(el4)) {
        el4.addClass("tps-inview");
      } else {
        el4.removeClass("tps-inview");
      }
    }
    $(window).on("DOMContentLoaded load resize scroll", function () {
      el.find(settings.sectionContainer).each(function () {
        elementVisibilityMayChange($(this));
      });
      el.find(".tps-section.tps-inview > .tps-wrapper").each(function (index) {
        var el2 = $(this),
          elc = el2.find(settings.pageContainer),
          opacity = 0,
          opacity2 = 0,
          st = $(window).scrollTop(),
          deg =
            ((el2.parent().offset().top - el2.parent().height() - st) /
              $(window).height()) *
            (settings.angle * 3),
          scale =
            (st +
              $(window).height() -
              (el2.parent().offset().top - el2.parent().height())) /
            $(window).height();
        if (scale > 1) scale = 1;
        if (deg < 0) deg = 0;
        if (st > el2.parent().offset().top) {
          if (settings.outAnimation == false) {
            opacity = 1;
            opacity2 = 1;
            if (opacity < 0) {
              opacity = 0;
              opacity2 = 0;
            }
            if (deg < 0) deg = 0;
          } else {
            opacity =
              (el2.parent().offset().top + $(window).height() * 1.2 - st) /
              $(window).height();
            opacity2 = opacity;
            opacity = Math.pow(opacity, 25);
            opacity2 = Math.pow(opacity2, 25);
            //console.log('- '+opacity2);
            deg =
              ((el2.parent().offset().top - st) / $(window).height()) *
              (settings.angle * 3);
            scale =
              (st + $(window).height() - el2.parent().offset().top) /
              $(window).height();
          }
        } else {
          if (index != 0) {
            opacity =
              (st +
                $(window).height() -
                el2.parent().offset().top +
                el2.height() / 2) /
              $(window).height();
            opacity2 = opacity / 2;
            opacity2 = opacity2 < 0.4 ? opacity2 / 2 : opacity2;
            //console.log(opacity2);
            if (opacity > 1) {
              opacity = 1;
              opacity2 = 1;
            }
          } else {
            opacity = 1;
            opacity2 = 1;
            deg = 0;
            scale = 1;
          }
        }
        if (settings.scale == false) scale = 1;
        if (settings.angle == false) deg = 0;
        if (settings.opacity == false) {
          opacity = 1;
          opacity2 = 1;
        }
        el2.css({
          transform:
            "rotateX(" + deg + "deg) scale(" + scale + ", " + scale + ")",
          opacity: opacity,
        });
        elc.css({ opacity: opacity2 });
      });
    });
  };
})(window.jQuery);

$(document).ready(function () {
  $(".main").tiltedpage_scroll({
    angle: 20,
  });
});

///producto agregar funciones de carrito

var productos = [];

function agregarProductos(id, producto, precio) {
  let indice = productos.findIndex((p) => p.id === id);

  if (indice === -1) {
    postJson({ id: id, producto: producto, precio: precio, cantidad: 1 });
  } else {
    productos[indice].cantidad++;
    putJson(productos[indice]);
  }

  console.log(productos);
  actualizarTabla();
}
//actualizar tabla
//actualizarTabla
function actualizarTabla() {
  let tbody = document.getElementById("tbody"); //enlazando al html

  let total = 0;
  tbody.innerHTML = "";
  for (let item of productos) {
    if (item.cantidad > 0) {
      // Verificar si la cantidad es mayor que 0
      let fila = tbody.insertRow();
      let celdaProducto = fila.insertCell(0);
      let celdaCantidad = fila.insertCell(1);
      let celdaPrecio = fila.insertCell(2);
      let celdaTotal = fila.insertCell(3);
      let celdaAcciones = fila.insertCell(4);

      celdaProducto.textContent = item.producto;
      celdaCantidad.textContent = item.cantidad;
      celdaPrecio.textContent = item.precio;
      celdaTotal.textContent = item.cantidad * item.precio;

      let boton = document.createElement("button");
      boton.textContent = "Eliminar";
      celdaAcciones.append(boton);
      boton.className = "btn btn-danger";
      boton.addEventListener("click", function () {
        ///agregar funcion
        deleteJson(item.id);
      });

      total = total + item.precio * item.cantidad;
    }
  }
  document.getElementById("total").textContent = total;
}

///guardar post
function postJson(data) {
  let url = "http://localhost:3000/carrito";
  fetch(url, {
    method: "POST", // or 'PUT'
    body: JSON.stringify(data), // data can be `string` or {object}!
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .catch((error) => console.error("Error:", error))
    .then((response) => {
      console.log("Success:", response);
      productos.push(response); // Añadir el nuevo producto al array de productos
      actualizarTabla(); // Actualizar la tabla después de agregar un nuevo producto
    });
}

//get cargar
async function getJson() {
  try {
    const response = await fetch("http://localhost:3000/carrito", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    console.log("Success:", result);
    productos = result;
    actualizarTabla();
  } catch (error) {
    console.log("Error", error);
  }
}

window.onload = function () {
  getJson();
};

//actualizar
async function putJson(data) {
  try {
    const response = await fetch(`http://localhost:3000/carrito/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("Success", result);

    // Actualizar solo el elemento modificado dentro del array productos
    const index = productos.findIndex((p) => p.id === data.id);
    if (index !== -1) {
      productos[index] = result;
      actualizarTabla();
    }
  } catch (error) {
    console.error("Error", error);
  }
}

//eliminar
async function deleteJson(id) {
  try {
    const response = await fetch(`http://localhost:3000/carrito/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    console.log("Success: ", result);

    // Buscar el índice del producto en el array de productos
    const index = productos.findIndex((p) => p.id === id);
    if (index !== -1) {
      // Si la cantidad es 0, eliminar el producto del array
      if (productos[index].cantidad <= 0) {
        productos.splice(index, 1);
      } else {
        // Reducir la cantidad en uno
        productos[index].cantidad--;
      }
      // Actualizar la tabla
      actualizarTabla();
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}
