let zonas = false;
let zonas_dirty = false;
var getZonas = () => zonas;
var getZona = (id) => (zonas ? zonas.find((a) => a.id == id && a.cached) : null);
var isZonasDirty = () => zonas_dirty;
var setZona = (i) => {
  i.cached = true;
  if (!zonas) zonas = [];
  var ix = zonas.findIndex((a) => a.id == i.id);
  if (ix == -1) zonas.push(i);
  else zonas[ix] = i;
};
var setZonas = (z) => {
  zonas = z;
};
var setZonasDirty = (d = true) => {
  zonas_dirty = d;
};
var addZona = (i) => {
  zonas.push(i);
};
var setZonaAcompanante = (id, acompanante) => {
  if (zonas === false) {
    return;
  }

  var ix = zonas.findIndex((a) => a.id == id);
  if (ix == -1) return;
  zonas[ix].acompanante = acompanante;
};

let decanatos = false;
let decanatos_dirty = false;
var getDecanatos = () => decanatos;
var getDecanato = (id) =>
  decanatos ? decanatos.find((a) => a.id == id && a.cached) : null;
var isDecanatosDirty = () => decanatos_dirty;
var setDecanato = (i) => {
  i.cached = true;
  if (!decanatos) decanatos = [];
  var ix = decanatos.findIndex((a) => a.id == i.id);
  if (ix == -1) decanatos.push(i);
  else decanatos[ix] = i;
};
var setDecanatos = (d) => {
  decanatos = d;
};
var setDecanatosDirty = (d = true) => {
  decanatos_dirty = d;
};
var addDecanato = (i) => {
  decanatos.push(i);
};
var setDecanatoAcompanante = (id, acompanante) => {
  if (decanatos === false) {
    return;
  }

  var ix = decanatos.findIndex((a) => a.id == id);
  if (ix == -1) return;
  decanatos[ix].acompanante = acompanante;
};

let parroquias = false;
let parroquias_dirty = false;
var getParroquias = () => parroquias;
var getParroquia = (id) =>
  parroquias ? parroquias.find((a) => a.id == id && a.cached) : null;
var isParroquiasDirty = () => parroquias_dirty;
var setParroquias = (z) => {
  parroquias = z;
};
var setParroquia = (i) => {
  i.cached = true;
  if (!parroquias) parroquias = [];
  var ix = parroquias.findIndex((a) => a.id == i.id);
  if (ix == -1) parroquias.push(i);
  else parroquias[ix] = i;
};
var deleteParroquia = (parroquia_id) => {
  parroquias = parroquias.filter((a) => a.id != parroquia_id);
};
var deleteParroquiaCapilla = (parroquia_id, capilla_id) => {
  var p = getParroquia(parroquia_id);
  if (!p) return false;
  p.capillas = p.capillas.filter((a) => a.id != capilla_id);
  setParroquia(p);
  return true;
};
var parroquiaAddCapilla = (parroquia_id, capilla) => {
  var p = getParroquia(parroquia_id);
  if (!p) return false;
  if (!p.capillas) p.capillas = [];
  p.capillas.push(capilla);
  setParroquia(p);
  return true;
};
var parroquiaEditCapilla = (parroquia_id, capilla) => {
  var p = getParroquia(parroquia_id);
  if (!p) return false;
  if (!p.capillas) p.capillas = [capilla];
  else {
    var ix = p.capillas.findIndex((a) => a.id == capilla.id);
    if (ix == -1) return;
    for (var i in capilla) {
      p.capillas[ix][i] = capilla[i];
    }
  }
  setParroquia(p);
  return true;
};
var setParroquiasDirty = (d = true) => {
  parroquias_dirty = d;
};
var addParroquia = (i) => {
  parroquias.push(i);
};

let capillas = false;
let capillas_dirty = false;
var getCapillas = () => capillas;
var getCapilla = (id) =>
  capillas ? capillas.find((a) => a.id == id && a.cached) : null;
