const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const admin = require('firebase-admin');

const add = async (firestore, req, res) => {
  const {
    identificador,
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
    password,
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  const checkEmail = await firestore
    .collection('logins')
    .doc(email.toLowerCase())
    .get();
  if (checkEmail.exists)
    return res.send({ error: true, code: 1, message: 'Correo ya utilizado.' });

  let fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment();

  // Validate if a coordinador with identificador exists
  const coordinador = await firestore
    .collection('coordinadores')
    .where('identificador', '==', identificador)
    .get();

  if (!coordinador.empty) {
    return res.send({
      error: true,
      message: 'Ya existe un coordinador con el identificador proporcionado.',
    });
  }

  const newCoordinador = {
    identificador,
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
  };

  const newLogin = {
    password: bcrypt.hashSync(password),
    tipo: 'coordinador',
    id: null,
  };

  try {
    const docref = await firestore
      .collection('coordinadores')
      .add(newCoordinador);
    newLogin.id = docref.id;
    await firestore.collection('logins').doc(email.toLowerCase()).set(newLogin);

    const new_user = await firestore.collection('users').add(newCoordinador);
    const role = await firestore.collection('roles').doc('coordinador');

    await role.update({
      members: admin.firestore.FieldValue.arrayUnion(...[new_user.id]),
    });

    return res.send({
      error: false,
      data: {
        id: docref.id,
        ...newCoordinador,
      },
    });
  } catch (e) {
    console.log(e);
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

const getall = async (firestore, req, res) => {
  try {
    const snapshot = await firestore.collection('coordinadores').get();
    const coordinadores = [];
    snapshot.forEach((doc) => {
      const d = doc.data();
      coordinadores.push({
        id: doc.id,
        nombre: d.nombre,
        apellido_paterno: d.apellido_paterno,
        apellido_materno: d.apellido_materno,
        email: d.email,
      });
    });
    return res.send({
      error: false,
      data: coordinadores,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Error inesperado.',
    });
  }
};

const getone = async (firestore, req, res) => {
  try {
    const snapshot = await firestore
      .collection('coordinadores')
      .doc(req.params.id)
      .get();
    if (!snapshot.exists)
      return res.send({
        error: true,
        message: 'Coordinador no existe',
      });

    const coordinador = snapshot.data();
    coordinador.id = snapshot.id;
    coordinador.grupos = [];
    coordinador.decanatos = [];
    coordinador.parroquias = [];
    coordinador.capillas = [];
    let parroquias = new Set(),
      capillas = new Set(),
      decanatos = new Set();

    const groupSnap = await firestore
      .collection('grupos')
      .where('coordinador', '==', snapshot.id)
      .get('nombre,parroquia,capilla');
    for (const i of groupSnap.docs) {
      if (!i.exists) continue;
      const d = i.data();
      const g = {
        id: i.id,
        nombre: d.nombre,
      };
      if (d.capilla) {
        g.capilla = d.capilla;
        capillas.add(d.capilla);
      } else {
        g.parroquia = d.parroquia;
        parroquias.add(d.parroquia);
      }
      coordinador.grupos.push(g);
    }

    capillas = [...capillas];
    const group_capillas = capillas;
    const group_parroquias = [...parroquias];

    if (coordinador.grupos.length > 0) {
      if (capillas.length > 0) {
        const capSnap = await firestore.getAll(
          ...capillas.map((a) => firestore.doc('capillas/' + a))
        );
        capSnap.forEach((a) => {
          if (!a.exists) return;
          const d = a.data();
          if (group_capillas.findIndex((b) => b === a.id) !== -1) {
            coordinador.capillas.push({
              id: a.id,
              nombre: d.nombre,
            });
          }
          parroquias.add(d.parroquia);
        });
      }

      parroquias = [...parroquias];

      const parrSnap = await firestore.getAll(
        ...parroquias.map((a) => firestore.doc('parroquias/' + a))
      );
      parrSnap.forEach((a) => {
        if (!a.exists) return;
        const d = a.data();
        if (group_parroquias.findIndex((b) => b === a.id) !== -1) {
          coordinador.parroquias.push({
            id: a.id,
            nombre: d.nombre,
          });
        }
        decanatos.add(d.decanato);
      });
      decanatos = [...decanatos];

      const decSnap = await firestore.getAll(
        ...decanatos.map((a) => firestore.doc('decanatos/' + a))
      );

      decSnap.forEach((a) => {
        if (!a.exists) return;
        coordinador.decanatos.push({
          id: a.id,
          ...a.data(),
        });
      });
    }

    return res.send({
      error: false,
      data: coordinador,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Mensaje inesperado.',
    });
  }
};

const chunks = function (array, size) {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, size));
  }
  return results;
};

