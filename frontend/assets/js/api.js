/* =========================================================
   api.js
   Capa central de conexión entre Frontend y Backend
   Proyecto: Centro de Atención, Reclamos e Incidencias Claro
   Backend esperado: Python Flask
   Base de datos: SQL Server
========================================================= */

const API_BASE_URL = "http://localhost:5000/api";

/* =========================================================
   FUNCIÓN BASE PARA LLAMADAS AL BACKEND
========================================================= */

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers
      }
    });

    const contentType = response.headers.get("content-type");

    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null && (data.message || data.error)
          ? data.message || data.error
          : "Ocurrió un error en la solicitud al servidor.";

      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("Error de conexión con API:", error);
    throw error;
  }
}

/* =========================================================
   TOKEN Y SESIÓN
========================================================= */

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
}

function authHeaders() {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

function getUsuarioActual() {
  const usuario =
    localStorage.getItem("usuario") ||
    localStorage.getItem("usuarioActual");

  if (!usuario) {
    return null;
  }

  try {
    return JSON.parse(usuario);
  } catch {
    return null;
  }
}

function setSesion(data) {
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("authToken", data.token);
  }

  if (data.usuario) {
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));
  }
}

function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("usuario");
  localStorage.removeItem("usuarioActual");

  window.location.href = "../../login.html";
}

function logoutUsuario() {
  cerrarSesion();
}

function redirectByRole(rol) {
  const rutas = {
    Cliente: "pages/cliente/dashboard-cliente.html",
    Asesor: "pages/asesor/dashboard-asesor.html",
    Supervisor: "pages/supervisor/dashboard-supervisor.html",
    Administrador: "pages/admin/dashboard-admin.html"
  };

  window.location.href = rutas[rol] || "index.html";
}

/* =========================================================
   AUTENTICACIÓN
========================================================= */

async function loginUser(credentials) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  setSesion(response);
  return response;
}

async function loginUsuario(credentials) {
  return loginUser(credentials);
}

