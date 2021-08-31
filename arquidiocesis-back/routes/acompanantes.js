/**
 * Module for managing 'Admins'
 * @module Admin
 */

const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const admin = require('firebase-admin');
/**
 * /
 * Gets all data in the acompañantes collection
 */
const getAll = async (firestore, req, res) => {
  const acompanantes_snap = await firestore.collection('acompanantes').get();
  const acompanantes = acompanantes_snap.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
  acompanantes.forEach((a) => {
    if (a.fecha_nacimiento && a.fecha_nacimiento._seconds) {
      a.fecha_nacimiento = moment
        .unix(a.fecha_nacimiento._seconds)
        .format('YYYY-MM-DD');
    }
  });

  return res.send({
    error: false,
    data: acompanantes,
  });
};

/**
 * /
 * Gets the zona or decanato belonging to an acompanante
 */
const getZonaOrDecanato = async (firestore, req, res) => {
  console.log('getZonaOrDecanato start');
  const { id } = req.params;

  if (!id) {
    return res.send({
      error: true,
      message: 'Es necesario el ID del acompañante.',
    });
  }

  try {
    const zona = await firestore
      .collection('zonas')
      .where('acompanante', '==', id)
      .get();

    if (!zona.empty) {
      return res.send({
        error: false,
        data: {
          zona: {
            id: zona.docs[0].id,
            ...zona.docs[0].data(),
          },
        },
      });
    }

    const decanato = await firestore
      .collection('decanatos')
      .where('acompanante', '==', id)
      .get();

    if (!decanato.empty) {
      return res.send({
        error: false,
        data: {
          decanato: {
            id: decanato.docs[0].id,
            ...decanato.docs[0].data(),
          },
        },
      });
    }

    return res.send({
      error: false,
      data: {},
    });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * /
 * Gets data from an specific acompanante
 */
const getone = async (firestore, req, res) => {
  const { id } = req.params;
  try {
    const acompanante = await firestore
      .collection('acompanantes')
      .doc(id)
      .get();
    if (!acompanante.exists)
      return res.send({
        error: true,
        message: 'No existe ese acompañanate.',
        code: 910,
      });
    return res.send({
      error: false,
      data: {
        id: acompanante.id,
        ...acompanante.data(),
      },
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

/**
 * /
 * Assigns the acompanante to an specific zone
 */
const addZona = async (firestore, req, res) => {
  console.log('addZona start', req.body);
  const {
    zona,
    nombre,
    apellido_paterno,
    apellido_materno,
    estado_civil,
    sexo,
    fecha_nacimiento,
    escolaridad,
    oficio,
    domicilio,
    email,
    password,
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  let fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment().toDate();

  try {
    const zonaSnap = await firestore.collection('zonas').doc(zona).get();
    if (!zonaSnap.exists)
      return res.send({ error: true, message: 'Zona no existe.' });
    const zona_data = zonaSnap.data();
    if (zona_data.acompanante)
      return res.send({
        error: true,
        message: 'La zona ya tiene un acompañanate',
        code: 1283,
      });

    const prev_login = await firestore
      .collection('logins')
      .doc(email.toLowerCase().trim())
      .get();
    if (prev_login.exists) {
      return res.send({
        error: true,
        code: 623,
        message: 'Usuario con ese correo ya existe.',
      });
    }

    const new_acompanante = {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento: fn,
      sexo,
      estado_civil,
      escolaridad,
      oficio,
      domicilio,
      email,
    };

    const naRef = await firestore
      .collection('acompanantes')
      .add(new_acompanante);
    await firestore.collection('zonas').doc(zona).update({
      acompanante: naRef.id,
    });
    const login = {
      id: naRef.id,
      password: bcrypt.hashSync(password),
      tipo: 'acompañante_zona',
    };
    await firestore
      .collection('logins')
      .doc(email.toLowerCase().trim())
      .set(login);

    const new_user = await firestore.collection('users').add(new_acompanante);
    const role = await firestore.collection('roles').doc('acompañante_zona');

    await role.update({
      members: admin.firestore.FieldValue.arrayUnion(...[new_user.id]),
    });

    return res.send({
      error: false,
      data: naRef.id,
    });
  } catch (e) {
    console.log(e);
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * /
 * Assigns the acompanante to an specific decanato
 */
const addDecanato = async (firestore, req, res) => {
  const {
    decanato,
    nombre,
    apellido_paterno,
    apellido_materno,
    estado_civil,
    sexo,
    fecha_nacimiento,
    escolaridad,
    oficio,
    domicilio,
    email,
    password,
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  let fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment().toDate();

  try {
    const decanatoSnap = await firestore
      .collection('decanatos')
      .doc(decanato)
      .get();
    if (!decanatoSnap.exists)
      return res.send({ error: true, message: 'Decanato no existe.' });
    const decanato_data = decanatoSnap.data();
    if (decanato_data.acompanante)
      return res.send({
        error: true,
        message: 'El decanato ya tiene un acompañanate',
        code: 1283,
      });

    const prev_login = await firestore
      .collection('logins')
      .doc(email.toLowerCase().trim())
      .get();
    if (prev_login.exists) {
      return res.send({
        error: true,
        code: 623,
        message: 'Usuario con ese correo ya existe.',
      });
    }

    const new_acompanante = {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento: fn,
      sexo,
      estado_civil,
      escolaridad,
      oficio,
      domicilio,
      email,
    };

    const naRef = await firestore
      .collection('acompanantes')
      .add(new_acompanante);
    await firestore.collection('decanatos').doc(decanato).update({
      acompanante: naRef.id,
    });
    const login = {
      id: naRef.id,
      password: bcrypt.hashSync(password),
      tipo: 'acompañante_decanato',
    };
    await firestore
      .collection('logins')
      .doc(email.toLowerCase().trim())
      .set(login);

    const new_user = await firestore.collection('users').add(new_acompanante);
    const role = await firestore
      .collection('roles')
      .doc('acompañante_decanato');

    await role.update({
      members: admin.firestore.FieldValue.arrayUnion(...[new_user.id]),
    });

    return res.send({
      error: false,
      data: naRef.id,
    });
  } catch (e) {
    console.log(e);
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * /
 * Unassings the acompanante to an specific zone
 */
const removeZona = async (firestore, req, res) => {
  const { id } = req.params;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  try {
    const zonaSnap = await firestore.collection('zonas').doc(id).get();
    if (!zonaSnap.exists)
      return res.send({ error: true, message: 'Zona no existe.' });
    const zona_data = zonaSnap.data();
    if (!zona_data.acompanante) return res.send({ error: false, data: true });

    const logins = await firestore
      .collection('logins')
      .where('id', '==', zona_data.acompanante)
      .where('tipo', '==', 'acompañante_zona')
      .get();

    const batch = firestore.batch();
    logins.docs.forEach((a) => {
      batch.delete(a.ref);
    });
    await batch.commit();

    await firestore
      .collection('acompanantes')
      .doc(zona_data.acompanante)
      .delete();
    await firestore.collection('zonas').doc(id).update({
      acompanante: null,
    });
    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    console.log(e);
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * /
 * Unassings the acompanante to an specific decanato
 */
const removeDecanato = async (firestore, req, res) => {
  const { id } = req.params;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  try {
    const decanatoSnap = await firestore.collection('decanatos').doc(id).get();
    if (!decanatoSnap.exists)
      return res.send({ error: true, message: 'Decanato no existe.' });
    const dec_data = decanatoSnap.data();
    if (!dec_data.acompanante) return res.send({ error: false, data: true });

    const logins = await firestore
      .collection('logins')
      .where('id', '==', dec_data.acompanante)
      .where('tipo', '==', 'acompañante_decanato')
      .get();

    const batch = firestore.batch();
    logins.docs.forEach((a) => {
      batch.delete(a.ref);
    });
    await batch.commit();

    await firestore
      .collection('acompanantes')
      .doc(dec_data.acompanante)
      .delete();
    await firestore.collection('decanatos').doc(id).update({
      acompanante: null,
    });
    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    console.log(e);
    return res.send({
      error: true,
      message: 'Error inesperado',
    });
  }
};

/**
 * /
 * Edits data from an specific acompanante
 */
const edit = async (firestore, req, res) => {
  const {
    id,
    nombre,
    apellido_paterno,
    apellido_materno,
    estado_civil,
    sexo,
    fecha_nacimiento,
    escolaridad,
    oficio,
    domicilio,
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  let fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment().toDate();

  const new_acompanante = {
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento: fn,
    sexo,
    estado_civil,
    escolaridad,
    oficio,
    domicilio,
  };

  try {
    const acompanante = await firestore
      .collection('acompanantes')
      .doc(id)
      .update(new_acompanante);
    const user = (
      await firestore
        .collection('users')
        .where('email', '==', acompanante.data().email)
        .get()
    ).docs[0];
    if (user == null) {
      throw Error('Usuario no encontrado');
    }
    await user.ref.update({
      new_acompanante,
    });

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

module.exports = {
  getAll,
  getZonaOrDecanato,
  getone,
  addZona,
  addDecanato,
  removeZona,
  removeDecanato,
  edit,
};
