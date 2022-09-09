const express = require('express');
const router = express.Router();
const apigenresController = require('../../controllers/api/apiGenresController');

router.get('/', apigenresController.list);
router.get('/detail/:id', apigenresController.detail);
router.get('/name/:name', apigenresController.byName)


module.exports = router;