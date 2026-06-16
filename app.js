const API_URL = "/api/multimedia";

async function cargarElementos() {
  const res = await fetch(API_URL);
  const datos = await res.json();

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
}

document.getElementById("formMultimedia").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("elementoId").value;

  if (id) {
    const datos = {
      titulo: document.getElementById("titulo").value,
      descripcion: document.getElementById("descripcion").value,
      tags: document.getElementById("tags").value
        ? document.getElementById("tags").value.split(",").map(t => t.trim())
        : []
    };

    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    });

  } else {
    const formData = new FormData();

    formData.append("titulo", document.getElementById("titulo").value);
    formData.append("descripcion", document.getElementById("descripcion").value);
    formData.append("tags", document.getElementById("tags").value);
    formData.append("imagen", document.getElementById("imagen").files[0]);
    formData.append("audio", document.getElementById("audio").files[0]);

    await fetch(API_URL, {
      method: "POST",
      body: formData
    });
  }

  document.getElementById("formMultimedia").reset();
  document.getElementById("elementoId").value = "";
  document.getElementById("tituloFormulario").textContent = "Subir nuevo elemento";
  document.getElementById("btnGuardar").textContent = "Guardar en la Nube";

  cargarElementos();
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
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    cargarElementos();
  }
}

cargarElementos();