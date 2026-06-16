const API_URL = "/api/multimedia";

async function cargarElementos() {
  try {
    const res = await fetch(API_URL);
    const datos = await res.json();

    if (!res.ok) {
      alert("Error al cargar elementos: " + (datos.error || "Error desconocido"));
      return;
    }

    const galeria = document.getElementById("galeria");
    galeria.innerHTML = "";

    datos.forEach(item => {
      const tagsTexto = item.tags && item.tags.length > 0
        ? item.tags.join(", ")
        : "Sin etiquetas";

      galeria.innerHTML += `
        <div class="item">
          <img src="${item.imagenUrl}" alt="${item.titulo}">

          <div class="item-content">
            <h3>${item.titulo}</h3>
            <p>${item.descripcion || "Sin descripción"}</p>
            <p><b>Etiquetas:</b> ${tagsTexto}</p>

            <audio controls>
              <source src="${item.audioUrl}">
              Tu navegador no soporta audio.
            </audio>

            <div class="acciones">
              <button class="btn-editar" onclick="editarElemento('${item._id}')">
                Editar
              </button>

              <button class="btn-eliminar" onclick="eliminarElemento('${item._id}')">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;
    });

  } catch (error) {
    alert("Error al cargar elementos: " + error.message);
  }
}

document.getElementById("formMultimedia").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const id = document.getElementById("elementoId").value;

    let respuesta;
    let data;

    if (id) {
      const datos = {
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        tags: document.getElementById("tags").value
          ? document.getElementById("tags").value.split(",").map(t => t.trim())
          : []
      };

      respuesta = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      data = await respuesta.json();

    } else {
      const imagen = document.getElementById("imagen").files[0];
      const audio = document.getElementById("audio").files[0];

      if (!imagen || !audio) {
        alert("Debes seleccionar una imagen y un audio.");
        return;
      }

      const formData = new FormData();

      formData.append("titulo", document.getElementById("titulo").value);
      formData.append("descripcion", document.getElementById("descripcion").value);
      formData.append("tags", document.getElementById("tags").value);
      formData.append("imagen", imagen);
      formData.append("audio", audio);

      respuesta = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      data = await respuesta.json();
    }

    if (!respuesta.ok) {
      alert("Error al guardar: " + (data.error || "Error desconocido"));
      return;
    }

    alert(data.mensaje || "Elemento guardado correctamente");

    document.getElementById("formMultimedia").reset();
    document.getElementById("elementoId").value = "";
    document.getElementById("tituloFormulario").textContent = "Subir nuevo elemento";
    document.getElementById("btnGuardar").textContent = "Guardar en la Nube";

    cargarElementos();

  } catch (error) {
    alert("Error inesperado: " + error.message);
  }
});

async function editarElemento(id) {
  const res = await fetch(API_URL);
  const datos = await res.json();

  const item = datos.find(e => e._id === id);

  document.getElementById("elementoId").value = item._id;
  document.getElementById("titulo").value = item.titulo;
  document.getElementById("descripcion").value = item.descripcion;
  document.getElementById("tags").value = item.tags ? item.tags.join(", ") : "";

  document.getElementById("tituloFormulario").textContent = "Editar elemento";
  document.getElementById("btnGuardar").textContent = "Actualizar elemento";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function eliminarElemento(id) {
  if (confirm("¿Deseas eliminar este elemento?")) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error al eliminar: " + (data.error || "Error desconocido"));
      return;
    }

    alert(data.mensaje);
    cargarElementos();
  }
}

cargarElementos();