import { Router } from "express";
import { productModel } from "../models/products.model.js";
import cartsModel from "../models/carts.models.js"; // Importar el modelo de carritos

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
    } = await productModel.paginate(
      {},
      { limit, page: numPage, sort: { price: 1 }, lean: true }
    );

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

// Renderiza la lista de carritos con paginación
router.get("/carts", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Límite de carritos por página
    const numPage = parseInt(req.query.numPage) || 1; // Número de página

    // Obtener carritos paginados
    const {
      docs: carts,
      page,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    } = await cartsModel.paginate(
      {},
      {
        limit,
        page: numPage,
        populate: "products.product", // Poblar los productos dentro de cada carrito
        lean: true,
      }
    );

    // Calcular el total de cada producto y el total del carrito
    const cartsWithTotals = carts.map((cart) => {
      const productsWithTotals = cart.products
        .filter((product) => product.product !== null) // Filtrar productos nulos
        .map((product) => {
          return {
            ...product,
            total: product.quantity * product.product.price, // Calcular el total del producto
          };
        });

      const cartTotal = productsWithTotals.reduce(
        (total, product) => total + product.total,
        0
      ); // Calcular el total del carrito

      return {
        ...cart,
        products: productsWithTotals,
        cartTotal, // Añadir el total del carrito
      };
    });

    // Renderizar la vista con paginación
    res.render("carts-lists", {
      carts: cartsWithTotals,
      page,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    });
  } catch (error) {
    console.error("Error en la ruta /carts:", error);
    handleError(res, "/", "Error al obtener carritos");
  }
});

// Renderiza un carrito específico sin paginación de productos
router.get("/carts/:cartId", async (req, res) => {
  try {
    // Obtener el carrito y sus productos
    const cart = await cartsModel
      .findById(req.params.cartId)
      .populate("products.product")
      .lean();

    if (!cart) {
      return handleError(res, "/carts", "Carrito no encontrado");
    }

    // Renderizar la vista sin paginación de productos
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

    const existingProduct = cart.products.find(
      (p) => p.product.toString() === productId
    );
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

export default router;