import { Router } from 'express';
import cartsModel from '../../models/carts.models.js';
import mongoose from 'mongoose'

const router = Router();

router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartsModel.findById(cid).populate('products.product');
        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

        res.json({ cart });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo carrito', error });
    }
});


router.post('/', async (req, res) => {
    try {
        const newCart = new cartsModel({ products: [] });
        await newCart.save();
        res.status(201).json({ message: 'Carrito creado', cart: newCart });
    } catch (error) {
        res.status(500).json({ message: 'Error creando carrito', error });
    }
});
// Agregar productos al carrito
router.post('/:cid/products', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

        products.forEach(({ product, quantity }) => {
            const existingProduct = cart.products.find(p => p.product.toString() === product);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product, quantity });
            }
        });

        await cart.save();
        res.json({ message: 'Productos añadidos al carrito', cart });
    } catch (error) {
        console.error("Error en POST /:cid/products:", error); // 👀 Mostrar error en consola
        res.status(500).json({ message: 'Error añadiendo productos', error: error.message });
    }
    
});

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
      const { cid, pid } = req.params;
      
      const productId = new mongoose.Types.ObjectId(pid);
  
  
      const carrito = await cartsModel.findOneAndUpdate(
        { _id: cid },
        { $pull: { products: { product: productId } } },
        { new: true }
      );
  
      if (!carrito) {
        return res.status(404).send({ error: 'Carrito no encontrado' });
      }
  
      if (!carrito.products.length) {
        return res.status(200).send({ message: 'El carrito está vacío' });
      }
      
      res.status(200).send({ message: 'Producto eliminado del carrito', carrito });
    } catch (error) {
      console.log("Error al eliminar el producto del carrito: ", error);
      res.status(500).send({ error: 'Error al eliminar el producto del carrito', details: error.message });
    }
  });
// Actualizar el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
  
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: 'El body debe contener un array de productos' });
    }
  
    try {
      const cart = await cartsModel.findByIdAndUpdate(cid, { products }, { new: true });
      if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
  
      res.json({ message: 'Carrito actualizado', cart });
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando carrito', error: error.message });
    }
  });
   

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
  
    if (!quantity || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser un número válido mayor a 0' });
    }
  
    try {
      const cart = await cartsModel.findById(cid);
      if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
  
      const productId = new mongoose.Types.ObjectId(pid);
      const productIndex = cart.products.findIndex(p => p.product && p.product.equals(productId));
  
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
      }
  
      cart.products[productIndex].quantity = quantity;
  
      // Elimina productos nulos en caso de datos corruptos
      cart.products = cart.products.filter(p => p.product);
  
      await cart.save();
  
      res.json({ message: 'Cantidad actualizada', cart });
    } catch (error) {
      res.status(500).json({ message: 'Error actualizando cantidad', error: error.message || error });
    }
  });
  
// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartsModel.findById(cid);

        if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

        cart.products = [];
        await cart.save();

        res.json({ message: 'Todos los productos eliminados del carrito', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando productos', error });
    }
});

export default router;

