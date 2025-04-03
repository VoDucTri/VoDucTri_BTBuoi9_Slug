var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');  
let categoryModel = require('../schemas/category');  
const slugify = require('slugify');
const mongoose = require('mongoose');  

function buildQuery(obj) {
  let result = {};
  if (obj.name) {
    result.name = new RegExp(obj.name, 'i');
  }
  if (obj.price) {
    result.price = {};
    if (obj.price.$gte) {
      result.price.$gte = obj.price.$gte;
    }
    if (obj.price.$lte) {
      result.price.$lte = obj.price.$lte;
    }
  }
  return result;
}

/* GET users listing. */
router.get('/', async function(req, res, next) {
  

  let products = await productModel.find(buildQuery(req.query)).populate("category");

  res.status(200).send({
    success:true,
    data:products
  });
});
router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findById(id);
    res.status(200).send({
      success:true,
      data:product
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:"khong co id phu hop"
    });
  }
});

/* POST tạo sản phẩm mới */
router.post('/', async function(req, res, next) {
  try {
    let { name, categoryId, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).send({ success: false, message: 'Invalid categoryId' });
    }

    let category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).send({ success: false, message: 'Category not found' });
    }

    let newProduct = new productModel({ name, category: category._id, price });
    await newProduct.save();
    res.status(201).send({
      success: true,
      data: newProduct
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id', async function(req, res, next) {
  try {
    let updateObj = {};
    let body = req.body;
    if (body.name) {
      updateObj.name = body.name;
    }
    if (body.price) {
      updateObj.price = body.price;
    }
    if (body.quantity) {
      updateObj.quantity = body.quantity;
    }
    if (body.category) {
      let cate = await categoryModel.findOne({ name: body.category }); 
      if (!cate) {
        return res.status(404).send({ 
          success: false,
          message: 'Category not found'
        });
      }
      updateObj.category = cate._id; 
    }
    let updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      updateObj,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).send({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).send({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "ID khong ton tai"
      });
    }
    let deletedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).send({
      success: true,
      data: deletedProduct
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

/* GET tất cả sản phẩm trong category theo slug */
router.get('/slug/:category', async function(req, res, next) {
  try {
    let categorySlug = req.params.category;

    // Tìm category theo slug
    let category = await categoryModel.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).send({ success: false, message: 'Category not found' });
    }

    let products = await productModel.find({ category: category._id }).populate('category');
    res.status(200).send({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

/* GET sản phẩm cụ thể theo categorySlug và productSlug */
router.get('/slug/:category/:product', async function(req, res, next) {
  try {
    let categorySlug = req.params.category;
    let productSlug = req.params.product;

    let category = await categoryModel.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).send({ success: false, message: 'Category not found' });
    }

    let product = await productModel.findOne({ slug: productSlug, category: category._id }).populate('category');
    if (!product) {
      return res.status(404).send({ success: false, message: 'Product not found' });
    }

    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
