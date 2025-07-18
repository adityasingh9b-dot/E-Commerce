import ProductModel from "../models/product.model.js";
import mongoose from 'mongoose';

// ✅ Create Product
export const createProductController = async (request, response) => {
  try {
    const {
      name, image, category, subCategory, unit,
      stock, price, discount, description, more_details,
    } = request.body;

    if (!name || !image || !category || !subCategory || !unit || !price || !description) {
      return response.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    const product = new ProductModel({
      name,
      image,
      category,
      subCategory,
      unit,
      stock: stock || 0,
      price,
      discount: discount || 0,
      description,
      more_details: more_details || "",
    });

    const saveProduct = await product.save();

    return response.json({
      message: "Product Created Successfully",
      data: saveProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Get All Products (with search + pagination)
export const getProductController = async (request, response) => {
  try {
    let { page, limit, search } = request.body;
    page = page || 1;
    limit = limit || 10;

    const query = search ? {
      $text: { $search: search }
    } : {};

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category subCategory'),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product data",
      error: false,
      success: true,
      totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Get Product by Category
export const getProductByCategory = async (request, response) => {
  try {
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Provide category id",
        error: true,
        success: false,
      });
    }

    const product = await ProductModel.find({
      category: { $in: id }
    }).limit(15);

    return response.json({
      message: "Category product list",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getProductByCategoryAndSubCategory = async (request, response) => {
  try {
    let { categoryId, subCategoryId, page, limit } = request.body;

    if (!categoryId || !subCategoryId) {
      return response.status(400).json({
        message: "Provide categoryId and subCategoryId",
        error: true,
        success: false,
      });
    }

    page = page || 1;
    limit = limit || 10;
    const skip = (page - 1) * limit;

const categoryIds = Array.isArray(categoryId)
  ? categoryId.map(id => new mongoose.Types.ObjectId(id))
  : [new mongoose.Types.ObjectId(categoryId)];

const subCategoryIds = Array.isArray(subCategoryId)
  ? subCategoryId.map(id => new mongoose.Types.ObjectId(id))
  : [new mongoose.Types.ObjectId(subCategoryId)];


    const query = {
      category: { $in: categoryIds },
      subCategory: { $in: subCategoryIds }
    };

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product list",
      data,
      totalCount,
      page,
      limit,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Get Product Details
export const getProductDetails = async (request, response) => {
  try {
    const { productId } = request.body;

    const product = await ProductModel.findOne({ _id: productId });

    return response.json({
      message: "Product details",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Update Product
export const updateProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide product _id",
        error: true,
        success: false,
      });
    }

    const updateProduct = await ProductModel.updateOne({ _id }, {
      ...request.body,
    });

    return response.json({
      message: "Updated successfully",
      data: updateProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Delete Product
export const deleteProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteProduct = await ProductModel.deleteOne({ _id });

    return response.json({
      message: "Deleted successfully",
      data: deleteProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ✅ Search Product
export const searchProduct = async (request, response) => {
  try {
    let { search, page, limit } = request.body;
    page = page || 1;
    limit = limit || 10;
    const skip = (page - 1) * limit;

    const query = search ? {
      $text: { $search: search }
    } : {};

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category subCategory'),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product data",
      data,
      totalCount: dataCount,
      totalPage: Math.ceil(dataCount / limit),
      page,
      limit,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

