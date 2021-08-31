let FieldValue = require('firebase-admin').firestore.FieldValue;
const moment = require('moment');
const Util = require('./util');

/**
 * Module for managing Groups
 * @module Grupo
 */

/**
 * Gets all group documents for the list
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req
 * @param {String} req.params.id - the id of the document to retrieve
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - true if there was an error, else false.
 * @param {String} [res.message] - Assigned only if error, includes de error message
 * @param {JSON} [res.data] - Assigned only if no error
 * @param {String} res.data.grupos - List of groups
 */
const getall = async (firestore, req, res) => {
  var grupos = [];

  if (req.user.tipo != 'coordinador') {
    // Return all
    const snapshot = await firestore.collection('grupos').get();
    grupos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } else {
    const snapshot = await firestore
      .collection('grupos')
      .where('coordinador', '==', req.user.id)
      .get();
    grupos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  if (grupos.length > 0) {
    // Get unique ids from parroquias and capillas
    var pid = Array.from(
      new Set(grupos.map((a) => a.parroquia || null))
    ).filter((a) => a != null);
    var cid = Array.from(new Set(grupos.map((a) => a.capilla || null))).filter(
      (a) => a != null
    );

    // Get parroquias
    var parroquias = [];
    if (pid.length > 0) {
      var snapParroquias = await firestore.getAll(
        ...pid.map((a) => firestore.doc('parroquias/' + a))
      );
      snapParroquias.forEach((a) => {
        if (!a.exists) return;
        var d = a.data();
        parroquias.push({ id: a.id, nombre: d.nombre });
      });
    }

    // Get capillas
    var capillas = [];
    if (cid.length > 0) {
      var snapCapillas = await firestore.getAll(
        ...cid.map((a) => firestore.doc('capillas/' + a))
      );
      snapCapillas.forEach((a) => {
        if (!a.exists) return;
        var d = a.data();
        capillas.push({ id: a.id, nombre: d.nombre });
      });
    }

    for (var i of grupos) {
      if (i.parroquia) {
        i.parroquia = parroquias.find((a) => a.id == i.parroquia);
      } else if (i.capilla) {
        i.capilla = capillas.find((a) => a.id == i.capilla);
      }
    }
  }
  res.send({
    error: false,
    data: grupos,
  });
};

// Divide array into chunks of the specified size
var chunks = function (array, size) {
  var results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};

/**
 * Get groups in acompanante's zona or decanato
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req
 * @param {JSON} res - Status 200
 */
const getForAcompanante = async (firestore, req, res) => {
  try {
    const acom = req.params.id;
    var decanatos = [];
    var parroquias = [];
    var grupos = [];
    var decanRef, parroquiasRef, gruposRef;

    const zonaRef = await firestore
      .collection('zonas')
      .where('acompanante', '==', acom)
      .get();

    if (!zonaRef.empty) {
      const zonaId = zonaRef.docs[0].id;
      decanRef = await firestore
        .collection('decanatos')
        .where('zona', '==', zonaId)
        .get();
    } else {
      decanRef = await firestore
        .collection('decanatos')
        .where('acompanante', '==', acom)
        .get();
    }

    if (!decanRef.empty) {
      decanatos = decanRef.docs.map((d) => d.id);
      decanatos = chunks(decanatos, 10);
      for (dec of decanatos) {
        parroquiasRef = await firestore
          .collection('parroquias')
          .where('decanato', 'in', dec)
          .get();
        if (!parroquiasRef.empty) {
          parroquiasRef.docs.forEach((p) => parroquias.push(p.id));
        }
      }
    } else {
      throw Error('Acompañante no asignado a Zona o Decanato');
    }

    if (parroquias.length > 0) {
      parroquias = chunks(parroquias, 10);
      for (parr of parroquias) {
        gruposRef = await firestore
          .collection('grupos')
          .where('parroquia', 'in', parr)
          .get();
        if (!gruposRef.empty) {
          gruposRef.docs.forEach((doc) =>
            grupos.push({ id: doc.id, ...doc.data() })
          );
        }
      }
    } else {
      throw Error('Error buscando parroquias de zona o decanato');
    }

    if (grupos.length > 0) {
      // Get unique ids from parroquias and capillas
      var pid = Array.from(
        new Set(grupos.map((a) => a.parroquia || null))
      ).filter((a) => a != null);
      var cid = Array.from(
        new Set(grupos.map((a) => a.capilla || null))
      ).filter((a) => a != null);

      // Get parroquias
      var parroquias = [];
      if (pid.length > 0) {
        var snapParroquias = await firestore.getAll(
          ...pid.map((a) => firestore.doc('parroquias/' + a))
        );
        snapParroquias.forEach((a) => {
          if (!a.exists) return;
          var d = a.data();
          parroquias.push({ id: a.id, nombre: d.nombre });
        });
      }

      // Get capillas
      var capillas = [];
      if (cid.length > 0) {
        var snapCapillas = await firestore.getAll(
          ...cid.map((a) => firestore.doc('capillas/' + a))
        );
        snapCapillas.forEach((a) => {
          if (!a.exists) return;
          var d = a.data();
          capillas.push({ id: a.id, nombre: d.nombre });
        });
      }

      for (var i of grupos) {
        if (i.parroquia) {
          i.parroquia = parroquias.find((a) => a.id == i.parroquia);
        } else if (i.capilla) {
          i.capilla = capillas.find((a) => a.id == i.capilla);
        }
      }
    }

    return res.send({
      error: false,
      data: grupos,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e.message,
    });
  }
};

/**
 * Gets the group document with the specified id
 * @param {firebase.firestore} firestore - preinitialized firebase-admin.firestore() instance
 * @param {GET} req
 * @param {String} req.params.id - the id of the document to retrieve
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - true if there was an error, else false.
 * @param {String} [res.message] - Assigned only if error, includes de error message
 * @param {JSON} [res.data] - Assigned only if no error
 * @param {String} res.data.grupos - Information of requested group
 */
const getone = async (firestore, req, res) => {
  try {
    var snapshot = await firestore
      .collection('grupos')
      .doc(req.params.id)
      .get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'there is no group with that id',
      });
    }

    var grupo = snapshot.data();
    if (
      !req.user.admin &&
      grupo.coordinador != req.user.id &&
      !req.user.tipo.startsWith('acompañante')
    ) {
      return res.send({
        error: true,
        code: 999,
        message: 'No tienes acceso a este grupo',
      });
    }

    // Query a información de los miembros
    var miembrosSnap = await firestore
      .collection('miembros')
      .where('grupo', '==', snapshot.id)
      .where('estatus', '==', 0)
      .get();
    var miembros = [];
    miembrosSnap.forEach((a) => {
      if (!a.exists) return;
      var m = a.data();
      miembros.push({
        id: a.id,
        nombre: m.nombre,
        apellido_paterno: m.apellido_paterno,
      });
    });
    grupo.miembros = miembros;

    if (grupo.parroquia) {
      // Grupo pertenece a parroquia, query a parroquia.
      var parrSnap = await firestore
        .collection('parroquias')
        .doc(grupo.parroquia)
        .get();
      if (parrSnap.exists) {
        grupo.parroquia = { id: parrSnap.id, nombre: parrSnap.data().nombre };
      } else grupo.parroquia = false;
    } else if (grupo.capilla) {
      // Grupo pertenece a capilla, query a capilla y su parroquia.
      var capSnap = await firestore
        .collection('capillas')
        .doc(grupo.capilla)
        .get();
      if (capSnap.exists) {
        grupo.capilla = { id: capSnap.id, nombre: capSnap.data().nombre };
        var parrSnap = await firestore
          .collection('parroquias')
          .where('capillas', 'array-contains', capSnap.id)
          .select('nombre')
          .get();
        if (parrSnap.size > 0) {
          grupo.capilla.parroquia = {
            id: parrSnap.docs[0].id,
            nombre: parrSnap.docs[0].data().nombre,
          };
        }
      } else grupo.capilla = false;
    }

    if (grupo.coordinador) {
      var coordSnap = await firestore
        .collection('coordinadores')
        .doc(grupo.coordinador)
        .get();
      if (!coordSnap.exists) {
        grupo.coordinador = null;
      } else {
        var d = coordSnap.data();
        grupo.coordinador = {
          id: coordSnap.id,
          nombre: d.nombre,
          apellido_paterno: d.apellido_paterno,
          apellido_materno: d.apellido_materno,
        };
      }
    }

    // Conseguir información sobre asistencias
    const asistenciasSnap = await firestore
      .collection('grupos/' + req.params.id + '/asistencias')
      .get();
    var asistencias = asistenciasSnap.docs.map((doc) => doc.id);
    grupo.asistencias = asistencias || [];

    res.send({
      error: false,
      data: grupo,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Gets a list of all the members who are in a 'Baja Temporal' state
 */
var getBajasTemporales = async (firestore, req, res) => {
  var { id } = req.params;
  try {
    var snapshot = await firestore.collection('grupos').doc(id).get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'there is no group with that id',
      });
    }

    // Query a información de los miembros
    var miembrosSnap = await firestore
      .collection('miembros')
      .where('grupo', '==', snapshot.id)
      .where('estatus', '==', 1)
      .get('nombre');
    var miembros = [];
    miembrosSnap.forEach((a) => {
      if (!a.exists) return;
      miembros.push({ id: a.id, nombre: a.data().nombre });
    });

    return res.send({
      error: false,
      data: miembros,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Mensaje inesperado',
    });
  }
};

