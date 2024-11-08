import express from 'express';
import { Shopify } from '@shopify/shopify-api';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for AR model uploads
const storage = multer.diskStorage({
  destination: './uploads/ar-models',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Allow only .glb, .usdz files
    const allowedTypes = ['.glb', '.usdz'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .glb and .usdz files are allowed.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Get all AR-enabled products
router.get('/api/ar-products', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);

    const response = await client.get({
      path: 'products',
      query: { 
        metafield_namespaces: 'ar_model',
      },
    });

    const products = response.body.products.map(product => ({
      id: product.id,
      title: product.title,
      image: product.images[0]?.src,
      status: product.status,
      hasARModel: !!product.metafields?.find(
        m => m.namespace === 'ar_model' && m.key === 'model_url'
      ),
      modelUrl: product.metafields?.find(
        m => m.namespace === 'ar_model' && m.key === 'model_url'
      )?.value,
    }));

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching AR products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get store products for import
router.get('/api/store-products', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    const response = await client.get({
      path: 'products',
    });

    res.status(200).json({ products: response.body.products });
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new product with AR capabilities
router.post('/api/products', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    
    const { title, description, price, images } = req.body;

    const productData = {
      product: {
        title,
        body_html: description,
        variants: [
          {
            price,
            inventory_management: 'shopify',
            inventory_quantity: 1,
          }
        ],
        status: 'active',
        images: images.map(image => ({ src: image })),
      }
    };

    const response = await client.post({
      path: 'products',
      data: productData,
    });

    res.status(201).json({ product: response.body.product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload AR model for a product
router.post('/api/products/:productId/ar-model', upload.single('model'), async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const { productId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Store the file path in product metafields
    const modelUrl = `/ar-models/${req.file.filename}`;
    
    await client.post({
      path: `products/${productId}/metafields`,
      data: {
        metafield: {
          namespace: 'ar_model',
          key: 'model_url',
          value: modelUrl,
          type: 'single_line_text_field'
        }
      }
    });

    res.status(200).json({ 
      success: true, 
      modelUrl,
      message: 'AR model uploaded successfully' 
    });
  } catch (error) {
    // Clean up uploaded file if metafield creation fails
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    console.error('Error uploading AR model:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import existing store products to AR app
router.post('/api/import-products', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' });
    }

    // Add AR capability metadata to selected products
    const importPromises = productIds.map(productId => 
      client.post({
        path: `products/${productId}/metafields`,
        data: {
          metafield: {
            namespace: 'ar_model',
            key: 'enabled',
            value: 'true',
            type: 'single_line_text_field'
          }
        }
      })
    );

    await Promise.all(importPromises);

    res.status(200).json({ 
      success: true, 
      message: `Successfully imported ${productIds.length} products` 
    });
  } catch (error) {
    console.error('Error importing products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete AR model from product
router.delete('/api/products/:productId/ar-model', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const { productId } = req.params;

    // Get existing AR model metafield
    const metafieldsResponse = await client.get({
      path: `products/${productId}/metafields`,
      query: {
        namespace: 'ar_model',
        key: 'model_url'
      }
    });

    const modelMetafield = metafieldsResponse.body.metafields[0];
    if (modelMetafield) {
      // Delete the file
      const modelPath = path.join('./uploads', modelMetafield.value);
      await fs.unlink(modelPath).catch(console.error);

      // Delete the metafield
      await client.delete({
        path: `products/${productId}/metafields/${modelMetafield.id}`
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'AR model removed successfully' 
    });
  } catch (error) {
    console.error('Error deleting AR model:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;