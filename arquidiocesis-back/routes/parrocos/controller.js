/**
 * Module for managing parrocos
 * @module Parroco
 */
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment-timezone');
const admin = require('firebase-admin');

/**
 * Gets all the documents in the 'parrocos' collection
 * @param {firebase.firestore} firestore - preinitialized admin-firebase.firestore() instance
 * @param {POST} req
 * @param {String} req.body.token
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - True if there was an error else false
 * @param {String} [res.message] - only assigned if there was an error, contains the error message
 * @param {Parroco[]} [res.data] - If there was no error, will be assigned
 * @param {String} res.data[].id
 * @param {String} res.data[].nombre
 * @param {String} res.data[].apellido_paterno
 * @param {String} res.data[].apellido_materno
 * @param {String} res.data[].parroquia
 */
exports.getAll = async (firestore, req, res) => {
  try {
    const snapshot = await firestore.collection('parrocos').get();
    const docs = snapshot.docs.map((doc) => {
      return {
        id: doc.id,
        nombre: doc.data().nombre,
        apellido_paterno: doc.data().apellido_paterno,
        parroquia: doc.data().parroquia,
        apellido_materno: doc.data().apellido_materno,
      };
    });
    res.send({
      error: false,
      data: docs,
    });
  } catch (err) {
    res.send({
      error: true,
      message: 'Error inesperado al obtener párrocos.',
    });
  }
};

/**
 * Gets the document in the 'parrocos' collection with the provided information in the request.body
 * @param {firebase.firestore} firestore - preinitialized admin-firebase.firestore() instance
 * @param {POST} req
 * @param {String} req.body.token
 * @param {String} req.params.id
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - True if there was an error else false
 * @param {String} [res.message] - only assigned if there was an error, contains the error message
 * @param {Parroco[]} [res.data] - If there was no error, will be assigned
 * @param {String} res.data[].id
 * @param {String} res.data[].nombre
 * @param {String} res.data[].apellido_paterno
 * @param {String} res.data[].apellido_materno
 */
exports.getOne = async (firestore, req, res) => {
  try {
    const snapshot = await firestore
      .collection('parrocos')
      .doc(req.params.id)
      .get();
    if (!snapshot.exists)
      return res.send({
        error: true,
        message: 'Párroco no existe.',
      });

    const parroco = snapshot.data();
    parroco.id = snapshot.id;

    return res.send({
      error: false,
      data: parroco,
    });
  } catch (err) {
    res.send({
      error: true,
      message: 'Error inesperado al obtener párroco.',
    });
  }
};

/**
 * Adds a new document in the 'parrocos' and 'logins' collections with the provided information in the request.body
 * @param {firebase.firestore} firestore - preinitialized admin-firebase.firestore() instance
 * @param {POST} req
 * @param {String} req.body.token
 * @param {String} req.body.nombre
 * @param {String} req.body.apellido_paterno
 * @param {String} req.body.apellido_materno
 * @param {String} req.body.email
 * @param {String} req.body.password
 * @param {String} req.body.fecha_nacimiento
 * @param {String} req.body.fecha_ordenamiento
 * @param {String} req.body.parroquia
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - True if there was an error else false
 * @param {String} [res.message] - only assigned if there was an error, contains the error message
 * @param {JSON} [res.data] - If there was no error, will be be assigned
 * @param {String} res.data.nombre
 * @param {String} res.data.apellido_paterno
 * @param {String} res.data.apellido_materno
 * @param {String} res.data.email
 * @param {String} res.data.fecha_nacimiento
 * @param {String} res.data.fecha_ordenamiento
 * @param {String} res.data.telefono_movil
 * @param {String} res.data.parroquia
 */