/**
 * Adds a new group to the 'grupos' collection
 */
const add = async (firestore, req, res) => {
  var { name, parroquia, capilla, coordinador } = req.body;
  try {
    const snapshot = await firestore
      .collection('coordinadores')
      .doc(coordinador)
      .get();
    if (!snapshot.exists)
      throw { message: 'no hay coordinador registrado con ese id' };
    if ((!parroquia && !capilla) || (parroquia && capilla))
      throw { message: 'group needs capilla OR parroquia' };
  } catch (err) {
    return res.send({
      error: true,
      message: err.message,
    });
  }

  //validate parroquia
  if (parroquia) {
    const snapshot = await firestore
      .collection('parroquias')
      .doc(parroquia)
      .get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'no hay parroquia con ese id',
      });
    }
  }
  //validate capilla
  if (capilla) {
    const snapshot = await firestore.collection('capillas').doc(capilla).get();
    if (!snapshot.exists) {
      return res.send({
        error: true,
        message: 'no hay capilla con ese id',
      });
    }
  }
  let newGroup = {
    nombre: name,
    coordinador,
    fecha_creada: new Date(),
  };
  if (capilla) newGroup.capilla = capilla;

  if (parroquia) newGroup.parroquia = parroquia;

  const docref = await firestore.collection('grupos').add(newGroup);
  newGroup.id = docref.id;
  res.send({
    error: false,
    data: newGroup,
  });
};

