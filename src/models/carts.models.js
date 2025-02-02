import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"; // Importar el plugin de paginación

const cartSchema = new Schema({
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: "products" },
      quantity: { type: Number, default: 1 },
    },
  ],
});

// Aplicar el plugin de paginación
cartSchema.plugin(mongoosePaginate);

// Middleware para poblar los productos al hacer findOne
cartSchema.pre("findOne", function () {
  this.populate("products.product");
});

const cartsModel = model("carts", cartSchema);

export default cartsModel;