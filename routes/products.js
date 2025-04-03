const { ConnectionCheckOutFailedEvent } = require('mongodb');
var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');  // Import đúng mô hình category
let productModel = require('../schemas/product');  // Import đúng mô hình product
const slugify = require('slugify');

function buildQuery(obj){
  console.log(obj);
  let result = {};
  if(obj.name){
    result.name=new RegExp(obj.name,'i');
  }
  result.price = {};
  if(obj.price){
    if(obj.price.$gte){
      result.price.$gte = obj.price.$gte;
    }else{
      result.price.$gte = 0
    }
    if(obj.price.$lte){
      result.price.$lte = obj.price.$lte;
    }else{
      result.price.$lte = 10000;
    }
  }else{
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  console.log(result);
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

/* POST tạo sản phẩm mới và tự động sinh slug */
router.post('/', async function(req, res, next) {
  try {
    let { name, categoryId, price } = req.body;
    let slug = slugify(name, { lower: true });

    // Kiểm tra categoryId có hợp lệ không
    let category = await categoryModel.findById(categoryId);  // Truy vấn category theo ObjectId
    if (!category) {
      return res.status(404).send({ success: false, message: 'Category not found' });
    }

    let newProduct = new productModel({ name, slug, categoryId, price });
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
    if(body.name){
      updateObj.name = body.name;
    }
    if(body.price){
      updateObj.price = body.price;
    }
    if(body.quantity){
      updateObj.quantity = body.quantity;
    }
    if(body.category){
      let cate = await CategoryModel.findOne({name:req.body.category});
      if(!cate){
        res.status(404).send({
          success:false,
          message:error.message
        });
      }
    }
    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id,
      updateObj,
      {new:true})
    res.status(200).send({
      success:true,
      data:updatedProduct
    });
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});
router.delete('/:id', async function(req, res, next) {
  try {
    let product = await productModel.findById(req.params.id);
    if(product){
      let deletedProduct = await productModel.findByIdAndUpdate(req.params.id,
        {
          isDeleted:true
        },
        {new:true})
        res.status(200).send({
          success:true,
          data:deletedProduct
        });
    }else{
      res.status(404).send({
        success:false,
        message:"ID khong ton tai"
      });
    }
  } catch (error) {
    res.status(404).send({
      success:false,
      message:error.message
    });
  }
});

/* GET sản phẩm theo categorySlug và productSlug */
router.get('/slug/:category/:product', async function(req, res, next) {
  try {
    let categorySlug = req.params.category;
    let productSlug = req.params.product;

    let category = await categoryModel.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).send({ success: false, message: 'Category not found' });
    }

    let product = await productModel.findOne({ slug: productSlug, categoryId: category._id });
    if (!product) {
      return res.status(404).send({ success: false, message: 'Product not found' });
    }

    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;
