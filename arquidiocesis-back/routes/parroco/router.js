/**
 * Module for managing 'Parrocos'
 * @module Parroco
 */
const router = require('express').Router();
const firestore = require('../../firebase/setup').firestore();
const controller = require('./controller');

// Routes
router.get('/', (req, res) => {
  controller.getAll(firestore, req, res);
});

router.get('/:id', (req, res) => {
  controller.getOne(firestore, req, res);
});

router.post('/', (req, res) => {
  controller.add(firestore, req, res);
});

router.put('/:id', (req, res) => {
  controller.edit(firestore, req, res);
});

module.exports = router;