/**
 * Edits the fields of an specific group
 */
const edit = async (firestore, req, res) => {
  var { id, nombre, parroquia, capilla } = req.body;

  var data = { nombre };
  if (capilla) {
    data.capilla = capilla;
    data.parroquia = FieldValue.delete();
  } else {
    data.parroquia = parroquia;
    data.capilla = FieldValue.delete();
  }

  // CHECK IF HAS ACCESS
  try {
    // Checar si tiene acceso a editar el grupo
    if (!req.user.admin) {
      // Checar si no es admin
      var grupoSnap = await firestore.collection('grupos').doc(id);
      var grupo = grupoSnap.get();
      if (!grupo.exists)
        return res.send({ error: true, message: 'Grupo no existe.' });

      // Checar si el grupo pertenece al usuario.
      if (grupo.data().coordinador != req.user.id) {
        return res.send({
          error: true,
          message: 'No tienes acceso a este grupo.',
        });
      }
    }
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }

  // DO UPDATE
  try {
    await firestore.collection('grupos').doc(id).update(data);
    return res.send({
      error: false,
      data: true,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Removes a group from the group collection
 */
const remove = async (firestore, req, res) => {
  var { id } = req.params;
  try {
    var grupoSnap = await firestore.collection('grupos').doc(id);
    // Checar si tiene acceso a editar el grupo
    if (!req.user.admin) {
      // Checar si no es admin
      var grupo = grupoSnap.get();
      if (!grupo.exists)
        return res.send({ error: true, message: 'Grupo no existe.' });

      // Checar si el grupo pertenece al usuario.
      if (grupo.data().coordinador != req.user.id) {
        return res.send({
          error: true,
          message: 'No tienes acceso a este grupo.',
        });
      }
    }

    // Eliminar miembros
    let batch = firestore.batch();
    const memberSnap = await firestore
      .collection('miembros')
      .where('grupo', '==', id)
      .get();
    memberSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Eliminar grupo
    await grupoSnap.delete();

    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Changes the 'coordinador' field of an specific group
 */
const changeCoordinador = async (firestore, req, res) => {
  var { id } = req.params;
  var { coordinador } = req.body;
  try {
    var grupoSnap = await firestore.collection('grupos').doc(id);
    // Checar si tiene acceso a editar el grupo
    if (!req.user.admin) {
      // Checar si no es admin
      var grupo = grupoSnap.get();
      if (!grupo.exists)
        return res.send({ error: true, message: 'Grupo no existe.' });

      // Checar si el grupo pertenece al usuario.
      if (req.user.tipo == 'coordinador') {
        if (grupo.data().coordinador != req.user.id) {
          return res.send({
            error: true,
            message: 'No tienes acceso a este grupo.',
          });
        }
      } else if (
        req.user.tipo == 'acompañante_decanato' ||
        req.user.tipo == 'acompañante_zona'
      ) {
        return res.send({
          error: true,
          message: 'No tienes acceso a este grupo.',
        });
        // var parroquiaSnap = await firestore.collection('parroquia').doc(grupo.data().parroquia).get()
        // if(!parroquiaSnap.exists) return res.send({ error: true, message: 'No tienes acceso a este grupo.' });
        // if(req.user.tipo=='acompañante_decanato'){
        //     if(parroquiaSnap)
        // }
      }
    }

    const coordSnap = await firestore
      .collection('coordinadores')
      .doc(coordinador)
      .get();
    if (!coordSnap.exists)
      return res.send({ error: true, message: 'El coordinador no existe.' });

    await grupoSnap.update({ coordinador });

    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Adds a new member to the 'Miembros' collection and assigns it a group.
 */
const addMember = async (firestore, req, res) => {
  var {
    grupo,
    nombre,
    apellido_paterno,
    apellido_materno,
    estado_civil,
    sexo,
    email,
    fecha_nacimiento,
    escolaridad,
    oficio,
    domicilio,
    laptop,
    smartphone,
    tablet,
    facebook,
    twitter,
    instagram,
    ficha_medica,
  } = req.body;

  var fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment();

  try {
    var groupSnap = await firestore.collection('grupos').doc(grupo).get();
    if (!groupSnap.exists)
      return res.send({ error: true, message: 'Grupo no existe.', code: 1 });

    if (!req.user.admin && req.user.id != groupSnap.data().coordinador) {
      return res.send({
        error: true,
        code: 999,
        message: 'No tienes acceso a esta acción',
      });
    }

    var new_member = {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento: fn,
      sexo,
      estado_civil,
      email,
      escolaridad,
      oficio,
      domicilio,
      grupo,
      estatus: 0, // 0 = Activo, 1 = Baja Temporal, 2 = Baja definitiva,
      fecha_registro: new Date(),
      laptop,
      smartphone,
      tablet,
      facebook,
      twitter,
      instagram,
      ficha_medica,
    };
    var memberRef = await firestore.collection('miembros').add(new_member);
    new_member.id = memberRef.id;
    // await firestore.collection("grupos").doc(grupo).update({
    //     miembros: [...groupSnap.get('miembros'), new_member.id]
    // });

    return res.send({
      error: false,
      data: new_member,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Retrieves the data of an specific member
 */
const getMember = async (firestore, req, res) => {
  var id = req.params.id;
  try {
    var memberSnap = await firestore.collection('miembros').doc(id).get();
    if (!memberSnap.exists)
      return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
    var member = memberSnap.data();
    return res.send({
      error: false,
      data: member,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Edits the data of a member
 */
const editMember = async (firestore, req, res) => {
  var id = req.params.id;
  var {
    nombre,
    apellido_paterno,
    apellido_materno,
    estado_civil,
    sexo,
    email,
    fecha_nacimiento,
    escolaridad,
    oficio,
    domicilio,
    laptop,
    smartphone,
    tablet,
    facebook,
    twitter,
    instagram,
  } = req.body;

  var fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment();

  try {
    var miembroSnap = await firestore.collection('miembros').doc(id).get();
    if (!miembroSnap.exists)
      return res.send({ error: true, message: 'No existe el miembro' });
    var miembro = miembroSnap.data();

    var groupSnap = await firestore
      .collection('grupos')
      .doc(miembro.grupo)
      .get();
    if (!groupSnap.exists)
      return res.send({ error: true, message: 'El grupo no existe' });

    if (!req.user.admin && req.user.id != groupSnap.data().coordinador) {
      return res.send({
        error: true,
        code: 999,
        message: 'No tienes acceso a esta acción',
      });
    }
    await firestore.collection('miembros').doc(id).update({
      nombre,
      apellido_paterno,
      apellido_materno,
      estado_civil,
      sexo,
      email,
      fecha_nacimiento: fn,
      escolaridad,
      oficio,
      domicilio,
      laptop,
      smartphone,
      tablet,
      facebook,
      twitter,
      instagram,
    });
    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * Edits the group a member belongs to.
 */
const editMemberGroup = async (firestore, req, res) => {
  var miembro_id = req.params.id;
  var { grupo_id } = req.body;
  try {
    var groupSnap = await firestore
      .collection('grupos')
      .doc(grupo_id)
      .get('miembros');
    if (!groupSnap.exists)
      return res.send({ error: true, message: 'Grupo no existe.', code: 1 });
    var memberSnap = await firestore
      .collection('miembros')
      .doc(miembro_id)
      .get('nombre');
    if (!memberSnap.exists)
      return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
    await firestore
      .collection('miembros')
      .doc(miembro_id)
      .update({ grupo: grupo_id });
    return res.send({
      error: false,
      data: req.body,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Edits the status of a member
 */
const editMemberStatus = async (firestore, req, res) => {
  var id = req.params.id;
  var { status } = req.body;
  try {
    var miembroSnap = await firestore.collection('miembros').doc(id).get();
    if (!miembroSnap.exists)
      return res.send({ error: true, message: 'No existe el miembro' });
    var miembro = miembroSnap.data();

    var groupSnap = await firestore
      .collection('grupos')
      .doc(miembro.grupo)
      .get();
    if (!groupSnap.exists)
      return res.send({ error: true, message: 'El grupo no existe' });

    if (!req.user.admin && req.user.id != groupSnap.data().coordinador) {
      return res.send({
        error: true,
        code: 999,
        message: 'No tienes acceso a esta acción',
      });
    }

    await firestore.collection('miembros').doc(id).update({ estatus: status });
    return res.send({
      error: false,
      data: true,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Retrieves an assistance list from the assitance collection
 */
const getAsistencia = async (firestore, req, res) => {
  var { id, fecha } = req.params;
  try {
    var assist = await firestore
      .collection('grupos/' + id + '/asistencias')
      .doc(fecha)
      .get();
    if (!assist.exists) {
      return res.send({
        error: true,
        code: 34, // Arbitrary number
        message: 'No such assistance',
      });
    }
    var groupSnap = await firestore.collection('grupos').doc(id).get();
    if (!groupSnap.exists)
      return res.send({ error: true, message: 'Grupo no existe.', code: 1 });

    var asistentes = assist.get('miembros');
    var miembros = [];
    if (asistentes.length != 0) {
      const asistSnap = await firestore.getAll(
        ...asistentes.map((a) => firestore.doc('miembros/' + a))
      );
      asistSnap.forEach((a) => {
        if (a.exists) {
          var m = a.data();
          miembros.push({
            id: a.id,
            nombre: m.nombre,
            apellido_paterno: m.apellido_paterno,
            apellido_materno: m.apellido_materno,
            assist: assist.get('miembros').findIndex((b) => b == a.id) != -1,
          });
        }
      });
    }

    var miembrosSnap = await firestore
      .collection('miembros')
      .where('grupo', '==', groupSnap.id)
      .where('estatus', '==', 0)
      .get();
    miembrosSnap.forEach((a) => {
      if (!a.exists) return;
      if (asistentes.findIndex((b) => b == a.id) != -1) return;
      var m = a.data();
      miembros.push({
        id: a.id,
        nombre: m.nombre,
        apellido_paterno: m.apellido_paterno,
        apellido_materno: m.apellido_materno,
        assist: false,
      });
    });

    var agenda = assist.get('agenda');
    var commentarios = assist.get('commentarios');

    return res.send({
      error: false,
      data: { miembros, agenda, commentarios },
    });
  } catch (err) {
    console.error(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Retrieves an assistance list from the assitance collection
 */
const registerAsistencia = async (firestore, req, res) => {
  var id = req.params.id;
  var { fecha, miembros, force, agenda, commentarios } = req.body;

  var date = moment(fecha, 'YYYY-MM-DD');
  if (!date.isValid()) {
    return res.send({ error: true, message: 'Invalid date' });
  }

  var group = await firestore.collection('grupos').doc(id).get();
  if (!group.exists) {
    return res.send({
      error: true,
      message: 'Group doesnt exist',
    });
  }

  if (!force) {
    var oldAssistance = await await firestore
      .collection('grupos/' + id + '/asistencias')
      .doc(fecha)
      .get();
    if (oldAssistance.exists) {
      return res.send({
        error: true,
        code: 52, // Arbitrary number
        message: 'Assistance of that date already exists.',
      });
    }
  }

  try {
    await firestore
      .collection('grupos/' + id + '/asistencias')
      .doc(date.format('YYYY-MM-DD'))
      .set({ miembros, agenda, commentarios });
    return res.send({
      error: false,
      data: date.format('YYYY-MM-DD'),
    });
  } catch (err) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Retrieves an assistance list from the assitance collection
 */
const saveAsistencia = async (firestore, req, res) => {
  var { id, fecha } = req.params;
  var { miembros, agenda, commentarios } = req.body;

  var date = moment(fecha, 'YYYY-MM-DD');
  if (!date.isValid()) {
    return res.send({ error: true, message: 'Invalid date' });
  }

  try {
    if (!miembros || miembros.length == 0) {
      await firestore
        .collection('grupos/' + id + '/asistencias')
        .doc(date.format('YYYY-MM-DD'))
        .delete();
      return res.send({
        error: false,
        data: { deleted: true, date: date.format('YYYY-MM-DD') },
      });
    } else {
      await firestore
        .collection('grupos/' + id + '/asistencias')
        .doc(date.format('YYYY-MM-DD'))
        .set({ miembros, agenda, commentarios });
      return res.send({
        error: false,
        data: { deleted: false, date: date.format('YYYY-MM-DD') },
      });
    }
  } catch (e) {
    console.error(e);
    return res.send({
      error: true,
      message: 'Unexpected error.',
    });
  }
};

/**
 * Edits the ficha Medica data from a member.
 */
const editMemberFicha = async (firestore, req, res) => {
  var {
    tipo_sangre,
    servicio_medico,
    alergico,
    alergico_desc,
    p_cardiovascular,
    p_azucar,
    p_hipertension,
    p_sobrepeso,
    seguridad_social,
    discapacidad,
    discapacidad_desc,
    ambulancia,
  } = req.body;
  var id = req.params.id;
  try {
    var memberSnap = await firestore
      .collection('miembros')
      .doc(id)
      .get('nombre');
    if (!memberSnap.exists)
      return res.send({ error: true, message: 'Miembro no existe.', code: 1 });
    ficha_medica = {
      tipo_sangre: tipo_sangre,
      servicio_medico: servicio_medico,
      alergico: alergico,
      alergico_desc: alergico_desc,
      p_cardiovascular: p_cardiovascular,
      p_azucar: p_azucar,
      p_hipertension: p_hipertension,
      p_sobrepeso: p_sobrepeso,
      seguridad_social: seguridad_social,
      discapacidad: discapacidad,
      discapacidad_desc: discapacidad_desc,
      ambulancia: ambulancia,
    };
    await firestore.collection('miembros').doc(id).update({ ficha_medica });
    return res.send({
      error: false,
      data: ficha_medica,
    });
  } catch (err) {
    console.log(err);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * Generates a report that can be converted to an excel document of an asitance list.
 */
const getAsistenciasReport = async (firestore, req, res) => {
  var miembros = await firestore
    .collection('miembros')
    .where('grupo', '==', req.params.id)
    .get();
  var headers = [
    'IDGrupo',
    'IDMiembro',
    'Nombre',
    'Apellido Paterno',
    'Apellido Materno',
    'Fecha Nacimiento',
    'Fecha registro',
    'Correo electrónico',
    'Sexo',
    'Escolaridad',
    'Oficio',
    'Estado Civil',
    'Estatus',
    'Domicilio',
    'Colonia',
    'Municipio',
    'Telefono Movil',
    'Telefono Casa',
    'Ambulancia',
    'Alergico',
    'Tipo Sangre',
    'Servicio Medico',
    'Padecimientos',
  ];
  var values = [];
  for (var i of miembros.docs) {
    if (!i.exists) continue;
    var d = i.data();
    if (d.estatus >= 2) continue;
    values.push([
      d.grupo,
      i.id,
      d.nombre,
      d.apellido_paterno,
      d.apellido_materno,
      d.fecha_nacimiento && d.fecha_nacimiento._seconds
        ? moment.unix(d.fecha_nacimiento._seconds).format('YYYY-MM-DD')
        : '',
      d.fecha_registro && d.fecha_registro._seconds
        ? moment.unix(d.fecha_registro._seconds).format('YYYY-MM-DD')
        : '',
      d.email,
      d.sexo,
      d.escolaridad,
      d.oficio,
      d.estado_civil,
      d.estatus == 0
        ? 'Activo'
        : d.estatus == 1
        ? 'Baja temporal'
        : 'Baja definitiva',
      d.domicilio.domicilio,
      d.domicilio.colonia,
      d.domicilio.municipio,
      d.domicilio.telefono_movil,
      d.domicilio.telefono_casa,
      ...(d.ficha_medica
        ? [
            d.ficha_medica.ambulancia ? 'SI' : 'NO',
            d.ficha_medica.alergico ? 'SI' : 'NO',
            d.ficha_medica.tipo_sangre,
            d.ficha_medica.servicio_medico,
            d.ficha_medica.padecimientos,
          ]
        : ['', '', '', '', '']),
    ]);
  }

  var csv = Util.toXLS(headers, values);

  var name = req.params.id;
  try {
    var group = await firestore.collection('grupos').doc(req.params.id).get();
    if (group.exists) {
      name = group.data().nombre;
    }
  } catch (e) {}

  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.attachment('Miembros-' + name.replace(/ /g, '_') + '.xls');

  return csv.pipe(res);
};

/**
 * Get asistance by group
 */
const getAsistenciasAsistanceReport = async (firestore, req, res) => {
  var groupRef = await firestore.collection('grupos').doc(req.params.id);
  var assistColl = await groupRef.collection('asistencias');
  var assistList = await assistColl.get();
  var dates = [];

  assistList.docs.forEach((a) => {
    if (!a.exists) return;
    const data = a.data();

    dates.push({
      date: a.id,
      members: data.miembros,
      agenda: data.agenda ? data.agenda : '',
      commentarios: data.commentarios ? data.commentarios : '',
    });
  });

  var memSnap = await firestore
    .collection('miembros')
    .where('grupo', '==', req.params.id)
    .get();

  var members = [];
  memSnap.docs.forEach((a) => {
    if (a.exists) {
      var m = a.data();
      members.push({
        id: a.id,
        nombre: m.nombre,
        apellido_paterno: m.apellido_paterno,
        apellido_materno: m.apellido_materno,
      });
    }
  });

  var headers = [
    'IDGrupo',
    'IDMiembro',
    'Nombre',
    'Apellido Paterno',
    'Apellido Materno',
    ...dates.map((a) => a.date),
  ];
  var values = [];

  var headersSh2 = ['Fecha', 'Agenda', 'Comentarios Finales'];
  var valuesSh2 = [];

  for (var i of members) {
    var date_assistance = dates.map((a) =>
      a.members.findIndex((v) => v == i.id) != -1 ? 'X' : ''
    );

    values.push([
      req.params.id,
      i.id,
      i.nombre,
      i.apellido_paterno,
      i.apellido_materno,
      ...date_assistance,
    ]);
  }

  dates.forEach((d) => {
    valuesSh2.push([d.date, d.agenda, d.commentarios]);
  });

  var name = req.params.id;
  try {
    var group = await groupRef.get();
    if (group.exists) {
      name = group.data().nombre;
    }
  } catch (e) {}

  var xls = Util.toXLS2sheets(headers, values, headersSh2, valuesSh2);
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.attachment('Asistencia-' + name.replace(/ /g, '_') + '.xls');
  return xls.pipe(res);
};

/**
 * Converts the data to be used in a csv file.
 */
var dump = async (firestore, req, res) => {
  try {
    var gruposSnap = await firestore.collection('grupos').get();

    var coordIds = [
      ...new Set(
        gruposSnap.docs
          .map((a) => a.data().coordinador)
          .filter((a) => (a ? true : false))
      ),
    ];
    var coordinadores = [];
    if (coordIds.length > 0) {
      var coordSnap = await firestore.getAll(
        ...coordIds.map((a) => firestore.doc('coordinadores/' + a))
      );
      coordSnap.forEach((a) => {
        if (!a.exists) return;
        coordinadores.push({
          id: a.id,
          ...a.data(),
        });
      });
    }

    var parroquiaId = [
      ...new Set(
        gruposSnap.docs
          .map((a) => a.data().parroquia)
          .filter((a) => (a ? true : false))
      ),
    ];
    var capillaId = [
      ...new Set(
        gruposSnap.docs
          .map((a) => a.data().capilla)
          .filter((a) => (a ? true : false))
      ),
    ];

    var parroquias = [];
    var capillas = [];
    if (parroquiaId.length > 0) {
      var parrSnap = await firestore.getAll(
        ...parroquiaId.map((a) => firestore.doc('parroquias/' + a))
      );
      parrSnap.forEach((a) => {
        if (!a.exists) return;
        parroquias.push({
          id: a.id,
          ...a.data(),
        });
      });
    }

    if (capillaId.length > 0) {
      var capSnap = await firestore.getAll(
        ...capillaId.map((a) => firestore.doc('capillas/' + a))
      );
      capSnap.forEach((a) => {
        if (!a.exists) return;
        capillas.push({
          id: a.id,
          ...a.data(),
        });
      });
    }

    var grupos = [];
    gruposSnap.docs.forEach((a) => {
      if (!a.exists) return;
      var d = a.data();
      var c = d.capilla ? capillas.find((a) => a.id == d.capilla) : null;
      var p = d.parroquia ? parroquias.find((a) => a.id == d.parroquia) : null;
      var coord = coordinadores.find((a) => a.id == d.coordinador);
      grupos.push([
        a.id,
        d.nombre,
        d.fecha_creada && d.fecha_creada._seconds
          ? moment.unix(d.fecha_creada._seconds).format('YYYY-MM-DD')
          : '',
        coord.id,
        `${coord.nombre} ${coord.apellido_paterno} ${coord.apellido_materno}`,
        c ? 'Capilla' : 'Parroquia',
        ...(!p ? ['', ''] : [p.id, p.nombre]),
        ...(!c ? ['', ''] : [c.id, c.nombre]),
      ]);
    });

    var headers = [
      'IDGrupo',
      'Nombre',
      'Fecha creación',
      'IDCoordinador',
      'Coordinador',
      'Pertenece a',
      'IDParroquia',
      'Nombre Parroquia',
      'IDCapilla',
      'IDCapilla',
    ];
    var csv = Util.toXLS(headers, grupos);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Grupos.xls');
    return csv.pipe(res);
  } catch (e) {
    return res.redirect('back');
  }
};

module.exports = {
  getall,
  getForAcompanante,
  getone,
  edit,
  add,
  remove,
  addMember,
  editMember,
  editMemberGroup,
  editMemberStatus,
  getMember,
  getAsistencia,
  registerAsistencia,
  saveAsistencia,
  changeCoordinador,
  editMemberFicha,
  getBajasTemporales,
  getAsistenciasReport,
  getAsistenciasAsistanceReport,
  dump,
};
