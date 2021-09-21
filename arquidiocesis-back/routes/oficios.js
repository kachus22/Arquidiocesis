/**
 * Module for managing 'capacitaciones'
 * @module Oficios
 */

const add = async (firestore, req, res) => {
  const { oficio_label } = req.body;

  if (!oficio_label) {
    return res.send({
      error: true,
      message: 'oficio_label is invalid',
    });
  }

  const new_oficio_entry = {
    value: encodeURI(oficio_label.toLowerCase().split(' ').join('_')),
    label: oficio_label,
  };

  // check that current oficio_label is not already registered
  await firestore
    .collection('oficios')
    .where('label', '==', new_oficio_entry.label)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        return res.send({
          error: true,
          message: 'Este oficio ya está creado',
          data: snapshot,
        });
      }
    });

  try {
    const collectionref = await firestore.collection('oficios');
    const docref = await collectionref.add(new_oficio_entry); // add new oficio to oficios collection
    // --------- success ----------//
    // ----------VVVVVVV-----------//
    res.send({
      error: false,
      data: docref.id,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const getAllOficios = async (firestore, req, res) => {
  const dataRes = {};
  try {
    const oficiosRef = await firestore.collection('oficios');
    const snapshot = await oficiosRef.get();
    snapshot.forEach((doc) => {
      dataRes[doc.id] = doc.data();
    });
    res.send({
      error: false,
      data: dataRes,
    });
  } catch (e) {
    return res.send({
      error: true,
      message: e,
    });
  }
};

const remove = async (firestore, req, res) => {
  const { id } = req.params; //oficio ID

  if (id == null || id === '') {
    res.send({
      error: true,
      message: 'Se requiere el ID del oficio',
    });
  }

  try {
    await firestore.collection('oficios').doc(id).delete();
    res.send({
      error: false,
      message: 'Oficio borrado exitosamente',
    });
  } catch (e) {
    res.send({
      error: true,
      message: `Error inesperado: ${e}`,
    });
  }
};

module.exports = {
  add,
  getAllOficios,
  remove,
};