var isCapillasDirty = () => capillas_dirty;
var setCapillas = (z) => {
  capillas = z;
};
var setCapilla = (i) => {
  i.cached = true;
  if (!capillas) capillas = [];
  var ix = capillas.findIndex((a) => a.id == i.id);
  if (ix == -1) capillas.push(i);
  else capillas[ix] = i;
};
var setCapillasDirty = (d = true) => {
  capillas_dirty = d;
};
var addCapilla = (i) => {
  if (!capillas) capillas = [];
  capillas.push(i);
};

let coordinadores = false;
let coordinadores_dirty = false;
var getCoordinadores = () => coordinadores;
var getCoordinador = (id) =>
  coordinadores ? coordinadores.find((a) => a.id == id && a.cached) : null;
var isCoordinadoresDirty = () => coordinadores_dirty;
var setCoordinadores = (z) => {
  coordinadores = z;
};
var setCoordinador = (i) => {
  i.cached = true;
  if (!coordinadores) coordinadores = [];
  var ix = coordinadores.findIndex((a) => a.id == i.id);
  if (ix == -1) coordinadores.push(i);
  else coordinadores[ix] = i;
};
var setCoordinadoresDirty = (d = true) => {
  coordinadores_dirty = d;
};
var addCoordinador = (i) => {
  coordinadores.push(i);
};

let grupos = false;
let grupos_dirty = false;
var getGrupos = () => grupos;
var getGrupo = (id) =>
  grupos ? grupos.find((a) => a.id == id && a.cached) : null;
var isGruposDirty = () => grupos_dirty;
var setGrupos = (z) => {
  grupos = z;
};
var setGrupo = (i) => {
  i.cached = true;
  if (!grupos) grupos = [];
  var ix = grupos.findIndex((a) => a.id == i.id);
  if (ix == -1) grupos.push(i);
  else grupos[ix] = i;
};
var registerAsistencia = (id, date) => {
  var g = getGrupo(id);
  if (!g.asistencias) g.asistencias = [];
  g.asistencias.push(date);
  setGrupo(g);
};
var setGruposDirty = (d = true) => {
  grupos_dirty = d;
};
var addGrupo = (i) => {
  grupos.push(i);
};
var setGrupoDirty = (id) => {
  var ix = grupos.findIndex((a) => a.id == id);
  if (ix == -1) return;
  grupos[ix].cached = false;
};

let miembros = [];
var getMiembro = (id) => miembros.find((a) => a.id == id && a.cached);
var addMiembro = (m) => {
  var ix = miembros.findIndex((a) => a.id == m.id);
  m.cached = true;
  if (ix != -1) {
    miembros[ix] = m;
  } else {
    miembros.push(m);
  }
};
var clearMiembros = () => {
  miembros = [];
};
var setMiembroDirty = (id) => {
  var ix = miembros.findIndex((a) => a.id == id);
  if (ix != -1) {
    miembros[ix].cached = false;
  }
};
var setMiembroStatus = (id, status) => {
  var ix = miembros.findIndex((a) => a.id == id);
  if (ix != -1) {
    miembros[ix].estatus = status;
  }
};
var getMiembroFicha = (id) => {
  var m = getMiembro(id);
  if (m.ficha_medica) return m.ficha_medica;
  else return false;
};
var setMiembroFicha = (id, ficha) => {
  var ix = miembros.findIndex((a) => a.id == id);
  if (ix == -1) return;
  miembros[ix].ficha_medica = ficha;
};

let capacitaciones = false;
var getCapacitaciones = () => capacitaciones;
var getCapacitacion = (id) =>
  capacitaciones ? capacitaciones.find((a) => a.id == id && a.cached) : null;
