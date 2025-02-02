import { Router } from "express";
import { productModel } from "../models/products.model.js";
import cartsModel from "../models/carts.models.js";

const router = Router();

const handleError = (res, redirectPath, errorMessage) => {
  res.redirect(`${redirectPath}?error=${errorMessage}`);
};

// Renderiza la página principal con enlaces a las secciones
router.get("/", (req, res) => {
  res.render("home");
});

// Renderiza la vista de productos con paginación
router.get("/products", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const numPage = parseInt(req.query.numPage) || 1;

    const {
      docs: products,
      page,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    } = await productModel.paginate({}, { limit, page: numPage, sort: { price: 1 }, lean: true });

    res.render("products", {
      products,
      hasNextPage,
      hasPrevPage,
      prevPage,
      nextPage,
      page,
    });
  } catch (error) {
    handleError(res, "/", "Error al obtener productos");
  }
});

// Renderiza la lista de carritos
router.get("/carts", async (req, res) => {
  try {
    const carts = await cartsModel.find().populate("products.product").lean();
    res.render("carts-list", { carts });
  } catch (error) {
    handleError(res, "/", "Error al obtener carritos");
  }
});

// Renderiza un carrito específico
router.get("/carts/:cartId", async (req, res) => {
  try {
    const cart = await cartsModel.findById(req.params.cartId).populate("products.product").lean();
    if (!cart) {
      return handleError(res, "/carts", "Carrito no encontrado");
    }
    res.render("carts", { cart });
  } catch (error) {
    handleError(res, "/carts", "Error al obtener el carrito");
  }
});

// Endpoint para agregar un producto al carrito
router.post("/carts/:cartId/add/:productId", async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const cart = await cartsModel.findById(cartId);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

    const existingProduct = cart.products.find(p => p.product.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    res.json({ success: true, message: "Producto agregado al carrito" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

// Nueva ruta para crear un carrito
router.post("/carts/create", async (req, res) => {
  try {
    const newCart = new cartsModel({ products: [] });
    await newCart.save();
    res.json({ success: true, cartId: newCart._id });
  } catch (error) {
    res.status(500).json({ error: "Error al crear carrito" });
  }
});

// Nueva ruta para buscar un carrito por ID
router.get("/carts/search", async (req, res) => {
  try {
    const cartId = req.query.cartId;
    const cart = await cartsModel.findById(cartId).populate("products.product").lean();
    if (!cart) {
      return res.render("carts-list", { carts: [], error: "Carrito no encontrado" });
    }
    res.render("carts-list", { carts: [cart] });
  } catch (error) {
    handleError(res, "/carts", "Error al buscar el carrito");
  }
});

export default router;