import axios from 'axios';
import Cache from './Cache';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROOT_URL } from './apiV2/APIv2';
let onLogout = null;

/**
 * Set the function to call on logout.
 * Used on main stack to goto Login screen
 * on logout.
 * @param {function} cb The function to call
 */
function setOnLogout(cb) {
  onLogout = cb;
}

/**
 * Do a POST request to the API server.
 * @param {string} endpoint The endpoint to POST
 * @param {object} data The data to send to the endpoint
 */
async function post(endpoint, data) {
  const u = await getUser();
  if (u) {
    if (!data) data = { token: u.token };
    else data.token = u.token;
  }
  try {
    console.log('POST /' + endpoint);
    const res = await axios.post(ROOT_URL + endpoint, data);
    if (res.data && res.data.error && res.data.code === 900) {
      logout();
    }
    return res.data;
  } catch (err) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * Do a GET request to the API server.
 * @param {string} endpoint The endpoint to GET
 * @param {object} data The data to send to the endpoint
 */
async function get(endpoint, data) {
  const u = await getUser();
  if (u) {
    if (!data) data = { token: u.token };
    else data.token = u.token;
  }
  try {
    console.log('GET /' + endpoint);
    const res = await axios.get(ROOT_URL + endpoint, {
      params: data,
    });
    if (res.data && res.data.error && res.data.code === 900) {
      logout();
    }
    return res.data;
  } catch (e) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * Do a DELETE request to the API server.
 * @param {string} endpoint The endpoint to DELETE
 * @param {object} data The data to send to the endpoint
 */
async function sendDelete(endpoint, data) {
  const u = await getUser();
  if (u) {
    if (!data) data = { token: u.token };
    else data.token = u.token;
  }
  try {
    console.log('DELETE /' + endpoint);
    const res = await axios.delete(ROOT_URL + endpoint, {
      params: data,
    });
    if (res.data && res.data.error && res.data.code === 900) {
      logout();
    }
    return res.data;
  } catch (e) {
    return {
      error: true,
      message: 'No hubo conexión con el servidor.',
    };
  }
}

/**
 * Get the user that is logged in.
 * Should only be used when you are certain
 * the user is already logged in.
 */
async function getUser() {
  let user = await AsyncStorage.getItem('login');
  if (!user) return false;

  user = JSON.parse(user);
  if (!user) return false;

  return user;
}

/**
 * Returns the user object if the user
 * is logged in. If not returns false.
 *
 * - Checks if login is stored in storage.
 * - Checks with API if login is valid.
 * - Returns user object if valid.
 */
async function getLogin() {
  let user = await AsyncStorage.getItem('login');
  if (!user) return null;

  user = JSON.parse(user);
  if (!user) return null;

  //TODO: Check with API if the saved user is valid.

  return user;
}

/**
 * Login the user with the given credentials.
 * Returns the user if valid
 * Returns false if not valid.
 * @param {String} email The user's email
 * @param {String} password The user's password
 */
async function login(email, password) {
  const u = await post('login', { email, password });
  if (!u) return false;
  if (u.error) return false;

  const user = u.data;
  await AsyncStorage.setItem('login', JSON.stringify(user));
  await AsyncStorage.setItem('user_info', JSON.stringify(u.userInfo));

  return user;
}

/**
 * Change the user's password. Needs old to verify the users validity.
 * @param {string} old_password The old password of the account
 * @param {string} new_password The new password to change
 */
async function changePassword(old_password, new_password) {
  const u = await post('password/change', { old_password, new_password });
  if (!u) return false;
  if (!u.error) await AsyncStorage.removeItem('login');
  return u;
}

/**
 * Logout a user
 * - Removes the user info from storage.
 * - If no user is logged in, does nothing, returns true.
 * @returns {Boolean}
 */
async function logout() {
  const user = await getUser();

  // If user is not logged in, return true.
  if (!user) return true;

  // Clear cache
  Cache.clearCache();
  if (onLogout) onLogout();

  // Delete user info from storage.
  await AsyncStorage.removeItem('login');
  return true;
}

/**
 * Get the list of zonas.
 *	@param {Boolean} force Should skip cached data.
 */
async function getZonas(force = false) {
  if (!force && Cache.getZonas()) {
    return Cache.getZonas();
  }

  const p = await get('zonas');
  if (p.error) throw p;
  else {
    Cache.setZonas(p.data);
    return p.data;
  }
}

/**
 * Get the zone information.
 * @param {Number} id The zone id
 * @param {Boolean} force Should skip cached data
 */
async function getZona(id, force = false) {
  if (!force) {
    const zonaCache = Cache.getZona(id);
    if (zonaCache) {
      return zonaCache;
    }
  }

  const p = await get('zonas/' + id);
  if (p.error) throw p;
  else {
    Cache.setZona(p.data);
    return p.data;
  }
}

/**
 * Get the decanato data.
 * @param {Number} id The decanato ID
 * @param {Boolean} force Should skip cached data
 */
async function getDecanato(id, force = false) {
  if (!force) {
    const decanatoCache = Cache.getDecanato(id);
    if (decanatoCache) {
      return decanatoCache;
    }
  }

  const p = await get('decanatos/' + id);
  if (p.error) throw p;
  else {
    Cache.setDecanato(p.data);
    return p.data;
  }
}

/**
 * Get the parroquias list
 * @param {boolean} force Bypass the cache
 */
async function getParroquias(force = false) {
  if (!force && Cache.getParroquias()) {
    return Cache.getParroquias();
  }

  const p = await get('parroquias');
  if (p.error) throw p;
  else {
    Cache.setParroquias(p.data);
    return p.data;
  }
}

/**
 * Get a parroquia from id.
 * @param {string} id The parroquia id.
 * @param {boolean} force Bypass the cache
 */
async function getParroquia(id, force = false) {
  if (!force) {
    const parroquiaCache = Cache.getParroquia(id);
    if (parroquiaCache) {
      return parroquiaCache;
    }
  }

  const p = await get('parroquias/' + id);
  if (p.error) throw p;
  else {
    Cache.setParroquia(p.data);
    return p.data;
  }
}

/**
 * Add a parroquia to the database.
 * @param {object} data The parroquia data.
 */
async function addParroquia(data) {
  const payload = {
    identificador: data.identificador,
    nombre: data.nombre,
    direccion: data.direccion,
    colonia: data.colonia,
    municipio: data.municipio,
    telefono1: data.telefono1,
    telefono2: data.telefono2,
    decanato: data.decanato,
  };

  const res = await post('parroquias', payload);

  if (res.error) {
    throw res;
  } else {
    return res.data;
  }
}

/**
 * Edit a parroquia data.
 * @param {string} id The parroquia to edit
 * @param {object} data The new data of the parroquia.
 */
async function editParroquia(id, data) {
  const res = await post('parroquias/edit', {
    parroquia: id,
    ...data,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Add a parroquia's capilla to the database
 * @param {string} parroquia_id The capilla's parrouia id
 * @param {object} data The new capilla data
 */
async function addCapilla(parroquia_id, data) {
  const payload = {
    ...data,
    parroquia: parroquia_id,
  };
  const res = await post('capillas', payload);
  if (res.error) throw res;
  else {
    Cache.parroquiaAddCapilla(parroquia_id, res.data);
    Cache.addCapilla(res.data);
    return res.data;
  }
}

/**
 * Get the list of decanatos
 * @param {boolean} force Bypass the cachce
 */
async function getDecanatos(force = false) {
  if (!force && Cache.getDecanatos()) {
    return Cache.getDecanatos();
  }
  const p = await get('decanatos');
  if (p.error) throw p;
  else {
    Cache.setDecanatos(p.data);
    return p.data;
  }
}

/**
 * Get the list of coordinadores
 * @param {boolean} force Bypass the cache
 */
async function getCoordinadores(force = false) {
  if (!force && Cache.getCoordinadores()) {
    return Cache.getCoordinadores();
  }
  const p = await get('coordinadores');
  if (p.error) throw p;
  else {
    Cache.setCoordinadores(p.data);
    return p.data;
  }
}

/**
 * Get a coordinador from id.
 * @param {string} id The coordinador id
 * @param {boolean} force Bypass the cache
 */
async function getCoordinador(id, force = false) {
  if (!force) {
    const coordCache = Cache.getCoordinador(id);
    if (coordCache) {
      return coordCache;
    }
  }

  const p = await get('coordinadores/' + id);
  if (p.error) throw p;
  else {
    Cache.setCoordinador(p.data);
    return p.data;
  }
}

/**
 * Get Coordinadores for groups in acompanante's zona or decanato
 * @param {string} acomId  The acompanante id
 */
async function getCoordinadoresForAcompanante(acomId) {
  const res = await get('coordinadores/acompanante/' + acomId);
  if (res.error) {
    throw res;
  } else {
    return res.data;
  }
}

/**
 * Get the list of grupos
 * @param {boolean} force Bypass the cache
 */
async function getGrupos(force = false) {
  if (!force && Cache.getGrupos()) {
    return Cache.getGrupos();
  }
  const res = await get('grupos');
  if (res.error) throw res;
  else {
    Cache.setGrupos(res.data);
    return res.data;
  }
}

/**
 * Get the list of groups for acompanante's zona or decanato
 * @param {string} acomId  The acompanante id
 */
async function getGruposForAcompanante(acomId, force = false) {
  if (!force && Cache.getGrupos()) {
    return Cache.getGrupos();
  }
  const res = await get('grupos/acompanante/' + acomId);
  if (res.error) throw res;
  else {
    Cache.setGrupos(res.data);
    return res.data;
  }
}

/**
 * Get a grupo from id
 * @param {string} id The id of the grupo
 * @param {boolean} force Bypass the cache
 */
async function getGrupo(id, force = false) {
  if (!force) {
    const cacheGrupo = Cache.getGrupo(id);
    if (cacheGrupo) {
      return cacheGrupo;
    }
  }
  const res = await get('grupos/' + id);
  if (res.error) throw res;
  else {
    res.data.id = id;
    Cache.setGrupo(res.data);
    return res.data;
  }
}

/**
 * Create a grupo and add it to the database.
 * The parroquia and capilla param are exclusive,
 * only one should be present, not both.
 * @param {string} name The name of the new grupo
 * @param {string} coordinador The ID of the grupo's coordinador
 * @param {string} parroquia The ID of the grupo's parrouia
 * @param {string} capilla The ID of the grupo's capilla
 */
async function addGrupo(name, coordinador, parroquia, capilla) {
  const payload = {
    name,
    coordinador,
    parroquia,
    capilla,
  };

  const res = await post('grupos', payload);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Get the list of events.
 */
async function getEvents() {
  const response = await get('eventos');

  if (response.error) {
    throw response;
  }

  return response.data;
}

/**
 * Create a calendar event and add it to the database.
 * The parroquia and capilla param are exclusive,
 * only one should be present, not both.
 * @param {string} name The name of the new event
 * @param {string} eventResponsible The name of the event responsible
 * @param {string} eventDates The dates of the event
 */
async function addEvent(name, eventResponsible, eventDates) {
  console.log('addEvent start');

  const payload = {
    name,
    eventResponsible,
    eventDates,
  };

  const response = await post('eventos', payload);

  if (response.error) {
    throw response;
  }

  return response.data;
}

/**
 * Edit an event's data.
 * @param {string} id The event's id
 * @param {object} data The event's new data
 */
async function editEvent(id, data) {
  const response = await post('eventos/' + id + '/edit', data);

  if (response.error) {
    throw response;
  }

  return response.data;
}

/**
 * Delete an event from the database.
 * @param {string} id The event's id
 */
async function deleteEvent(id) {
  const response = await sendDelete('eventos/' + id);

  if (response.error) {
    throw response;
  }

  return response.data;
}

/**
 * Get the list of events.
 */
async function getObjectivesByYear(year) {
  const response = await get(`objetivos/${year}`);

  if (response.error) {
    throw response;
  }

  return response.data;
}

/**
 * Edit an objective's data.
 * @param {string} id The objective's id
 * @param {object} data The objective's new data
 */
async function editObjective(data) {
  const response = await post('objetivos', data);

  if (response.error) {
    throw response;
  }

  return response.data;
}
/**
 * Create a coordinador and add it to the databse.
 * @param {object} data The data of the new coordinador
 */
async function registerCoordinador(data) {
  const res = await post('coordinadores', data);
  if (res.error) throw res;
  else {
    Cache.setCoordinadores(res.data);
    return res.data;
  }
}

/**
 * Register a member to the grupo.
 * @param {string} grupo The member's grupo id
 * @param {object} data The new member's data
 */
async function registerMember(grupo, data) {
  const payload = {
    grupo,
    ...data,
  };

  const res = await post('grupos/register', payload);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Get a asistencia from a group from the database.
 * The date must be 'YYYY-MM-DD'
 * @param {string} grupo_id The asistencia's grupo
 * @param {string} fecha The asistencia's date in format 'YYYY-MM-DD'
 */
async function getAsistencia(grupo_id, fecha) {
  const res = await get('grupos/' + grupo_id + '/asistencia/' + fecha);
  if (res.error) throw res;
  else {
    return res.data;
  }
}

/**
 * Register an asistencia for a group on a date.
 * @param {string} grupo_id The grupo's id
 * @param {string} fecha The asistencia's fecha in format 'YYYY-MM-DD'
 * @param {array} miembros Array of member ids
 * @param {boolean} force Overwrite the asistencia if there is already one on this date?
 */
async function registerAsistencia(
  grupo_id,
  fecha,
  miembros,
  agenda,
  commentarios,
  force = false
) {
  const payload = {
    fecha,
    miembros,
    force,
    agenda,
    commentarios,
  };
  const res = await post('grupos/' + grupo_id + '/asistencia', payload);
  if (res.error) throw res;
  else {
    Cache.registerAsistencia(grupo_id, res.data);
    return res.data;
  }
}

/**
 * Save an already made asistencia
 * @param {string} grupo_id The grupo's id
 * @param {string} fecha The asistencia's fecha in format 'YYYY-MM-DD'
 * @param {array} miembros Array of member ids
 */
async function saveAsistencia(grupo_id, fecha, miembros, agenda, commentarios) {
  const res = await post('grupos/' + grupo_id + '/asistencia/' + fecha, {
    miembros,
    agenda,
    commentarios,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Get a capilla from id
 * @param {string} capilla_id The capilla's id
 */
async function getCapilla(capilla_id) {
  const res = await get('capillas/' + capilla_id);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Edit a capilla's data.
 * @param {string} capilla_id The capilla's id
 * @param {string} data The capilla's new data
 * @param {string} parroquia_id The capilla's parroquia, used for Cache saving.
 */
async function editCapilla(capilla_id, data, parroquia_id) {
  const payload = {
    id: capilla_id,
    ...data,
  };

  const res = await post('capillas/edit', payload);
  if (res.error) throw res;
  else {
    Cache.parroquiaEditCapilla(parroquia_id, {
      id: capilla_id,
      ...data,
    });
    return res.data;
  }
}

/**
 * Delete a capilla from the database.
 * @param {string} parroquia_id The capilla's parroquia id. Used for Cache editing.
 * @param {string} capilla_id The capilla's id
 */
async function deleteCapilla(parroquia_id, capilla_id) {
  const res = await sendDelete('capillas/' + capilla_id);
  if (res.error) throw res;
  else {
    Cache.deleteParroquiaCapilla(parroquia_id, capilla_id);
    return res.data;
  }
}

/**
 * Delete a parroquia from the database
 * @param {string} parroquia_id The parroquia's id
 */
async function deleteParroquia(parroquia_id) {
  const res = await sendDelete('parroquias/' + parroquia_id);
  if (res.error) throw res;
  else {
    Cache.deleteParroquia(parroquia_id);
    return res.data;
  }
}

/**
 * Get a miembro from the databse.
 * @param {string} miembro_id The member's id
 * @param {boolean} force Bypass the cache
 */
async function getMiembro(miembro_id, force = false) {
  if (!force) {
    const m = Cache.getMiembro(miembro_id);
    if (m) {
      return m;
    }
  }

  const res = await get('grupos/miembro/' + miembro_id);
  if (res.error) throw res;
  else {
    if (res.data) {
      res.data.id = miembro_id;
      Cache.addMiembro(res.data);
    }
    return res.data;
  }
}

/**
 * Get the admin users from the database.
 */
async function adminGetUsers() {
  const res = await get('admin/users');
  if (res.error) throw res;
  else return res.data;
}

/**
 * Get a user's info
 * @param {string} id The user's id
 * @param {string} type the user's type
 */
async function getUserDetail(id, email, type) {
  const res = await post('admin/users/get', {
    id: id,
    email: email,
    type: type,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Register a new admin to the database.
 * @param {object} data The new admin's data
 */
async function registerAdmin(data) {
  const res = await post('admin/users/add', data);
  if (res.error) throw res;
  else return res;
}

/**
 * Change an admin's password on the database.
 * @param {string} email The admin's database
 * @param {string} password The new password
 */
async function changeAdminPassword(email, password) {
  const res = await post('admin/users/password', { email, password });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Delete an admin from the database.
 * @param {string} email The admin's email
 */
async function deleteAdmin(email) {
  const res = await post('admin/users/delete', { email });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Edit a user from the database.
 * @param {string} old_email The current user's email
 * @param {string} id The user's id
 * @param {string} data The new user's data.
 */
async function editUserDetail(old_email, id, data) {
  const res = await post('admin/users/edit', {
    id: id,
    email: old_email,
    ...data,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Edit a grupo from the database
 * @param {string} id The grupo's id
 * @param {object} data The grupo's new data.
 */
async function editGrupo(id, data) {
  const res = await post('grupos/edit', {
    id,
    ...data,
  });
  if (res.error) throw res;
  else {
    Cache.setGrupoDirty(id);
    return res.data;
  }
}

/**
 * Edit a miembro on the database
 * @param {string} id The miembro's id
 * @param {object} data The miembro's new data.
 */
async function editMiembro(id, data) {
  const res = await post('grupos/miembro/' + id + '/edit', data);

  if (res.error) throw res;
  else {
    Cache.setMiembroDirty(id);
    return res.data;
  }
}

/**
 * Delete a grupo from the database.
 * @param {string} id The grupo's id
 */
async function deleteGrupo(id) {
  const res = await sendDelete('grupos/' + id);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Change a grupo's coordinador
 * @param {string} grupo_id The grupo's id
 * @param {string} coordinador_id The coordinador's id
 */
async function changeCoordinador(grupo_id, coordinador_id) {
  const res = await post('grupos/' + grupo_id + '/coordinador', {
    coordinador: coordinador_id,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Edit a miembro's status.
 * 0 => Activo
 * 1 => Baja temporal
 * 2 => Baja definitiva (delete)
 * @param {string} id The miembro's id
 * @param {number} status The new miembro's status (0-2)
 */
async function editMiembroStatus(id, status) {
  const res = await post('grupos/miembro/' + id + '/edit/status', { status });
  if (res.error) throw res;
  else {
    Cache.setMiembroStatus(id, status);
    return res.data;
  }
}

/**
 * Get the list of users that are on status 1
 * @param {string} id The grupo's id
 */
async function getGrupoBajasTemporales(id) {
  const res = await get('grupos/' + id + '/bajas');
  if (res.error) throw res;
  else return res.data;
}

/**
 * DEPRECATED
 * Get the ficha medica from the user.
 * @param {string} id The member's id
 * @param {boolean} force Bypass the cache
 */
async function getFichaMedica(id, force = false) {
  if (!force) {
    const f = Cache.getMiembroFicha(id);
    if (f !== false) return f;
  }

  const res = await get('grupos/miembro/' + id + '/ficha');
  if (res.error) throw res;
  else {
    Cache.setMiembroFicha(id, res.data);
    return res.data;
  }
}

/**
 * Change a member's ficha medica.
 * @param {string} id The member's id
 * @param {object} data The member's new ficha medica
 */
async function setFichaMedica(id, data) {
  const res = await post('grupos/miembro/' + id + '/edit/ficha', {
    id,
    ...data,
  });
  if (res.error) throw res;
  else {
    Cache.setMiembroFicha(id, data);
    return res.data;
  }
}

/**
 * Register a acompañante for a zona.
 * @param {string} zona The zona's id
 * @param {object} data The new acompañante's data
 */
async function registerAcompananteZona(zona, data) {
  const res = await post('acompanante/zona', {
    zona,
    ...data,
  });
  if (res.error) throw res;
  else {
    if (res.data) {
      Cache.setZonaAcompanante(zona, res.data);
    }
    return res.data;
  }
}

/**
 * Register a acompañante for a decanato.
 * @param {string} decanato The decanato's id
 * @param {object} data The new acompañante's data
 */
async function registerAcompananteDecanato(decanato, data) {
  const res = await post('acompanante/decanato', {
    decanato,
    ...data,
  });
  if (res.error) throw res;
  else {
    if (res.data) {
      Cache.setDecanatoAcompanante(decanato, res.data);
    }
    return res.data;
  }
}

/**
 * Get an acompañantes data.
 */
async function getAcompanantes() {
  const res = await get('acompanantes');

  if (res.error) {
    throw res;
  } else {
    return res.data;
  }
}

/**
 * Get an acompañante's zona or decanato.
 * @param {string} id The acompañante's id
 */
async function getAcompananteZonaOrDecanato(id) {
  const res = await get('acompanantes/' + id + '/place');

  if (res.error) {
    throw res;
  } else {
    return res.data;
  }
}

/**
 * Get an acompañante's data.
 * @param {string} id The acompañante's id
 */
async function getAcompanante(id) {
  const res = await get('acompanante/' + id);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Delete a zona's acompañante.
 * @param {string} zona The zona's id
 */
async function deleteAcompananteZona(zona) {
  const res = await sendDelete('zonas/' + zona + '/acompanante');
  if (res.error) throw res;
  else {
    Cache.setZonaAcompanante(zona, null);
    return res.data;
  }
}

/**
 *	Delete a decanato's acompañante
 * @param {string} decanato The decanato's id
 */
async function deleteAcompananteDecanato(decanato) {
  const res = await sendDelete('decanatos/' + decanato + '/acompanante');
  if (res.error) throw res;
  else {
    Cache.setDecanatoAcompanante(decanato, null);
    return res.data;
  }
}

/**
 * Edit a acompañante, decanato or zona.
 * @param {string} id The acompañante's id
 * @param {object} data The acompañante's new data.
 */
async function editAcompanante(id, data) {
  const res = await post('acompanante/edit', {
    id,
    ...data,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Delete a coordinador from the database.
 * All of their groups and capacitaciones are left without coordinador.
 * @param {string} id The coordinador's id
 */
async function deleteCoordinador(id) {
  const res = await sendDelete('coordinadores/' + id);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Edit a coordinador's data.
 * @param {string} id The coordinador's id
 * @param {object} data The coordinador's new data
 */
async function editCoordinador(id, data) {
  const res = await post('coordinadores/' + id + '/edit', data);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Add a new capacitacion to the database.
 * @param {object} data The new capactiacions data
 */
async function addCapacitacion(data) {
  const res = await post('capacitacion', data);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Get the list of capacitaciones
 * @param {boolean} force Bypass the cache
 */
async function getCapacitaciones(force = false) {
  if (!force && Cache.getCapacitaciones()) {
    return Cache.getCapacitaciones();
  }
  const res = await get('capacitacion');
  if (res.error) throw res;
  else {
    Cache.setCapacitaciones(res.data);
    return res.data;
  }
}

/**
 * Get a capacitacion from id
 * @param {string} id The capacitacións id
 * @param {boolean} force Bypass the cache
 */
async function getCapacitacion(id, force = false) {
  if (!force) {
    const cacheCap = Cache.getCapacitacion(id);
    if (cacheCap) return cacheCap;
  }
  const res = await get('capacitacion/' + id);
  if (res.error) throw res;
  else {
    Cache.setCapacitacion(res.data);
    return res.data;
  }
}

/**
 * Edit a capacitacion
 * @param {string} id The capacitación's id
 * @param {object} data The capacitacións new data.
 */
async function editCapacitacion(id, data) {
  const res = await post('capacitacion/edit', {
    id,
    ...data,
  });
  if (res.error) throw res;
  else {
    data.inicio = {
      _seconds: moment(data.inicio, 'YYYY-MM-DD').unix(),
    };
    data.fin = {
      _seconds: moment(data.fin, 'YYYY-MM-DD').unix(),
    };
    Cache.editCapacitacion({ id, ...data });
    return res.data;
  }
}

/**
 * Remove a capacitación from the database.
 * @param {string} id The capacitación's data
 */
async function removeCapacitacion(id) {
  const res = await sendDelete('capacitacion/' + id);
  if (res.error) throw res;
  else {
    Cache.removeCapacitacion(id);
    return res.data;
  }
}

/**
 * Register an asistencia for a capacitación on a date.
 * @param {string} id The capacitación's id
 * @param {string} fecha The asistencia's fecha in format 'YYYY-MM-DD'
 * @param {array} miembros Array of member ids
 * @param {boolean} force Overwrite the asistencia if there is already one on this date?
 */
async function registerCapacitacionAsistencia(
  id,
  fecha,
  miembros,
  force = false
) {
  const payload = {
    fecha,
    miembros,
    force,
  };
  const res = await post('capacitacion/' + id + '/asistencia', payload);
  if (res.error) throw res;
  else {
    Cache.registerCapacitacionAsistencia(id, res.data);
    return res.data;
  }
}

/**
 * Save an already made asistencia
 * @param {string} id The capacitación's id
 * @param {string} fecha The asistencia's fecha in format 'YYYY-MM-DD'
 * @param {array} miembros Array of member ids
 */
async function saveCapacitacionAsistencia(id, fecha, miembros) {
  const res = await post('capacitacion/' + id + '/asistencia/' + fecha, {
    miembros,
  });
  if (res.error) throw res;
  else return res.data;
}

/**
 * Get a asistencia from a capacitación from the database.
 * The date must be 'YYYY-MM-DD'
 * @param {string} grupo_id The asistencia's grupo
 * @param {string} fecha The asistencia's date in format 'YYYY-MM-DD'
 */
async function getCapacitacionAsistencia(id, fecha) {
  const res = await get('capacitacion/' + id + '/asistencia/' + fecha);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Edit a participante from the database.
 * @param {string} capacitacion The capacitación's id
 * @param {string} id The participante's id
 * @param {object} data The participantes new data
 */
async function editParticipante(capacitacion, id, data) {
  const res = await post('participante/edit', {
    id,
    ...data,
  });
  if (res.error) throw res;
  else {
    data.fecha_nacimiento = {
      _seconds: moment(data.fecha_nacimiento, 'YYYY-MM-DD').unix(),
    };
    Cache.editParticipante(capacitacion, {
      id,
      ...data,
    });
    return res.data;
  }
}

/**
 * Get a participante from the database.
 * @param {string} id The participante's id
 */
async function getParticipante(id) {
  const res = await get('participante/' + id);
  if (res.error) throw res;
  else return res.data;
}

/**
 * Add a participante to a capacitación
 * @param {string} capacitacion The capacitación's id
 * @param {object} data The new participante's data
 */
async function addCapacitacionParticipante(capacitacion, data) {
  const res = await post('participante', {
    capacitacion,
    ...data,
  });

  if (res.error) throw res;
  else {
    data.fecha_nacimiento = {
      _seconds: moment(data.fecha_nacimiento, 'YYYY-MM-DD').unix(),
    };
    Cache.addParticipante(capacitacion, data);
    return res.data;
  }
}

/**
 * Remove a participante from a capacitación (and the database)
 * @param {string} capacitacion The capacitación's id
 * @param {string} id The participante's id to remove
 */
async function removeCapacitacionParticipante(capacitacion, id) {
  const res = await sendDelete('participante/' + id);
  if (res.error) throw res;
  else {
    Cache.removeParticipante(capacitacion, id);
    return res.data;
  }
}

/**
 * Change the encargado (coordinador) of a capacitación.
 * @param {string} capacitacion The capacitación's id
 * @param {string} encargado The coordinador's id
 */
async function changeCapacitacionEncargado(capacitacion, encargado) {
  const res = await post('capacitacion/edit/encargado', {
    id: capacitacion,
    capacitador: encargado,
  });
  if (res.error) throw res;
  else {
    Cache.changeCapacitacionEncargado(capacitacion, encargado);
    return res.data;
  }
}

/**
 * Get the list of capacitadores
 * @param {boolean} force Bypass the cache
 */
async function getCapacitadores(force = false) {
  if (!force && Cache.getCapacitadores()) {
    return Cache.getCapacitadores();
  }
  const p = await get('capacitadores');
  if (p.error) throw p;
  else {
    Cache.setCapacitadores(p.data);
    return p.data;
  }
}

/**
 * Get the participantes from a capcitación
 * @param {string} capacitacion The capacitación's id
 */
async function getParticipantes(capacitacion) {
  const res = await get('capacitacion/' + capacitacion + '/participantes');
  if (res.error) throw res.error;
  else return res.data;
}

/**
 * Get group members' stats
 */
async function getStats() {
  const res = await get('estadisticas');

  if (res.error) {
    throw res.error;
  } else {
    return res;
  }
}

/**
 * Format a GET url and add the token to the params.
 * Used for reporte downloading.
 * @param {string} url The endpoint of the url
 */
async function formatURL(url) {
  const u = await getUser();
  return ROOT_URL + url + '?token=' + u.token;
}

export default {
  setOnLogout,
  getLogin,
  getUser,
  login,
  logout,
  addCapilla,
  addGrupo,
  getZona,
  getZonas,
  getDecanato,
  getParroquias,
  getParroquia,
  addParroquia,
  getDecanatos,
  getCoordinadores,
  getCoordinadoresForAcompanante,
  getGrupos,
  getGruposForAcompanante,
  getGrupo,
  registerCoordinador,
  registerMember,
  registerAsistencia,
  getAsistencia,
  saveAsistencia,
  getCapilla,
  deleteCapilla,
  deleteParroquia,
  getMiembro,
  changePassword,
  adminGetUsers,
  registerAdmin,
  getUserDetail,
  deleteAdmin,
  changeAdminPassword,
  editUserDetail,
  editGrupo,
  deleteGrupo,
  editMiembro,
  editMiembroStatus,
  changeCoordinador,
  getGrupoBajasTemporales,
  getFichaMedica,
  setFichaMedica,
  editParroquia,
  getAcompanantes,
  getAcompananteZonaOrDecanato,
  getAcompanante,
  registerAcompananteZona,
  registerAcompananteDecanato,
  deleteAcompananteZona,
  deleteAcompananteDecanato,
  editAcompanante,
  editCoordinador,
  deleteCoordinador,
  addCapacitacion,
  getCapacitaciones,
  getCapacitacion,
  editCapacitacion,
  removeCapacitacion,
  registerCapacitacionAsistencia,
  saveCapacitacionAsistencia,
  getCapacitacionAsistencia,
  addCapacitacionParticipante,
  removeCapacitacionParticipante,
  getParticipante,
  editParticipante,
  getParticipantes,
  changeCapacitacionEncargado,
  getCapacitadores,
  editCapilla,
  formatURL,
  getCoordinador,
  getStats,
  getEvents,
  addEvent,
  deleteEvent,
  editEvent,
  getObjectivesByYear,
  editObjective,
};
