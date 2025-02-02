import { Router } from 'express';
import { productModel } from '../../models/products.model.js';

const router = Router();

// Obtener productos con paginación
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
  
      res.render("home", {
        products,
        hasNextPage,
        hasPrevPage,
        prevPage,
        nextPage,
        page,
      });
    } catch (error) {
      res.redirect("/?error=Error al obtener productos");
    }
  });
  

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { title, category, stock, price } = req.body;

        const result = await productModel.create({ title, category, stock, price });

        res.send({ status: 'success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(400).send({ status: 'error', message: 'Error al crear el producto' });
    }
});

// Obtener un producto por ID
router.get('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const product = await productModel.findById(uid);

        if (!product) {
            return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        }

        res.send({ status: 'success', payload: product });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: 'Error al obtener el producto' });
    }
});

// Actualizar un producto por ID
router.put('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { body } = req;

        const result = await productModel.findByIdAndUpdate(uid, body, { new: true });

        if (!result) {
            return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        }

        res.send({ status: 'success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(400).send({ status: 'error', message: 'Error al actualizar el producto' });
    }
});

// Eliminar un producto por ID
router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        const result = await productModel.findByIdAndDelete(uid);

        if (!result) {
            return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        }

        res.send({ status: 'success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: 'Error al eliminar el producto' });
    }
});

export default router;
