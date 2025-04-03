var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');
const slugify = require('slugify');

/* POST tạo category mới */
router.post('/', async function(req, res, next) {
  try {
    let { name, description } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: 'Name is required'
      });
    }

    let existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(400).send({
        success: false,
        message: 'Category name already exists'
      });
    }

    let newCategory = new categoryModel({ name, description });
    await newCategory.save();

    res.status(201).send({
      success: true,
      data: newCategory
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

/* GET tất cả categories */
router.get('/', async function(req, res, next) {
  try {
    let categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

/* GET category theo ID */
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found"
      });
    }
    res.status(200).send({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;