const xlsx = require('xlsx');
const Readable = require('stream').Readable;

const estadisticas = async (firestore, req) => {
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
    miembros = (await miembrosRef.get()).docs;
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

  return {
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
  };
};

const getEstadisticas = async (firestore, req, res) => {
  const results = await estadisticas(firestore, req);
  res.send(results);
};

const getReporteEstadisticas = async (firestore, req, res) => {
  const results = await estadisticas(firestore, req);
  const values = req.query.values.split(',').map(x => parseFloat(x));
  const data = {
    servicio_medico: {
      privado: values[0],
      publico: values[1],
    },
    salud: {
      alergico: values[2],
      p_cardiovascular: values[3],
      p_azucar: values[4],
      p_hipertension: values[5],
      p_sobrepeso: values[6],
    },
    seguridad_social: {
      pensionado: values[7],
      jubilado: values[8],
    },
    escolaridad: {
      primaria: values[9],
      secundaria: values[10],
      preparatoria: values[11],
      carrera_tecnica: values[12],
      profesional: values[13],
      ninguno: values[14],
    },
  };

  const excelData = [
    {
      Sección: 'Servicio Médico',
      Métrica: 'Privado',
      'Valor Real': results.servicio_medico.privado,
      'Valor Esperado': data.servicio_medico.privado,
      Diferencia:
        results.servicio_medico.privado - data.servicio_medico.privado,
      Resultado:
        results.servicio_medico.publico - data.servicio_medico.publico <= 0
          ? 'Revisar servicio médico'
          : 'Positivo',
    },
    {
      Sección: 'Servicio Médico',
      Métrica: 'Público',
      'Valor Real': results.servicio_medico.publico,
      'Valor Esperado': data.servicio_medico.publico,
      Diferencia:
        results.servicio_medico.publico - data.servicio_medico.publico,
      Resultado:
        results.servicio_medico.publico - data.servicio_medico.publico <= 0
          ? 'Revisar servicio médico'
          : 'Positivo',
    },
    {
      Sección: 'Salud',
      Métrica: 'Alergias',
      'Valor Real': results.alergico,
      'Valor Esperado': data.salud.alergico,
      Diferencia: results.alergico - data.salud.alergico,
      Resultado:
        results.alergico - data.salud.alergico >= 0
          ? 'Revisar salud'
          : 'Positivo',
    },
    {
      Sección: 'Salud',
      Métrica: 'Problemas Cardiovasculares',
      'Valor Real': results.p_cardiovascular,
      'Valor Esperado': data.salud.p_cardiovascular,
      Diferencia: results.p_cardiovascular - data.salud.p_cardiovascular,
      Resultado:
        results.p_cardiovascular - data.salud.p_cardiovascular >= 0
          ? 'Revisar salud'
          : 'Positivo',
    },
    {
      Sección: 'Salud',
      Métrica: 'Problemas Azúcar',
      'Valor Real': results.p_azucar,
      'Valor Esperado': data.salud.p_azucar,
      Diferencia: results.p_azucar - data.salud.p_azucar,
      Resultado:
        results.p_azucar - data.salud.p_azucar >= 0
          ? 'Revisar salud'
          : 'Positivo',
    },
    {
      Sección: 'Salud',
      Métrica: 'Hipertensión',
      'Valor Real': results.p_hipertension,
      'Valor Esperado': data.salud.p_hipertension,
      Diferencia: results.p_hipertension - data.salud.p_hipertension,
      Resultado:
        results.p_hipertension - data.salud.p_hipertension >= 0
          ? 'Revisar salud'
          : 'Positivo',
    },
    {
      Sección: 'Salud',
      Métrica: 'Sobrepeso',
      'Valor Real': results.p_sobrepeso,
      'Valor Esperado': data.salud.p_sobrepeso,
      Diferencia: results.p_sobrepeso - data.salud.p_sobrepeso,
      Resultado:
        results.p_sobrepeso - data.salud.p_sobrepeso >= 0
          ? 'Revisar salud'
          : 'Positivo',
    },
    {
      Sección: 'Seguridad Social',
      Métrica: 'Jubiliadas',
      'Valor Real': results.seguridad_social.jubilado,
      'Valor Esperado': data.seguridad_social.jubilado,
      Diferencia:
        results.seguridad_social.jubilado - data.seguridad_social.jubilado,
      Resultado:
        results.seguridad_social.jubilado - data.seguridad_social.jubilado <= 0
          ? 'Revisar seguridad social'
          : 'Positivo',
    },
    {
      Sección: 'Seguridad Social',
      Métrica: 'Pensionadas',
      'Valor Real': results.seguridad_social.pensionado,
      'Valor Esperado': data.seguridad_social.pensionado,
      Diferencia:
        results.seguridad_social.pensionado - data.seguridad_social.pensionado,
      Resultado:
        results.seguridad_social.pensionado -
          data.seguridad_social.pensionado <=
        0
          ? 'Revisar seguridad social'
          : 'Positivo',
    },
    {
      Sección: 'Educación',
      Métrica: 'Primaria',
      'Valor Real': results.escolaridad.primaria,
      'Valor Esperado': data.escolaridad.primaria,
      Diferencia: results.escolaridad.primaria - data.escolaridad.primaria,
      Resultado:
        results.escolaridad.primaria - data.escolaridad.primaria <= 0
          ? 'Revisar escolaridad'
          : 'Positivo',
    },
    {
      Sección: 'Educación',
      Métrica: 'Secundaria',
      'Valor Real': results.escolaridad.secundaria,
      'Valor Esperado': data.escolaridad.secundaria,
      Diferencia: results.escolaridad.secundaria - data.escolaridad.secundaria,
      Resultado:
        results.escolaridad.secundaria - data.escolaridad.secundaria <= 0
          ? 'Revisar escolaridad'
          : 'Positivo',
    },
    {
      Sección: 'Educación',
      Métrica: 'Preparatoria',
      'Valor Real': results.escolaridad.preparatoria,
      'Valor Esperado': data.escolaridad.preparatoria,
      Diferencia:
        results.escolaridad.preparatoria - data.escolaridad.preparatoria,
      Resultado:
        results.escolaridad.preparatoria - data.escolaridad.preparatoria <= 0
          ? 'Revisar escolaridad'
          : 'Positivo',
    },
    {
      Sección: 'Educación',
      Métrica: 'Técnicas',
      'Valor Real': results.escolaridad.carrera_tecnica,
      'Valor Esperado': data.escolaridad.carrera_tecnica,
      Diferencia:
        results.escolaridad.carrera_tecnica - data.escolaridad.carrera_tecnica,
      Resultado:
        results.escolaridad.carrera_tecnica -
          data.escolaridad.carrera_tecnica <=
        0
          ? 'Revisar escolaridad'
          : 'Positivo',
    },
    {
      Sección: 'Educación',
      Métrica: 'Profesional',
      'Valor Real': results.escolaridad.profesional,
      'Valor Esperado': data.escolaridad.profesional,
      Diferencia:
        results.escolaridad.profesional - data.escolaridad.profesional,
      Resultado:
        results.escolaridad.profesional - data.escolaridad.profesional <= 0
          ? 'Revisar escolaridad'
          : 'Positivo',
    },
    {
      Sección: 'Educación',
      Métrica: 'Sin Estudios',
      'Valor Real': results.escolaridad.ninguno,
      'Valor Esperado': data.escolaridad.ninguno,
      Diferencia: results.escolaridad.ninguno - data.escolaridad.ninguno,
      Resultado:
        results.escolaridad.ninguno - data.escolaridad.ninguno >= 0
          ? 'Revisar escolaridad'
          : 'Positivo',
    },
  ];

  const book = xlsx.utils.book_new();
  const sheet1 = xlsx.utils.json_to_sheet(excelData);

  // Format columns and rows
  const cols = [
    { wpx: 100 },
    { wpx: 2000 },
    { wpx: 10 },
    { wpx: 20 },
    { wpx: 40 },
  ];
  sheet1['!cols'] = cols;
  const merge = [
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },
    { s: { r: 3, c: 0 }, e: { r: 7, c: 0 } },
    { s: { r: 8, c: 0 }, e: { r: 9, c: 0 } },
    { s: { r: 10, c: 0 }, e: { r: 15, c: 0 } },
  ];
  sheet1['!merges'] = merge;

  xlsx.utils.book_append_sheet(book, sheet1, '');
  const buf = xlsx.write(book, { type: 'buffer', bookType: 'xls' });
  const stream = new Readable();
  stream.push(buf);
  stream.push(null);

  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.attachment('Reporte-Alertas' + '.xls');
  return stream.pipe(res);
};

module.exports = {
  getEstadisticas,
  getReporteEstadisticas,
};