async function registrarUsuario(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

/* =========================================================
   CLIENTES
========================================================= */

async function getClienteById(clienteId) {
  return apiRequest(`/clientes/${clienteId}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function updateCliente(clienteId, data) {
  return apiRequest(`/clientes/${clienteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

/* =========================================================
   CASOS GENERALES
========================================================= */

async function crearCaso(data) {
  return apiRequest("/casos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function getCasosByCliente(clienteId) {
  return apiRequest(`/clientes/${clienteId}/casos`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function getCasoByCodigo(codigoCaso) {
  return apiRequest(`/casos/${codigoCaso}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function getDetalleCaso(codigoCaso) {
  return getCasoByCodigo(codigoCaso);
}

async function getHistorialCaso(codigoCaso) {
  return apiRequest(`/casos/${codigoCaso}/historial`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function consultarCasoRapido(data) {
  return apiRequest("/casos/consulta-rapida", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

async function cambiarEstadoCaso(codigoCaso, data) {
  return apiRequest(`/casos/${codigoCaso}/estado`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

/* =========================================================
   RECLAMOS
========================================================= */

async function createReclamo(formData) {
  return apiRequest("/reclamos", {
    method: "POST",
    headers: {
      ...authHeaders()
    },
    body: formData
  });
}

async function getReclamosByCliente(clienteId) {
  return apiRequest(`/clientes/${clienteId}/reclamos`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   INCIDENCIAS
========================================================= */

async function createIncidencia(formData) {
  return apiRequest("/incidencias", {
    method: "POST",
    headers: {
      ...authHeaders()
    },
    body: formData
  });
}

async function getIncidenciasByCliente(clienteId) {
  return apiRequest(`/clientes/${clienteId}/incidencias`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   EVIDENCIAS
========================================================= */

async function uploadEvidencia(formData) {
  return apiRequest("/evidencias", {
    method: "POST",
    headers: {
      ...authHeaders()
    },
    body: formData
  });
}

async function subirEvidenciaCaso(codigoCaso, formData) {
  return apiRequest(`/casos/${codigoCaso}/evidencias`, {
    method: "POST",
    headers: {
      ...authHeaders()
    },
    body: formData
  });
}

async function getEvidenciasByCaso(codigoCaso) {
  return apiRequest(`/casos/${codigoCaso}/evidencias`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   NOTIFICACIONES
========================================================= */

async function getNotificacionesByCliente(clienteId) {
  return apiRequest(`/clientes/${clienteId}/notificaciones`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function getNotificacionesCliente(clienteId) {
  return getNotificacionesByCliente(clienteId);
}

async function getNotificaciones(usuarioId) {
  return apiRequest(`/usuarios/${usuarioId}/notificaciones`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function marcarNotificacionLeida(notificacionId) {
  return apiRequest(`/notificaciones/${notificacionId}/leida`, {
    method: "PUT",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   CLIENTE - RESPUESTAS
========================================================= */

async function responderSolicitudCliente(codigoCaso, data) {
  return apiRequest(`/casos/${codigoCaso}/respuesta-cliente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

/* =========================================================
   ASESOR
========================================================= */

async function getDashboardAsesor(asesorId) {
  return apiRequest(`/asesores/${asesorId}/dashboard`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function getCasosByAsesor(asesorId) {
  return apiRequest(`/asesores/${asesorId}/casos`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function actualizarSeguimientoCaso(codigoCaso, data) {
  return apiRequest(`/casos/${codigoCaso}/seguimiento`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function resolverCaso(codigoCaso, data) {
  return apiRequest(`/casos/${codigoCaso}/resolver`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

/* =========================================================
   SUPERVISOR
========================================================= */

async function getDashboardSupervisor() {
  return apiRequest("/supervisor/dashboard", {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function getCasosPendientesClasificacion() {
  return apiRequest("/supervisor/casos/pendientes-clasificacion", {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function clasificarCaso(codigoCaso, data) {
  return apiRequest(`/supervisor/casos/${codigoCaso}/clasificar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function getCasosPendientesAsignacion() {
  return apiRequest("/supervisor/casos/pendientes-asignacion", {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function asignarCaso(codigoCaso, data) {
  return apiRequest(`/supervisor/casos/${codigoCaso}/asignar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function getMonitoreoSla(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/supervisor/monitoreo-sla${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function getDesempenoAsesores(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/supervisor/desempeno-asesores${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   ADMINISTRADOR - DASHBOARD
========================================================= */

async function getDashboardAdmin() {
  return apiRequest("/admin/dashboard", {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   ADMINISTRADOR - USUARIOS
========================================================= */

async function getUsuarios(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/admin/usuarios${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function createUsuario(data) {
  return apiRequest("/admin/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function updateUsuario(usuarioId, data) {
  return apiRequest(`/admin/usuarios/${usuarioId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function deleteUsuario(usuarioId) {
  return apiRequest(`/admin/usuarios/${usuarioId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   ADMINISTRADOR - ROLES
========================================================= */

async function getRoles(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/admin/roles${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function createRol(data) {
  return apiRequest("/admin/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function updateRol(rolId, data) {
  return apiRequest(`/admin/roles/${rolId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function deleteRol(rolId) {
  return apiRequest(`/admin/roles/${rolId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   ADMINISTRADOR - CATÁLOGOS
========================================================= */

async function getCatalogos(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/admin/catalogos${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function createCatalogo(data) {
  return apiRequest("/admin/catalogos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function updateCatalogo(catalogoId, data) {
  return apiRequest(`/admin/catalogos/${catalogoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function deleteCatalogo(catalogoId) {
  return apiRequest(`/admin/catalogos/${catalogoId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   ADMINISTRADOR - PARÁMETROS
========================================================= */

async function getParametros(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/admin/parametros${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function createParametro(data) {
  return apiRequest("/admin/parametros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function updateParametro(parametroId, data) {
  return apiRequest(`/admin/parametros/${parametroId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(data)
  });
}

async function deleteParametro(parametroId) {
  return apiRequest(`/admin/parametros/${parametroId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   ADMINISTRADOR - AUDITORÍA
========================================================= */

async function getAuditoria(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/admin/auditoria${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   REPORTES
========================================================= */

async function getReporteCasos(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/reportes/casos${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

async function exportarReporteCasos(params = {}) {
  const query = new URLSearchParams(params).toString();

  return apiRequest(`/reportes/casos/exportar${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: {
      ...authHeaders()
    }
  });
}

/* =========================================================
   COMPATIBILIDAD CON FUNCIONES ANTERIORES
   Estas funciones evitan que pantallas antiguas fallen
   si usan nombres previos.
========================================================= */

async function getCasosPendientes() {
  return getCasosPendientesClasificacion();
}

async function getReporteSla(params = {}) {
  return getMonitoreoSla(params);
}

async function getReporteDesempeno(params = {}) {
  return getDesempenoAsesores(params);
}

async function getNotificacionesUsuario(usuarioId) {
  return getNotificaciones(usuarioId);
}