const getForAcompanante = async (firestore, req, res) => {
  try {
    const acom = req.params.id;
    let decanatos = [];
    let coordisIds = [];
    let parroquias = [];
    const coordinadores = [];
    let decanRef, parroquiasRef, gruposRef;

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
      for (const dec of decanatos) {
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
      for (const parr of parroquias) {
        gruposRef = await firestore
          .collection('grupos')
          .where('parroquia', 'in', parr)
          .get();
        if (!gruposRef.empty) {
          gruposRef.docs.forEach((g) => coordisIds.push(g.data().coordinador));
        }
      }
    } else {
      throw Error('Error buscando parroquias de zona o decanato');
    }

    if (coordisIds.length > 0) {
      coordisIds = chunks(coordisIds, 10);
      for (const coord of coordisIds) {
        const coordisRef = await firestore.getAll(
          ...coord.map((c) => firestore.doc('coordinadores/' + c))
        );
        if (!coordisRef.empty) {
          coordisRef.forEach((doc) => {
            const d = doc.data();
            coordinadores.push({
              id: doc.id,
              nombre: d.nombre,
              apellido_paterno: d.apellido_paterno,
              apellido_materno: d.apellido_materno,
              email: d.email,
            });
          });
        }
      }
    } else {
      throw Error('Error buscando coordinadores de los grupos');
    }

    return res.send({
      error: false,
      data: coordinadores,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e.message,
    });
  }
};

const editCoordinador = async (firestore, req, res) => {
  const id = req.params.id;
  const {
    identificador,
    apellido_paterno,
    apellido_materno,
    domicilio,
    escolaridad,
    estado_civil,
    fecha_nacimiento,
    nombre,
    oficio,
    sexo,
  } = req.body;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }

  let fn = moment(fecha_nacimiento, 'YYYY-MM-DD');
  if (!fn.isValid()) fn = moment();

  try {
    const memberSnap = await firestore
      .collection('coordinadores')
      .doc(id)
      .get();
    if (!memberSnap.exists) {
      return res.send({
        error: true,
        message: 'Coordinador no existe.',
        code: 1,
      });
    }

    if (memberSnap.data().identificador !== identificador) {
      // Validate if a coordinador with identificador exists
      const coordinador = await firestore
        .collection('coordinadores')
        .where('identificador', '==', identificador)
        .get();

      if (!coordinador.empty) {
        return res.send({
          error: true,
          message:
            'Ya existe un coordinador con el identificador proporcionado.',
        });
      }
    }

    const coordinador = await firestore
      .collection('coordinadores')
      .doc(id)
      .update({
        identificador,
        apellido_paterno,
        apellido_materno,
        domicilio,
        escolaridad,
        estado_civil,
        fecha_nacimiento: fn.toDate(),
        nombre,
        oficio,
        sexo,
      });

    const user = (
      await firestore
        .collection('users')
        .where('email', '==', coordinador.data().email)
        .get()
    ).docs[0];
    if (user == null) {
      throw Error('Usuario no encontrado');
    }
    await user.ref.update({
      identificador,
      apellido_paterno,
      apellido_materno,
      domicilio,
      escolaridad,
      estado_civil,
      fecha_nacimiento: fn.toDate(),
      nombre,
      oficio,
      sexo,
    });

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

const remove = async (firestore, req, res) => {
  const { id } = req.params;

  if (!req.user.admin) {
    return res.send({
      error: true,
      code: 999,
      message: 'No tienes acceso a esta acción',
    });
  }
  try {
    const coordSnap = await firestore
      .collection('coordinadores')
      .doc(id)
      .get('nombre');
    if (!coordSnap.exists)
      return res.send({
        error: true,
        message: 'El coordinador no existe',
      });
    const l = await firestore
      .collection('logins')
      .where('id', '==', coordSnap.id)
      .where('tipo', '==', 'coordinador')
      .get();
    const batch = firestore.batch();
    l.docs.forEach((a) => {
      batch.delete(a.ref);
    });
    await batch.commit();
    await firestore.collection('coordinadores').doc(id).delete();

    return res.send({
      error: false,
      data: true,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: 'Mensaje inesperado',
    });
  }
};

module.exports = {
  add,
  getall,
  getone,
  getForAcompanante,
  editCoordinador,
  remove,
};
