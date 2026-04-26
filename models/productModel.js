const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    image: [
      {
        type: String,
        required: true
      }
    ],

    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
      }
    ],

    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategory",
        required: true
      }
    ],

    unit: {
      type: String,
      trim: true,
      default: ""
    },

    stock: {
      type: Number,
      default: 0,
      min: 0
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    more_details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    publish: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);


productSchema.index(
  {
    name: "text",
    description: "text"
  },
  {
    weights: {
      name: 10,
      description: 5
    }
  }
);

const ProductModel = mongoose.model("product", productSchema);

module.exports = ProductModel