exports.add = async (firestore, req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    email,
    password,
    fecha_nacimiento,
    fecha_ordenamiento,
    telefono_movil,
    parroquia = '',
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción.',
    });
  }

  try {
    const checkEmail = await firestore
      .collection('logins')
      .doc(email.toLowerCase())
      .get();
    if (checkEmail.exists)
      return res.send({
        error: true,
        code: 1,
        message: 'Correo ya utilizado.',
      });

    let fn = moment(fecha_nacimiento, 'YYYY-MM-DD')
      .tz('America/Monterrey')
      .startOf('day');
    if (!fn.isValid()) fn = moment();

    let fo = moment(fecha_ordenamiento, 'YYYY-MM-DD')
      .tz('America/Monterrey')
      .startOf('day');
    if (!fo.isValid()) fo = moment();

    // TODO: (kike) Check if there is an id for parroco.
    // // Validate if a coordinador with identificador exists
    // const coordinador = await firestore
    //   .collection('coordinadores')
    //   .where('identificador', '==', identificador)
    //   .get();
    // if (!coordinador.empty) {
    //   return res.send({
    //     error: true,
    //     message: 'Ya existe un coordinador con el identificador proporcionado.',
    //   });
    // }

    const newParroco = {
      nombre,
      apellido_paterno,
      apellido_materno,
      email,
      fecha_nacimiento: fn,
      fecha_ordenamiento: fo,
      telefono_movil,
      parroquia,
    };

    const newLogin = {
      password: bcrypt.hashSync(password),
      tipo: 'parroco',
      id: null,
    };

    const docref = await firestore.collection('parrocos').add(newParroco);
    newLogin.id = docref.id;
    await firestore.collection('logins').doc(email.toLowerCase()).set(newLogin);

    const new_user = await firestore.collection('users').add(newParroco);
    const role = await firestore.collection('roles').doc('parroco');

    await role.update({
      members: admin.firestore.FieldValue.arrayUnion(...[new_user.id]),
    });

    return res.send({
      error: false,
      data: {
        id: docref.id,
        ...newParroco,
      },
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado al agregar párroco.',
    });
  }
};

/**
 * Edits a document in the 'parrocos' collections with the provided information in the request.body
 * @param {firebase.firestore} firestore - preinitialized admin-firebase.firestore() instance
 * @param {POST} req
 * @param {String} req.body.token
 * @param {String} req.body.nombre
 * @param {String} req.body.apellido_paterno
 * @param {String} req.body.apellido_materno
 * @param {String} req.body.email
 * @param {String} req.body.password
 * @param {String} req.body.fecha_nacimiento
 * @param {String} req.body.fecha_ordenamiento
 * @param {String} req.body.telefono_movil
 * @param {String} req.body.parroquia
 *
 * @param {JSON} res - Status 200
 * @param {Bool} res.error - True if there was an error else false
 * @param {String} [res.message] - only assigned if there was an error, contains the error message
 * @param {Boolean} [res.data] - If there was no error, will be be assigned
 */
exports.edit = async (firestore, req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    fecha_ordenamiento,
    telefono_movil,
    parroquia = '',
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción.',
    });
  }

  try {
    const ref = firestore.collection('parrocos').doc(req.params.id);
    const snapshot = await ref.get();
    if (!snapshot.exists)
      return res.send({
        error: true,
        message: 'Párroco no existe.',
      });

    let fn = moment(fecha_nacimiento, 'YYYY-MM-DD')
      .tz('America/Monterrey')
      .startOf('day');
    if (!fn.isValid()) fn = moment();

    let fo = moment(fecha_ordenamiento, 'YYYY-MM-DD')
      .tz('America/Monterrey')
      .startOf('day');
    if (!fo.isValid()) fo = moment();

    // TODO: (kike) Check if there is an id for parroco.
    // // Validate if a coordinador with identificador exists
    // const coordinador = await firestore
    //   .collection('coordinadores')
    //   .where('identificador', '==', identificador)
    //   .get();
    // if (!coordinador.empty) {
    //   return res.send({
    //     error: true,
    //     message: 'Ya existe un coordinador con el identificador proporcionado.',
    //   });
    // }

    const editParroco = {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento: fn,
      fecha_ordenamiento: fo,
      telefono_movil,
      parroquia,
    };

    await ref.update(editParroco); // llamada asincrona para editar el documento de parroco.

    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado al editar al párroco.',
    });
  }
};
