const getEstadisticas = async (firestore, req, res) => {
  const servicio = {
    publico: 0,
    privado: 0,
    ninguno: 0,
  };

  const seguridadSocial = {
    pensionado: 0,
    jubilado: 0,
    apoyo_federal: 0,
    ninguno: 0,
  };

  let alergico = 0;
  const lista_alergias = [];
  let problema_cardiovascular = 0;
  let problema_azucar = 0;
  let problema_hipertension = 0;
  let problema_sobrepeso = 0;
  let ningun_problema = 0;

  let discapacidad = 0;
  const lista_discapacidad = [];

  const escolaridad = {
    ninguno: 0,
    primaria: 0,
    secundaria: 0,
    preparatoria: 0,
    carrera_tecnica: 0,
    profesional: 0,
  };

  const miembrosRef = firestore.collection('miembros');
  let miembros = null;

  const zone = req.query.zone || null;
  // Filter by zone
  if (zone) {
    const zonesRef = firestore.collection('zonas');
    const zoneDoc = await zonesRef.doc(zone).get();

    const decanatoRef = firestore.collection('decanatos');
    const decanato = req.query.decanato || null;
    const decanatoIds = [];
    // Filter by decanato
    if (decanato) {
      decanatoIds.push(decanato);
    } else {
      const decanatoDocs = await decanatoRef
        .where('zona', '==', zoneDoc.id)
        .get();
      decanatoDocs.forEach((doc) => decanatoIds.push(doc.id));
    }

    // Get Parroquias
    const parroquiasRef = firestore.collection('parroquias');

    let batches = [];
    while (decanatoIds.length) {
      // Firestore limits batches to 10
      const ids = decanatoIds.splice(0, 10);

      // Add request to queue
      batches.push(
        new Promise((response) => {
          parroquiasRef
            .where('decanato', 'in', ids)
            .get()
            .then((parroquiaDocs) => {
              const resultIds = [];
              parroquiaDocs.forEach((doc) => resultIds.push(doc.id));
              response(resultIds);
            });
        })
      );
    }

    // After all of the data is fetched, return it
    const parroquiaIds = (await Promise.all(batches)).flat();

    // Get Grupos
    const gruposRef = firestore.collection('grupos');

    batches = [];
    while (parroquiaIds.length) {
      // Firestore limits batches to 10
      const ids = parroquiaIds.splice(0, 10);

      // Add request to queue
      batches.push(
        new Promise((response) => {
          gruposRef
            .where('parroquia', 'in', ids)
            .get()
            .then((grupoDocs) => {
              const resultIds = [];
              grupoDocs.forEach((doc) => resultIds.push(doc.id));
              response(resultIds);
            });
        })
      );
    }
    const grupoIds = (await Promise.all(batches)).flat();

    // Get miembros
    batches = [];
    while (grupoIds.length) {
      // Firestore limits batches to 10
      const ids = grupoIds.splice(0, 10);

      // Add request to queue
      batches.push(
        new Promise((response) => {
          miembrosRef
            .where('grupo', 'in', ids)
            .get()
            .then((miembrosDocs) => {
              response(miembrosDocs.docs);
            });
        })
      );
    }

    miembros = (await Promise.all(batches)).flat();
  } else {
    miembros = await miembrosRef.get();
  }

  const total = miembros.length;
  miembros.forEach((miembro) => {
    const mdata = miembro.data();

    // Checking servicio medico
    const ficha_medica = mdata.ficha_medica;
    if (ficha_medica == undefined) return;

    const mservicio = ficha_medica.servicio_medico;
    if (mservicio == 'Público') servicio.publico++;
    else if (mservicio == 'Privado') servicio.privado++;
    else if (mservicio == 'Ninguno') servicio.ninguno++;

    //Checking alergico
    if (ficha_medica.alergico == true) {
      alergico++;
      lista_alergias.push(ficha_medica.alergico_desc);
    }

    // Checking problema cardiovascular
    if (ficha_medica.p_cardiovascular == true) problema_cardiovascular++;

    // Checking problema de azucar
    if (ficha_medica.p_azucar == true) problema_azucar++;

    // Checking problema hipertension
    if (ficha_medica.p_hipertension == true) problema_hipertension++;

    // Checking problema sobrepeso
    if (ficha_medica.p_sobrepeso == true) problema_sobrepeso++;

    // Checking ningun problema de salud
    if (
      ficha_medica.p_cardiovascular == false &&
      ficha_medica.p_azucar == false &&
      ficha_medica.p_hipertension == false &&
      ficha_medica.p_sobrepeso == false
    )
      ningun_problema++;

    // Checking discapacidad
    if (ficha_medica.discapacidad == true) {
      discapacidad++;
      lista_discapacidad.push(ficha_medica.discapacidad_desc);
    }

    // Checking seguridad social
    const mSeguridad = ficha_medica.seguridad_social;
    if (mSeguridad == 'Ninguno') seguridadSocial.ninguno++;
    else if (mSeguridad == 'Pensionado') seguridadSocial.pensionado++;
    else if (mSeguridad == 'Jubilado') seguridadSocial.jubilado++;
    else if (mSeguridad == 'Apoyo Federal') seguridadSocial.apoyo_federal++;

    // Checking escolaridad
    const mEscolaridad = mdata.escolaridad;
    if (mEscolaridad == 'Ninguno') escolaridad.ninguno++;
    else if (mEscolaridad == 'Primaria') escolaridad.primaria++;
    else if (mEscolaridad == 'Secundaria') escolaridad.secundaria++;
    else if (mEscolaridad == 'Preparatoria') escolaridad.preparatoria++;
    else if (mEscolaridad == 'Carrera Técnica') escolaridad.carrera_tecnica++;
    else if (mEscolaridad == 'Profesional') escolaridad.profesional++;
  });

  res.send({
    error: false,
    total: total,
    servicio_medico: {
      publico: (servicio.publico / total) * 100,
      privado: (servicio.privado / total) * 100,
      ninguno: (servicio.ninguno / total) * 100,
    },
    alergico: (alergico / total) * 100,
    alergico_desc: lista_alergias,
    p_cardiovascular: problema_cardiovascular,
    p_azucar: problema_azucar,
    p_hipertension: problema_hipertension,
    p_sobrepeso: problema_sobrepeso,
    p_ninguno: ningun_problema,
    discapacidad: (discapacidad / total) * 100,
    discapacidad_desc: lista_discapacidad,
    seguridad_social: {
      pensionado: (seguridadSocial.pensionado / total) * 100,
      jubilado: (seguridadSocial.jubilado / total) * 100,
      apoyo_federal: (seguridadSocial.apoyo_federal / total) * 100,
      ninguno: (seguridadSocial.ninguno / total) * 100,
    },
    escolaridad: {
      ninguno: (escolaridad.ninguno / total) * 100,
      primaria: (escolaridad.primaria / total) * 100,
      secundaria: (escolaridad.secundaria / total) * 100,
      preparatoria: (escolaridad.preparatoria / total) * 100,
      carrera_tecnica: (escolaridad.carrera_tecnica / total) * 100,
      profesional: (escolaridad.profesional / total) * 100,
    },
  });
};

module.exports = {
  getEstadisticas,
};
