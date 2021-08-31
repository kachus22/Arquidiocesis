/**
 * Module for managing Eventos
 * @module Evento
 */
const moment = require('moment');
const Util = require('./util');

/**
 * Gets all events documents for the list
 */
const getAll = async (firestore, req, res) => {
  console.log('eventos.getAll start');

  try {
    const snapshot = await firestore.collection('eventos').get();
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.send({ error: false, data: events });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({ error: true, message: err.message });
  }
};

/**
 * Adds a new event to the 'eventos' collection
 */
const add = async (firestore, req, res) => {
  console.log('eventos.add start', req.body);

  // Check if has access to add (is admin)
  if (!req.user.admin) {
    return res.send({
      error: true,
      message: 'No tienes acceso a esta accion',
    });
  }

  const { name, eventResponsible, eventDates } = req.body;

  try {
    const snapshot = await firestore
      .collection('eventos')
      .where('nombre', '==', name)
      .get();

    if (snapshot.docs.length > 0) {
      return res.send({
        error: true,
        message: 'Ya existe un evento con ese nombre.',
      });
    }

    const newEvent = {
      nombre: name,
      responsable: eventResponsible,
      fechas: eventDates,
      fecha_creada: new Date(),
    };

    const docref = await firestore.collection('eventos').add(newEvent);
    newEvent.id = docref.id;

    return res.send({
      error: false,
      data: newEvent,
    });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({ error: true, message: err.message });
  }
};

const remove = async (firestore, req, res) => {
  console.log('eventos.remove start', req.params);
  var { id } = req.params;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  try {
    const snapshot = await firestore
      .collection('eventos')
      .doc(id)
      .get('nombre');

    if (!snapshot.exists)
      return res.send({
        error: true,
        message: 'El evento no existe',
      });

    await firestore.collection('eventos').doc(id).delete();

    return res.send({ error: false, data: true });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({ error: true, message: 'Mensaje inesperado' });
  }
};

/**
 * Edits the fields of an specific event
 */
const edit = async (firestore, req, res) => {
  console.log('eventos.edit start', req.params.id, req.body);

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  const id = req.params.id;
  const eventData = req.body;

  try {
    // Verify if other event has the same name
    const snapshot = await firestore
      .collection('eventos')
      .where('nombre', '==', eventData.nombre)
      .get();

    snapshot.docs.forEach((doc) => {
      if (doc.id !== id) {
        throw Error('Ya existe un evento con ese nombre.');
      }
    });

    await firestore.collection('eventos').doc(id).update(eventData);
    return res.send({ error: false, data: true });
  } catch (error) {
    console.log('error :>> ', error);
    return res.send({
      error: true,
      message: error.message,
    });
  }
};

/**
 * Collects data from the eventos collection to transfer to an .csv document.
 */
const dump = async (firestore, req, res) => {
  var eventos = [];
  var headers = ['Evento', 'Responsable', 'Fechas', 'Fecha de creación'];
  try {
    var eventsSnap = await firestore.collection('eventos').get();
    if (eventsSnap.docs.length == 0) {
      var csv = toXLS(headers, []);
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.attachment('Eventos.xls');
      return csv.pipe(res);
    }

    eventsSnap.docs.forEach((ev) => {
      if (!ev.exists) return;
      var d = ev.data();
      eventos.push([
        d.nombre,
        d.responsable,
        d.fechas,
        d.fecha_creada && d.fecha_creada._seconds
          ? moment.unix(d.fecha_creada._seconds).format('YYYY-MM-DD')
          : '',
      ]);
    });

    var csv = Util.toXLS(headers, eventos);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.attachment('Eventos.xls');
    return csv.pipe(res);
  } catch (e) {
    console.log(e);
    return res.redirect('back');
  }
};

module.exports = {
  getAll,
  add,
  remove,
  edit,
  dump,
};