var setCapacitaciones = (z) => {
  capacitaciones = z;
};
var removeCapacitacion = (id) => {
  capacitaciones = capacitaciones.filter((a) => a.id != id);
};
var setCapacitacion = (i) => {
  i.cached = true;
  if (!capacitaciones) capacitaciones = [];
  var ix = capacitaciones.findIndex((a) => a.id == i.id);
  if (ix == -1) capacitaciones.push(i);
  else capacitaciones[ix] = i;
};
var registerCapacitacionAsistencia = (id, date) => {
  var g = getCapacitacion(id);
  if (!g.asistencias) g.asistencias = [];
  g.asistencias.push(date);
  setCapacitacion(g);
};
var addCapacitacion = (i) => {
  grupos.push(i);
};
var editCapacitacion = (cap) => {
  var ix = capacitaciones.findIndex((a) => a.id == cap.id);
  if (ix == -1) return;
  var old = capacitaciones[ix];
  var p = { ...old };
  for (var i in cap) {
    p[i] = cap[i];
  }
  capacitaciones[ix] = p;
};
var addParticipante = (capacitacion, miembro) => {
  if (!capacitaciones) return;
  var ix = capacitaciones.findIndex((a) => a.id == capacitacion);
  if (ix == -1) return;
  if (!capacitaciones[ix].participantes) {
    capacitaciones[ix].participantes = [miembro];
  } else {
    capacitaciones[ix].participantes.push(miembro);
  }
};
var removeParticipante = (cap, id) => {
  if (!capacitaciones) return;
  var ix = capacitaciones.findIndex((a) => a.id == cap);
  if (ix == -1) return;
  if (!capacitaciones[ix].participantes) return;
  capacitaciones[ix].participantes = capacitaciones[ix].participantes.filter(
    (a) => a.id != id
  );
};
var editParticipante = (cap, data) => {
  if (!capacitaciones) return;
  var ix = capacitaciones.findIndex((a) => a.id == cap);
  if (ix == -1) return;
  if (!capacitaciones[ix].participantes) return;
  var px = capacitaciones[ix].participantes.findIndex((a) => a.id == data.id);
  if (px == -1) return;
  for (var i in data) {
    capacitaciones[ix].participantes[px][i] = data[i];
  }
};
var changeCapacitacionEncargado = (cap, encargado) => {
  if (!capacitaciones) return;
  var ix = capacitaciones.findIndex((a) => a.id == cap);
  if (ix == -1) return;
  capacitaciones[ix].encargado = encargado;
};
let capacitadores = false;
var getCapacitadores = () => capacitadores;
var setCapacitadores = (z) => {
  capacitadores = z;
};

var clearCache = () => {
  miembros = [];
  grupos = false;
  coordinadores = false;
  capillas = false;
  parroquias = false;
  decanatos = false;
  zonas = false;
};

export default {
  clearCache,

  getZonas,
  getZona,
  setZonas,
  setZonasDirty,
  isZonasDirty,
  setZona,
  addZona,
  setZonaAcompanante,

  getDecanatos,
  getDecanato,
  setDecanatos,
  setDecanatosDirty,
  isDecanatosDirty,
  setDecanato,
  addDecanato,
  setDecanatoAcompanante,

  getParroquias,
  getParroquia,
  setParroquias,
  setParroquiasDirty,
  isParroquiasDirty,
  setParroquia,
  addParroquia,
  deleteParroquia,
  deleteParroquiaCapilla,
  parroquiaAddCapilla,
  parroquiaEditCapilla,

  getCapillas,
  getCapilla,
  setCapillas,
  setCapillasDirty,
  isCapillasDirty,
  setCapilla,
  addCapilla,

  getCoordinadores,
  getCoordinador,
  setCoordinadores,
  setCoordinadoresDirty,
  isCoordinadoresDirty,
  setCoordinador,
  addCoordinador,

  getGrupos,
  getGrupo,
  setGrupos,
  setGruposDirty,
  isGruposDirty,
  setGrupo,
  setGrupoDirty,
  addGrupo,
  registerAsistencia,

  getMiembro,
  addMiembro,
  clearMiembros,
  setMiembroDirty,
  setMiembroStatus,
  getMiembroFicha,
  setMiembroFicha,

  getCapacitaciones,
  getCapacitacion,
  setCapacitaciones,
  setCapacitacion,
  registerCapacitacionAsistencia,
  addCapacitacion,
  removeCapacitacion,
  editCapacitacion,
  addParticipante,
  removeParticipante,
  editParticipante,
  changeCapacitacionEncargado,
  getCapacitadores,
  setCapacitadores,
};
