import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productsCollections = "products";

const productsSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            trim: true
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
        }
    },
    { timestamps: true } // Agrega createdAt y updatedAt automáticamente ver trim que chota es
);

productsSchema.plugin(mongoosePaginate);

export const productModel = model(productsCollections, productsSchema)
