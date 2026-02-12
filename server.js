const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const console = require('console');
require('dotenv').config();
const fs = require('fs');
const app = express();
app.get('/', async (req, res) => {
  try {
    const latestProducts = await Product.find({
      status: "approved"
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.render('index', {
      latestProducts: latestProducts
    });
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res.render('index', {
      latestProducts: []
    });
  }
});
app.get("/index.html", async (req, res) => {
  try {
    const latestProducts = await Product.find({
      status: "approved"
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.render('index', {
      latestProducts: latestProducts
    });
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res.render('index', {
      latestProducts: []
    });
  }
});
app.get("/index2.html", (req, res) => {
  res.render("index2");
});
app.get("/index3.html", (req, res) => {
  res.render("index3");
});


app.get('/index4.html', async (req, res) => {
  try {

    const approvedProducts = await Product.find({ status: 'approved' })
      .select('userId name mainImages price city')
      .sort({ createdAt: -1 })
      .lean();
    

    if (approvedProducts.length === 0) {
      return res.render('index4', { stores: [] });
    }

    const lastProductByUser = {};
    approvedProducts.forEach(product => {
      if (!lastProductByUser[product.userId]) {
        lastProductByUser[product.userId] = product;
      }
    });

    const userIdsFromProducts = Object.keys(lastProductByUser);

    const users = await User.find({
      userId: { $in: userIdsFromProducts } 
    })
      .select('userId fullName storeName storeLocation phone storeImage')
      .lean();
       

    const usersMap = {};
    users.forEach(user => {
      usersMap[user.userId] = user;
    });

    const stores = users.map(user => {
      const product = lastProductByUser[user.userId] || approvedProducts[0];

      return {
        _id: user._id || user.userId, 
        storeName: user.storeName || user.fullName,
        storeLocation: user.storeLocation,
        phone: user.phone,
        storeImage: user.storeImage || '/uploads/default-store.jpg',
        latestProduct: {
          name: product.name,
          mainImages: product.mainImages[0] || '/uploads/default.jpg',
          price: product.price,
          city: product.city
        }
      };
    });


    if (stores.length === 0) {
    }

    res.render('index4', {
      stores: stores,
      title: 'Magasins'
    });

  } catch (err) {
    console.error('❌ خطأ:', err.message);
    res.render('index4', { stores: [] });
  }
});
app.get("/index8/:id", async (req, res) => {


  User.findById(req.params.id)
    .then((result) => {
      Product.find({ userId: result.userId })
      .sort({ _id: -1 })
      .then((products) => {
        const productarray = [];
        products.forEach(item => {
          if (item.status === 'approved') {
            productarray.push(item);
          }
        });
        const slide = productarray.slice(0, 3);
        const productes = productarray.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));
    const carouselData = slide.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));
    res.render("index8", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      count: productes.length,
      user:result
      
    });
      })
        .catch((err) => {
          console.error('❌ خطأ:', err.message);
        });

    })
    .catch((err) => {
      console.error('❌ خطأ:', err.message);
    });


});


app.get("/impinfo.html", (req, res) => {
  res.render("impinfo");
});
app.get("/index5-salon.html", async (req, res) => {
  try {

    const dbProducts = await Product.find({
      smallcategory: 'salon',
      status: 'approved'

    }).limit(10);
    

    const carouselProducts = await Product.find({
      smallcategory: 'salon',
      status: 'approved'
    })
      .sort({ _id: -1 })
      .limit(3);



    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'salon');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory: salon"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: salon"
    });
  }
});
app.get("/index5-cuisine.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'cuisine',
      status: 'approved'

    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'cuisine',
      status: 'approved'

    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'cusine');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "مطبخ للبيع",
      count: productes.length,
      filter: "smallcategory: cuisine"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);




    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "مطبخ  (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: cuisine"
    });
  }
});
app.get("/index5-chambre.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'chambre',
      status: 'approved'

    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'chambre',
      status: 'approved'

    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'chambre');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "مطبخ للبيع",
      count: productes.length,
      filter: "smallcategory: chambre"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);




    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "مطبخ  (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: chambre"
    });
  }
});
app.get("/index5-bureau.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'bureau',
      status: 'approved'

    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'bureau',
      status: 'approved'

    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'bureau');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "مطبخ للبيع",
      count: productes.length,
      filter: "smallcategory: bureau"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);




    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "مطبخ  (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: bureau"
    });
  }
});
app.get("/index5-Chambre-enfant.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'chambre de enfant',
      status: 'approved'

    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'chambre de enfant',
      status: 'approved'

    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'chambre de enfant');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "مطبخ للبيع",
      count: productes.length,
      filter: "smallcategory: chambre de enfant"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);




    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "مطبخ  (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: chambre de enfant"
    });
  }
});
app.get("/index5-%20Salle-de-bain.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'salle de bain',
      status: 'approved'

    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'salle de bain',
      status: 'approved'

    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'salle de bain');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "مطبخ للبيع",
      count: productes.length,
      filter: "smallcategory: salle de bain"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);




    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "مطبخ  (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: salle de bain"
    });
  }
});
app.get("/index5-Salle-%C3%A0-manger.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'salle a manger',
      status: 'approved'

    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'salle a manger',
      status: 'approved'

    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'salle a manger');

    res.render("index5", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "مطبخ للبيع",
      count: productes.length,
      filter: "smallcategory: salle a manger"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);




    res.render("index5", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "مطبخ  (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: salle a manger"
    });
  }
});
app.get("/detailleproduct/:id", (req, res) => {


  Product.findById(req.params.id)
    .then((result) => {
      User.findOne({ userId: result.userId })
        .then((user) => {
          
          res.render("index7", { arr: result, user: user });
        })
        .catch((err) => {
        });

    })
    .catch((err) => {
    });


});
app.get("/index6-4.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'tous-int',
      status: 'approved'
    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'tous-int',
      status: 'approved'
    })
      .sort({ _id: -1 }) 
      .limit(3); 



    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
      mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'tous-int');

    res.render("index6", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory: tous-int"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);





    res.render("index6", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory: tous-int"
    });
  }
});
app.get("/index6-5.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'Swing chair',
      status: 'approved'
    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'Swing chair',
      status: 'approved'
    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'Swing chair');

    res.render("index6", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory:Swing chair"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);





    res.render("index6", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory:Swing chair"
    });
  }
});
app.get("/index6-2.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'tapis',
      status: 'approved'
    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'tapis',
      status: 'approved'
    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'tapis');

    res.render("index6", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory:tapis"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);





    res.render("index6", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory:tapis"
    });
  }
});
app.get("/index6-3.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'tous-ext',
      status: 'approved'
    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'tous-ext',
      status: 'approved'
    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'tous-ext');

    res.render("index6", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory:tous-ext"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);





    res.render("index6", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory:tous-ext"
    });
  }
});
app.get("/index6-1.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'Pots de fleurs',
      status: 'approved'
    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'Pots de fleurs',
      status: 'approved'
    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'Pots de fleurs');

    res.render("index6", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory:Pots de fleurs"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);





    res.render("index6", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory:Pots de fleurs"
    });
  }
});
app.get("/index6-6.html", async (req, res) => {
  try {
    const dbProducts = await Product.find({
      smallcategory: 'Lanterne de jardin',
      status: 'approved'
    }).limit(10);

    const carouselProducts = await Product.find({
      smallcategory: 'Lanterne de jardin',
      status: 'approved'
    })
      .sort({ _id: -1 }) 
      .limit(3); 


    const productes = dbProducts.map(product => ({
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      color: product.color || "غير محدد",
      category: product.category || "غير محدد",
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "بدون اسم",
      vendeur: product.vendeur || "غير معروف",
      bigcategory: product.bigcategory || "",
      smallcategory: product.smallcategory || "",
      _id: product._id
    }));

    const carouselData = carouselProducts.map(product => ({
     mainImages: product.mainImages[0] || "/uploads/default.jpg",
      name: product.name || "منتج",
      city: product.city || "غير محدد",
      price: product.price || 0,
      style: product.style || "غير محدد",
      _id: product._id
    }));

    carouselData.forEach((item, index) => {
    });

    const allAreSalon = productes.every(p => p.smallcategory === 'Lanterne de jardin');

    res.render("index6", {
      productes: productes,
      productesJson: JSON.stringify(productes),
      carouselProducts: carouselData,  
      carouselProductsJson: JSON.stringify(carouselData),
      title: "صالونات للبيع",
      count: productes.length,
      filter: "smallcategory:Lanterne de jardin"
    });

  } catch (error) {
    console.error('❌ خطأ:', error);





    res.render("index6", {
      productes: defaultProductes,
      productesJson: JSON.stringify(defaultProductes),
      carouselProducts: defaultCarousel,  
      carouselProductsJson: JSON.stringify(defaultCarousel),
      title: "صالونات (بيانات تجريبية)",
      count: defaultProductes.length,
      filter: "smallcategory:Lanterne de jardin"
    });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    
    const productData = {
      _id: product._id,
      name: product.name,
      color: product.color,
      mainImages: product.mainImages || [],
      additionalColors: product.additionalColors || [],
      price: product.price,
      description: product.description || '',
      size: product.size || 'standard'
    };
    
    res.json(productData);
    
  } catch (error) {
    console.error('❌ Erreur chargement produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});


const uploadFields = upload.fields([
  
  { name: 'mainImage1', maxCount: 1 },
  { name: 'mainImage2', maxCount: 1 },
  { name: 'mainImage3', maxCount: 1 },
  
  
  { name: 'color0Image1', maxCount: 1 },
  { name: 'color0Image2', maxCount: 1 },
  { name: 'color0Image3', maxCount: 1 },
  { name: 'color1Image1', maxCount: 1 },
  { name: 'color1Image2', maxCount: 1 },
  { name: 'color1Image3', maxCount: 1 },
  
  
  { name: 'additionalColor1Image1', maxCount: 1 },
  { name: 'additionalColor1Image2', maxCount: 1 },
  { name: 'additionalColor1Image3', maxCount: 1 },
  
  
  { name: 'additionalColor2Image1', maxCount: 1 },
  { name: 'additionalColor2Image2', maxCount: 1 },
  { name: 'additionalColor2Image3', maxCount: 1 }
]);

mongoose.connect(process.env.MONGODB_URI ,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    
  })
  .catch(err => console.error('❌ Erreur de connexion:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  }
}));

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

const requireAdminAuth = (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
};

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  storeName: { type: String, required: true },
  storeAddress: { type: String, required: true }, 
  storeLocation: { type: String, required: true },
  storeDescription: { type: String, required: true, maxlength: 500 }, 
   deliveryArea: { 
    type: String, 
    required: true,
    enum: ['toute_maroc', 'region_seule', 'ville_seule'],
    default: 'ville_seule'
  },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  
  city: { type: String, required: true },
  size: { 
    type: String, 
    required: true,
    enum: ['petit', 'moyen', 'grand'],
    default: 'moyen'
  },
  sale: { type: Boolean, default: false },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  style: { type: String },
  color: { type: String },
  category: { type: String, required: true },
  bigcategory: { type: String, required: true, enum: ['', 'meuble', 'decoration'] },
  smallcategory: { type: String, required: true },
  name: { type: String, required: true },
  vendeur: { type: String, required: true },
  userId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  colorCustom: { type: String }, 
  styleOther: { type: String }, 
  hasAdditionalColors: { type: Boolean, default: false },
  additionalColors: [{
    color: String,           
    colorCustom: String,     
    images: [String]         
  }],
  mainImages: [String],       
  totalImages: { type: Number, default: 0 }
});

const adminSchema = new mongoose.Schema({
  adminId: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Admin = mongoose.model('Admin', adminSchema);

async function createDefaultAdmin() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const adminId = 'ADM' + Date.now().toString().slice(-17);
      const hashedPassword = await bcrypt.hash(process.env.modepase, 10);
      const admin = new Admin({
        adminId: adminId,
        fullName: 'Administrateur Principal',
        password: hashedPassword
      });
      await admin.save();
    }
  } catch (err) {
    console.error('❌ Erreur création admin:', err);
  }
}

function generateUserId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const moroccanCities = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda",
  "Kénitra", "Tétouan", "Skhirat", "Béni Mellal", "El Jadida", "Taza", "Safi", "Nador",
  "Salé", "Khouribga", "Béni Mellal", "Erfoud", "Taroudant", "Berkane", "Al Hoceïma", "Tiznit",
  "Essaouira", "Larache", "Jerada", "Laâyoune", "Tan-Tan", "Ouezzane", "Sidi Kacem", "Tétouan",
  "Taourirt", "Sidi Slimane", "Sefrou", "Youssoufia", "Khenifra", "Boujdour", "Midelt", "Azilal",
  "Sidi Ifni", "Guelmim", "Errachidia", "Tizi Ouzou", "Berrechid", "Essaouira", "Ben Guerir",
  "El Kelaa des Sraghna", "Taroudant", "Autre"
];

const categories = {
  meuble: ['salon', 'cuisine', 'bureau', 'chambre', 'chambre enfant', 'salle de bain', 'salle à manger'],
  decoration: ['tous-int', 'Swing chair', 'tapis', 'tous-ext', 'Pots de fleurs', 'Lanterne de jardin']
};



app.get('/register', (req, res) => {
  res.render('register', {
    errors: null,
    formData: {},
    moroccanCities: moroccanCities
  });
});

app.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Nom complet requis'),
  body('storeName').trim().notEmpty().withMessage('Nom du magasin requis'),
  body('storeAddress').trim().notEmpty().withMessage('Adresse du magasin requise'),
  body('storeLocation').trim().notEmpty().withMessage('Emplacement du magasin requis'),
  body('storeDescription').trim().notEmpty().withMessage('Description du magasin requise')
    .isLength({ max: 500 }).withMessage('Description ne doit pas dépasser 500 caractères'),
  body('deliveryArea').isIn(['toute_maroc', 'region_seule', 'ville_seule'])
    .withMessage('Veuillez sélectionner une zone de livraison valide'),
  body('phone').trim().matches(/^[0-9]{10}$/).withMessage('Numéro de téléphone invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe doit avoir 6 caractères minimum'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Mots de passe ne correspondent pas');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('register', {
      errors: errors.array(),
      formData: req.body,
      moroccanCities: moroccanCities
    });
  }

  try {
    const userId = generateUserId();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      userId: userId,
      fullName: req.body.fullName,
      storeName: req.body.storeName,
      storeAddress: req.body.storeAddress,
      storeLocation: req.body.storeLocation,
      storeDescription: req.body.storeDescription,
      deliveryArea: req.body.deliveryArea, 
      phone: req.body.phone,
      password: hashedPassword
    });

    await user.save();

    req.session.userId = userId;
    req.session.storeName = req.body.storeName;
    req.session.deliveryArea = req.body.deliveryArea; 

    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Erreur inscription:', err);
    
    let errorMessage = 'Erreur lors de l\'inscription. Réessayez.';
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.phone) {
        errorMessage = 'Ce numéro de téléphone est déjà utilisé';
      }
    }
    
    res.render('register', {
      errors: [{ msg: errorMessage }],
      formData: req.body,
      moroccanCities: moroccanCities
    });
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.render('login', { error: 'ID ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('login', { error: 'ID ou mot de passe incorrect' });
    }

    req.session.userId = user.userId;
    req.session.storeName = user.storeName;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('❌ Erreur connexion:', err);
    res.render('login', { error: 'Erreur lors de la connexion' });
  }
});

app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.session.userId });
    const userProducts = await Product.find({ userId: req.session.userId });
    const approvedProducts = userProducts.filter(p => p.status === 'approved');
    const pendingProducts = userProducts.filter(p => p.status === 'pending');
    const rejectedProducts = userProducts.filter(p => p.status === 'rejected');

    const message = req.query.message;
    const messageType = req.query.type;

    res.render('dashboard', {
      user: user,
      approvedProducts: approvedProducts,
      pendingProducts: pendingProducts,
      rejectedProducts: rejectedProducts,
      storeName: req.session.storeName,
      message: message,           
      messageType: messageType,   
      error: null                 
    });
  } catch (err) {
    console.error('❌ Erreur dashboard:', err);
    res.redirect('/login');
  }
});

app.get('/add-product', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.session.userId });
    res.render('add-product', {
      user: user,
      moroccanCities: moroccanCities,
      categories: categories,
      error: null
    });
  } catch (err) {
    console.error('❌ Erreur page produit:', err);
    res.redirect('/dashboard');
  }
});

app.post('/add-product', requireAuth, uploadFields, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.session.userId });

    if (!req.body.size) {
      throw new Error('La taille du produit est obligatoire');
    }
    let finalStyle = req.body.style;
    if (req.body.style === 'autre' && req.body.styleOther) {
      finalStyle = req.body.styleOther;
    }

    
    let finalColor = req.body.color;
    if (req.body.color === 'autre' && req.body.colorCustom) {
      finalColor = req.body.colorCustom;
    }

    
    const mainImages = [];
    if (req.files['mainImage1']) {
      mainImages.push('/uploads/' + req.files['mainImage1'][0].filename);
    }
    if (req.files['mainImage2']) {
      mainImages.push('/uploads/' + req.files['mainImage2'][0].filename);
    }
    if (req.files['mainImage3']) {
      mainImages.push('/uploads/' + req.files['mainImage3'][0].filename);
    }

    
    if (mainImages.length === 0) {
      throw new Error('Veuillez télécharger au moins une image principale');
    }

    
    const hasAdditionalColors = req.body.hasAdditionalColors === 'yes';
    const additionalColors = [];
    let totalImages = mainImages.length;

    if (hasAdditionalColors) {
      
      if (req.body.additionalColor1) {
        const color1Images = [];
        
        if (req.files['additionalColor1Image1']) {
          color1Images.push('/uploads/' + req.files['additionalColor1Image1'][0].filename);
          totalImages++;
        }
        if (req.files['additionalColor1Image2']) {
          color1Images.push('/uploads/' + req.files['additionalColor1Image2'][0].filename);
          totalImages++;
        }
        if (req.files['additionalColor1Image3']) {
          color1Images.push('/uploads/' + req.files['additionalColor1Image3'][0].filename);
          totalImages++;
        }

        if (color1Images.length > 0) {
          const color1Name = req.body.additionalColor1 === 'autre' 
            ? (req.body.additionalColorCustom1 || 'Autre')
            : req.body.additionalColor1;
          
          additionalColors.push({
            color: color1Name,
            colorCustom: req.body.additionalColor1 === 'autre' ? req.body.additionalColorCustom1 : null,
            images: color1Images
          });
        }
      }

      
      if (req.body.additionalColor2) {
        const color2Images = [];
        
        if (req.files['additionalColor2Image1']) {
          color2Images.push('/uploads/' + req.files['additionalColor2Image1'][0].filename);
          totalImages++;
        }
        if (req.files['additionalColor2Image2']) {
          color2Images.push('/uploads/' + req.files['additionalColor2Image2'][0].filename);
          totalImages++;
        }
        if (req.files['additionalColor2Image3']) {
          color2Images.push('/uploads/' + req.files['additionalColor2Image3'][0].filename);
          totalImages++;
        }

        if (color2Images.length > 0) {
          const color2Name = req.body.additionalColor2 === 'autre' 
            ? (req.body.additionalColorCustom2 || 'Autre')
            : req.body.additionalColor2;
          
          additionalColors.push({
            color: color2Name,
            colorCustom: req.body.additionalColor2 === 'autre' ? req.body.additionalColorCustom2 : null,
            images: color2Images
          });
        }
      }
    }

    
    if (totalImages > 9) {
      throw new Error(`Maximum 9 images autorisées. Vous avez ${totalImages} images.`);
    }

    
    const product = new Product({
      city: req.body.city,
      description: req.body.description,
       size: req.body.size,
      sale: req.body.sale === 'true',
      price: parseFloat(req.body.price),
      style: finalStyle,
      color: finalColor,
      category: req.body.category,
      bigcategory: req.body.bigcategory,
      smallcategory: req.body.smallcategory,
     mainImages:mainImages, 
      name: req.body.name,
      vendeur: user.storeName,
      userId: req.session.userId,
      status: 'pending',
      
      
      colorCustom: req.body.color === 'autre' ? req.body.colorCustom : null,
      styleOther: req.body.style === 'autre' ? req.body.styleOther : null,
      hasAdditionalColors: hasAdditionalColors,
      additionalColors: additionalColors,
      mainImages: mainImages,
      totalImages: totalImages
    });

    await product.save();
    res.redirect('/dashboard');
    
  } catch (err) {
    console.error('❌ Erreur ajout produit:', err);
    
    
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        if (fileArray && fileArray[0]) {
          try {
            fs.unlinkSync(fileArray[0].path);
          } catch (unlinkErr) {
            console.error('Erreur suppression image:', unlinkErr);
          }
        }
      });
    }
    
    const user = await User.findOne({ userId: req.session.userId });
    res.render('add-product', {
      user: user,
      moroccanCities: moroccanCities,
      categories: categories,
      error: err.message || 'Erreur lors de l\'ajout du produit'
    });
  }
});



app.get('/edit-profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.session.userId });
    res.render('edit-profile', {
      user: user,
      moroccanCities: moroccanCities,
      error: null,
      success: null
    });
  } catch (err) {
    console.error('❌ Erreur profil:', err);
    res.redirect('/dashboard');
  }
});

app.post('/edit-profile', requireAuth, async (req, res) => {
  try {
    const { 
      fullName, 
      storeName, 
      storeAddress,
      storeLocation, 
      storeDescription,
      deliveryArea,
      phone 
    } = req.body;

    
    if (!fullName || !storeName || !storeAddress || !storeLocation || 
        !storeDescription || !deliveryArea || !phone) {
      return res.render('edit-profile', {
        user: await User.findOne({ userId: req.session.userId }),
        moroccanCities: moroccanCities,
        error: 'Tous les champs obligatoires doivent être remplis',
        success: null
      });
    }

    
    await User.findOneAndUpdate(
      { userId: req.session.userId },
      {
        $set: {
          fullName,
          storeName,
          storeAddress,
          storeLocation,
          storeDescription,
          deliveryArea,
          phone,
          updatedAt: new Date() 
        }
      },
      { new: true, runValidators: true } 
    );

    
    if (req.session.storeName !== storeName) {
      await Product.updateMany(
        { userId: req.session.userId },
        { $set: { vendeur: storeName } }
      );
    }

    
    req.session.storeName = storeName;
    req.session.fullName = fullName;

    
    const user = await User.findOne({ userId: req.session.userId });
    
    res.render('edit-profile', {
      user: user,
      moroccanCities: moroccanCities,
      error: null,
      success: '✅ Profil mis à jour avec succès'
    });
    
  } catch (err) {
    console.error('❌ Erreur mise à jour profil:', err);
    
    let errorMessage = 'Erreur lors de la mise à jour';
    
    
    if (err.name === 'ValidationError') {
      errorMessage = 'Données invalides';
    } else if (err.code === 11000) {
      errorMessage = 'Ce numéro de téléphone est déjà utilisé';
    }
    
    res.render('edit-profile', {
      user: await User.findOne({ userId: req.session.userId }) || { userId: req.session.userId },
      moroccanCities: moroccanCities,
      error: errorMessage,
      success: null
    });
  }
});



app.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: null });
});

app.post('/admin/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    const admin = await Admin.findOne({ adminId: adminId });

    if (!admin) {
      return res.render('admin-login', { error: 'معرف المسؤول أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.render('admin-login', { error: 'معرف المسؤول أو كلمة المرور غير صحيحة' });
    }

    req.session.adminId = admin.adminId;
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('❌ خطأ في تسجيل دخول المسؤول:', err);
    res.render('admin-login', { error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

app.get('/admin/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'pending' });
    const allUsers = await User.find().sort({ createdAt: -1 });
    const allProducts = await Product.find().sort({ createdAt: -1 }).limit(50);

    res.render('admin-dashboard', {
      pendingProducts: pendingProducts,
      allUsers: allUsers,
      allProducts: allProducts,
      moroccanCities: moroccanCities 
    });
  } catch (err) {
    console.error('❌ خطأ في لوحة تحكم المسؤول:', err);
    res.redirect('/admin/login');
  }
});

app.post('/admin/approve-product/:id', requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { status: status });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('❌ Erreur approbation:', err);
    res.redirect('/admin/dashboard');
  }
});

app.get('/admin/statistics', requireAdminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ status: 'approved' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });

    const mostViewedProducts = await Product.find({ status: 'approved' })
      .sort({ views: -1 })
      .limit(10);

    const usersByCity = await User.aggregate([
      { $group: { _id: "$storeLocation", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const productsByCategory = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.render('admin-statistics', {
      totalUsers,
      totalProducts,
      approvedProducts,
      pendingProducts,
      mostViewedProducts,
      usersByCity,
      productsByCategory
    });
  } catch (err) {
    console.error('❌ Erreur stats admin:', err);
    res.redirect('/admin/dashboard');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});
app.delete('/admin/delete-user/:userId', requireAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;


    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'الزبون غير موجود'
      });
    }

    const deleteProductsResult = await Product.deleteMany({ userId: userId });

    const deleteUserResult = await User.deleteOne({ userId: userId });

    if (deleteUserResult.deletedCount === 1) {

      res.json({
        success: true,
        message: `تم حذف الزبون "${user.storeName}" و ${deleteProductsResult.deletedCount} منتج بنجاح`,
        deletedProducts: deleteProductsResult.deletedCount,
        deletedUser: user.storeName
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'فشل في حذف الزبون'
      });
    }

  } catch (err) {
    console.error('❌ خطأ في حذف الزبون:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الزبون',
      error: err.message
    });
  }
});

app.put('/admin/delete-user/:userId', requireAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { confirmation } = req.body; 


    if (confirmation && confirmation !== 'CONFIRM_DELETE') {
      return res.status(400).json({
        success: false,
        message: 'تأكيد الحذف مطلوب'
      });
    }

    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'الزبون غير موجود'
      });
    }

    const userProductsCount = await Product.countDocuments({ userId: userId });

    await Product.deleteMany({ userId: userId });

    await User.deleteOne({ userId: userId });


    res.json({
      success: true,
      message: `تم حذف الزبون "${user.storeName}" و ${userProductsCount} منتج بنجاح`,
      deletedUser: {
        name: user.storeName,
        fullName: user.fullName,
        phone: user.phone,
        location: user.storeLocation
      },
      deletedProductsCount: userProductsCount
    });

  } catch (err) {
    console.error('❌ خطأ في حذف الزبون:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الزبون',
      error: err.message
    });
  }
});
app.delete('/admin/delete-product/:productId', requireAdminAuth, async (req, res) => {
  try {
    const { productId } = req.params;


    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    const deleteResult = await Product.findByIdAndDelete(productId);

    if (deleteResult) {

      if (product.mainImages[0] && product.mainImages[0] !== '/uploads/default.jpg') {
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, 'public', product.mainImages[0]);

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      res.json({
        success: true,
        message: `تم حذف المنتج "${product.name}" بنجاح`,
        deletedProduct: {
          name: product.name,
          price: product.price,
          vendeur: product.vendeur
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'فشل في حذف المنتج'
      });
    }

  } catch (err) {
    console.error('❌ خطأ في حذف المنتج:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف المنتج',
      error: err.message
    });
  }
});

app.put('/admin/delete-product/:productId', requireAdminAuth, async (req, res) => {
  try {
    const { productId } = req.params;


    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    const deletedProductData = {
      name: product.name,
      price: product.price,
      vendeur: product.vendeur,
      userId: product.userId,
     mainImages: product.mainImages[0],
      deletedAt: new Date()
    };

    await Product.findByIdAndDelete(productId);



    res.json({
      success: true,
      message: `تم حذف المنتج "${product.name}" بنجاح`,
      deletedProduct: deletedProductData
    });

  } catch (err) {
    console.error('❌ خطأ:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: err.message
    });
  }
});
app.put('/admin/update-product/:productId', requireAdminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;


    const allowedUpdates = ['name', 'price', 'city', 'category', 'style', 'color', 'description', 'sale', 'bigcategory', 'smallcategory'];
    const updates = {};

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );


    res.json({
      success: true,
      message: 'تم تحديث المنتج بنجاح',
      product: updatedProduct
    });

  } catch (err) {
    console.error('❌ خطأ في تحديث المنتج:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المنتج',
      error: err.message
    });
  }
});

app.post('/admin/update-product/:productId', requireAdminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name, price, city, category, style, color,
      description, sale, bigcategory, smallcategory
    } = req.body;


    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (city) product.city = city;
    if (category) product.category = category;
    if (style) product.style = style;
    if (color) product.color = color;
    if (description) product.description = description;
    if (sale !== undefined) product.sale = sale === 'true';
    if (bigcategory) product.bigcategory = bigcategory;
    if (smallcategory) product.smallcategory = smallcategory;

    await product.save();


    res.json({
      success: true,
      message: 'تم تحديث المنتج بنجاح',
      product: {
        id: product._id,
        name: product.name,
        price: product.price,
        city: product.city,
        category: product.category,
        vendeur: product.vendeur
      }
    });

  } catch (err) {
    console.error('❌ خطأ:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: err.message
    });
  }
});

app.get('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    if (product.userId !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce produit'
      });
    }

    res.json({
      success: true,
      product: product
    });

  } catch (err) {
    console.error('❌ Erreur récupération produit:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du produit'
    });
  }
});

app.put('/api/products/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const existingProduct = await Product.findOne({
      _id: productId,
      userId: userId
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé ou non autorisé'
      });
    }

    const updateData = {
      name: req.body.name || existingProduct.name,
      price: req.body.price ? parseFloat(req.body.price) : existingProduct.price,
      city: req.body.city || existingProduct.city,
      category: req.body.category || existingProduct.category,
      style: req.body.style || existingProduct.style,
      color: req.body.color || existingProduct.color,
      sale: req.body.sale ? req.body.sale === 'true' : existingProduct.sale,
      bigcategory: req.body.bigcategory || existingProduct.bigcategory,
      smallcategory: req.body.smallcategory || existingProduct.smallcategory,
      vendeur: req.body.vendeur || existingProduct.vendeur,
      updatedAt: Date.now()
    };

    if (req.file) {
      updateData.mainImages[0] = '/uploads/' + req.file.filename;

      const fs = require('fs');
      const path = require('path');
      const oldImagePath = path.join(__dirname, existingProduct.mainImages[0]);

      if (existingProduct.mainImages[0] !== '/uploads/default-product.jpg' &&
        fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('❌ Erreur suppression ancienne image:', err);
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du produit'
      });
    }

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      product: updatedProduct
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/products/:id', requireAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const product = await Product.findOne({
      _id: productId,
      userId: userId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé ou non autorisé'
      });
    }

    const fs = require('fs');
    const path = require('path');
    if (product.mainImages[0] && product.mainImages[0] !== '/uploads/default-product.jpg') {
      const imagePath = path.join(__dirname, product.mainImages[0]);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('❌ Erreur suppression image:', err);
        });
      }
    }

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du produit'
    });
  }
});

app.post('/api/products/:id/view', async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndUpdate(productId, {
      $inc: { views: 1 }
    });

    res.json({
      success: true,
      message: 'Vue enregistrée'
    });

  } catch (error) {
    console.error('❌ Erreur enregistrement vue:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/products/:id/click', async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndUpdate(productId, {
      $inc: { clicks: 1 }
    });

    res.json({
      success: true,
      message: 'Click enregistré'
    });

  } catch (error) {
    console.error('❌ Erreur enregistrement click:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


app.get('/edit-product/:id', requireAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const product = await Product.findOne({
      _id: productId,
      userId: userId
    });

    if (!product) {
      return res.status(404).render('404', {
        message: 'Produit non trouvé ou non autorisé'
      });
    }

    const user = await User.findOne({ userId: userId });

    res.render('edit-product', {
      product: product,
      user: user,
      moroccanCities: moroccanCities,
      categories: categories,
      storeName: req.session.storeName,
      error: null,
      success: null
    });

  } catch (err) {
    console.error('❌ Erreur page édition produit:', err);
    res.redirect('/dashboard');
  }
});


// ========== ROUTE POST POUR MODIFIER LE PRODUIT ==========
app.post('/edit-product/:id', requireAuth, uploadFields, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.userId;

    const existingProduct = await Product.findOne({
      _id: productId,
      userId: userId
    });

    if (!existingProduct) {
      const user = await User.findOne({ userId: userId });
      return res.render('edit-product', {
        product: null,
        user: user,
        moroccanCities: moroccanCities,
        categories: categories,
        storeName: req.session.storeName,
        error: 'Produit non trouvé ou non autorisé',
        success: null
      });
    }

    // ✅ معالجة الصور الرئيسية - مع الحذف الكامل للصور الفارغة
    const mainImages = [];
    
    for (let i = 1; i <= 3; i++) {
      // 1. إذا تم رفع صورة جديدة
      if (req.files && req.files[`mainImage${i}`]) {
        mainImages.push('/uploads/' + req.files[`mainImage${i}`][0].filename);
      } 
      // 2. إذا كانت هناك صورة موجودة في قاعدة البيانات ولم يتم حذفها
      else if (existingProduct.mainImages && existingProduct.mainImages[i-1]) {
        // نتحقق إذا كان المستخدم قد أرسل hidden input يحوي قيمة الصورة
        const existingImageValue = req.body[`existingMainImages${i-1}`];
        
        if (existingImageValue) {
          mainImages.push(existingImageValue);
        } else {
          // إذا لم تكن هناك قيمة، يعني أن المستخدم حذف الصورة
          mainImages.push(null);
        }
      } else {
        // 3. لا توجد صورة نهائياً
        mainImages.push(null);
      }
    }

    // ✅ تصفية الصور - حذف null و undefined
    const filteredMainImages = mainImages.filter(img => img !== null && img !== undefined);

    // ✅ معالجة الألوان الإضافية الموجودة
    const additionalColors = [];
    
    // معالجة الألوان الموجودة في قاعدة البيانات
    if (existingProduct.additionalColors && existingProduct.additionalColors.length > 0) {
      existingProduct.additionalColors.forEach((color, colorIndex) => {
        const colorImages = [];
        let hasAnyImage = false;
        
        for (let i = 1; i <= 3; i++) {
          // 1. إذا تم رفع صورة جديدة
          if (req.files && req.files[`color${colorIndex}Image${i}`]) {
            colorImages.push('/uploads/' + req.files[`color${colorIndex}Image${i}`][0].filename);
            hasAnyImage = true;
          } 
          // 2. إذا كانت هناك صورة موجودة في قاعدة البيانات
          else if (color.images && color.images[i-1]) {
            // نتحقق من وجود hidden input
            const existingImageValue = req.body[`existingColor${colorIndex}Image${i}`];
            
            if (existingImageValue) {
              colorImages.push(existingImageValue);
              hasAnyImage = true;
            } else {
              colorImages.push(null);
            }
          } else {
            colorImages.push(null);
          }
        }

        // ✅ فقط نضيف اللون إذا كان له على الأقل صورة واحدة
        if (hasAnyImage) {
          additionalColors.push({
            color: color.color,
            colorCustom: color.colorCustom || null,
            images: colorImages.filter(img => img !== null && img !== undefined)
          });
        }
      });
    }

    // ✅ معالجة الألوان الجديدة
    // Nouvelle couleur 1
    if (req.body.additionalColor1 && req.body.additionalColor1 !== '') {
      const color1Images = [];
      for (let i = 1; i <= 3; i++) {
        if (req.files && req.files[`additionalColor1Image${i}`]) {
          color1Images.push('/uploads/' + req.files[`additionalColor1Image${i}`][0].filename);
        }
      }
      
      // ✅ فقط نضيف اللون إذا كان له على الأقل صورة واحدة
      if (color1Images.length > 0) {
        additionalColors.push({
          color: req.body.additionalColor1 === 'autre' ? req.body.additionalColorCustom1 : req.body.additionalColor1,
          colorCustom: req.body.additionalColor1 === 'autre' ? req.body.additionalColorCustom1 : null,
          images: color1Images
        });
      }
    }

    // Nouvelle couleur 2
    if (req.body.additionalColor2 && req.body.additionalColor2 !== '') {
      const color2Images = [];
      for (let i = 1; i <= 3; i++) {
        if (req.files && req.files[`additionalColor2Image${i}`]) {
          color2Images.push('/uploads/' + req.files[`additionalColor2Image${i}`][0].filename);
        }
      }
      
      if (color2Images.length > 0) {
        additionalColors.push({
          color: req.body.additionalColor2 === 'autre' ? req.body.additionalColorCustom2 : req.body.additionalColor2,
          colorCustom: req.body.additionalColor2 === 'autre' ? req.body.additionalColorCustom2 : null,
          images: color2Images
        });
      }
    }

    // ✅ تحديث البيانات
    const updateData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      city: req.body.city,
      category: req.body.category,
      style: req.body.style === 'autre' ? req.body.styleOther : req.body.style,
      color: req.body.color === 'autre' ? req.body.colorCustom : req.body.color,
      size: req.body.size,
      sale: req.body.sale === 'true',
      bigcategory: req.body.bigcategory,
      smallcategory: req.body.smallcategory,
      description: req.body.description,
      colorCustom: req.body.color === 'autre' ? req.body.colorCustom : null,
      styleOther: req.body.style === 'autre' ? req.body.styleOther : null,
      hasAdditionalColors: additionalColors.length > 0,
      additionalColors: additionalColors,
      mainImages: filteredMainImages, // ✅ فقط الصور الموجودة
      totalImages: filteredMainImages.length + additionalColors.reduce((sum, color) => sum + color.images.length, 0),
      updatedAt: Date.now(),
      status: 'pending'
    };

    await Product.findByIdAndUpdate(productId, updateData);

    const updatedProduct = await Product.findById(productId);
    const user = await User.findOne({ userId: userId });

    res.render('edit-product', {
      product: updatedProduct,
      user: user,
      moroccanCities: moroccanCities,
      categories: categories,
      storeName: req.session.storeName,
      error: null,
      success: 'Produit mis à jour avec succès!'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour produit (POST):', error);

    const user = await User.findOne({ userId: req.session.userId });
    const product = await Product.findById(req.params.id);

    res.render('edit-product', {
      product: product,
      user: user,
      moroccanCities: moroccanCities,
      categories: categories,
      storeName: req.session.storeName,
      error: 'Erreur lors de la mise à jour du produit',
      success: null
    });
  }
});

app.get('/test', async (req, res) => {
  res.render('test');
});
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(
      { status: "approved" }, 
      {
        name: 1,
        city: 1,
        style: 1,
        color: 1,
        category: 1,
        bigcategory: 1, 
        smallcategory: 1,
        vendeur: 1,
       mainImages: 1,
        price: 1,
        status: 1
      }
    ).lean();

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/search', async (req, res) => {
  try {
    const query = req.query.q;

    const products = await Product.find({
      status: "approved", 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { style: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { bigcategory: { $regex: query, $options: 'i' } }, 
        { smallcategory: { $regex: query, $options: 'i' } },
        { vendeur: { $regex: query, $options: 'i' } }
      ]
    }, {
      name: 1,
      city: 1,
      style: 1,
      color: 1,
      category: 1,
      bigcategory: 1, 
      smallcategory: 1,
      vendeur: 1,
     mainImages: 1,
      price: 1,
      status: 1
    }).limit(10).lean();

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/products/suggestions', async (req, res) => {
  try {
    const query = req.query.q;

    const products = await Product.find({
      status: "approved", 
      $or: [
        { name: { $regex: query, $options: 'i' } }
      ]
    }, {
      name: 1,
     mainImages: 1,
      city: 1,
      bigcategory: 1, 
      category: 1
    }).limit(5).lean();

    res.json(products);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});
app.get('/api/filters-from-results', async (req, res) => {
  try {
    const { query, currentFilters } = req.query;
    let filterObj = {};

    if (currentFilters) {
      try {
        filterObj = JSON.parse(currentFilters);
      } catch (e) {
        console.error('Error parsing filters:', e);
      }
    }

    const searchQuery = { status: "approved" };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { style: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { vendeur: { $regex: query, $options: 'i' } }
      ];
    }

    if (filterObj.city && filterObj.city !== 'all') {
      searchQuery.city = filterObj.city;
    }
    if (filterObj.style && filterObj.style !== 'all') {
      searchQuery.style = filterObj.style;
    }
    if (filterObj.color && filterObj.color !== 'all') {
      searchQuery.color = filterObj.color;
    }
    if (filterObj.category && filterObj.category !== 'all') {
      searchQuery.category = filterObj.category;
    }

    if (filterObj.price && filterObj.price !== 'all') {
      if (filterObj.price === '500') {
        searchQuery.price = { $lte: 500 };
      } else if (filterObj.price === '1000') {
        searchQuery.price = { $gt: 500, $lte: 1000 };
      } else if (filterObj.price === '3000') {
        searchQuery.price = { $gt: 1000, $lte: 3000 };
      } else if (filterObj.price === '5000') {
        searchQuery.price = { $gt: 3000 };
      }
    }

    const products = await Product.find(searchQuery, {
      city: 1,
      style: 1,
      color: 1,
      category: 1,
      price: 1
    }).lean();

    const filters = {
      cities: [...new Set(products.map(p => p.city).filter(Boolean))].sort(),
      styles: [...new Set(products.map(p => p.style).filter(Boolean))].sort(),
      colors: [...new Set(products.map(p => p.color).filter(Boolean))].sort(),
      categories: [...new Set(products.map(p => p.category).filter(Boolean))].sort(),
      priceRanges: {
        '500': products.filter(p => (p.price || 0) <= 500).length > 0,
        '1000': products.filter(p => (p.price || 0) > 500 && (p.price || 0) <= 1000).length > 0,
        '3000': products.filter(p => (p.price || 0) > 1000 && (p.price || 0) <= 3000).length > 0,
        '5000': products.filter(p => (p.price || 0) > 3000).length > 0
      }
    };

    res.json(filters);
  } catch (error) {
    console.error('Error fetching filters from results:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});
app.get('/api/products/similar', async (req, res) => {
  try {
    const { category, city, exclude } = req.query;

    const query = {
      status: "approved",
      _id: { $ne: exclude }
    };

    const orConditions = [];

    if (category) {
      orConditions.push({ category: { $regex: category, $options: 'i' } });
      orConditions.push({ bigcategory: { $regex: category, $options: 'i' } });
      orConditions.push({ smallcategory: { $regex: category, $options: 'i' } });
    }

    if (city) {
      orConditions.push({ city: city });
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    const products = await Product.find(query, {
      name: 1,
      city: 1,
      style: 1,
     mainImages: 1,
      price: 1,
      _id: 1,
      category: 1
    }).limit(8).lean();

    res.json(products);
  } catch (error) {
    console.error('Similar products error:', error);
    res.status(500).json({ error: 'Failed to get similar products' });
  }
});
app.get('/search', async (req, res) => {
  try {
    const query = req.query.query || '';
    const selectedId = req.query.selectedId || '';


    let searchQuery = { status: "approved" };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { style: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { vendeur: { $regex: query, $options: 'i' } },
        { bigcategory: { $regex: query, $options: 'i' } },
        { smallcategory: { $regex: query, $options: 'i' } }
      ];
    }

    const searchResults = await Product.find(searchQuery, {
      name: 1,
      city: 1,
      style: 1,
      color: 1,
      category: 1,
      bigcategory: 1,
      smallcategory: 1,
      vendeur: 1,
     mainImages: 1,
      price: 1,
      _id: 1,
      status: 1
    }).limit(100).lean();

    let selectedProduct = null;
    if (selectedId) {
      selectedProduct = await Product.findOne({
        _id: selectedId,
        status: "approved"
      }).lean();
    }

    let similarProducts = [];
    if (selectedProduct) {
      similarProducts = await Product.find({
        status: "approved",
        _id: { $ne: selectedId },
        $or: [
          { category: selectedProduct.category },
          { city: selectedProduct.city },
          { style: selectedProduct.style },
          { bigcategory: selectedProduct.bigcategory }
        ]
      }, {
        name: 1,
        city: 1,
        style: 1,
       mainImages: 1,
        price: 1,
        _id: 1,
        category: 1
      }).limit(8).lean();
    }

    res.render('search', {
      query: query,
      searchResults: searchResults,
      selectedProduct: selectedProduct,
      similarProducts: similarProducts,
      totalResults: searchResults.length
    });

  } catch (error) {
    console.error('Search GET route error:', error);
    res.render('search', {
      query: req.query.query || '',
      searchResults: [],
      selectedProduct: null,
      similarProducts: [],
      totalResults: 0
    });
  }
});

app.post('/search', async (req, res) => {
  try {
    const query = req.body.query || '';
    const selectedProductId = req.body.selectedProductId || '';


    let searchQuery = { status: "approved" };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { style: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { vendeur: { $regex: query, $options: 'i' } },
        { bigcategory: { $regex: query, $options: 'i' } },
        { smallcategory: { $regex: query, $options: 'i' } }
      ];
    }

    const searchResults = await Product.find(searchQuery, {
      name: 1,
      city: 1,
      style: 1,
      color: 1,
      category: 1,
      bigcategory: 1,
      smallcategory: 1,
      vendeur: 1,
     mainImages: 1,
      price: 1,
      _id: 1
    }).limit(100).lean();

    let selectedProduct = null;
    if (selectedProductId) {
      selectedProduct = await Product.findOne({
        _id: selectedProductId,
        status: "approved"
      }).lean();
    }

    let similarProducts = [];
    if (selectedProduct) {
      similarProducts = await Product.find({
        status: "approved",
        _id: { $ne: selectedProductId },
        $or: [
          { category: selectedProduct.category },
          { city: selectedProduct.city },
          { style: selectedProduct.style },
          { bigcategory: selectedProduct.bigcategory }
        ]
      }, {
        name: 1,
        city: 1,
        style: 1,
       mainImages: 1,
        price: 1,
        _id: 1,
        category: 1
      }).limit(8).lean();
    }

    res.render('search', {
      query: query,
      searchResults: searchResults,
      selectedProduct: selectedProduct,
      similarProducts: similarProducts,
      totalResults: searchResults.length
    });

  } catch (error) {
    console.error('Search POST route error:', error);
    res.render('search', {
      query: req.body.query || '',
      searchResults: [],
      selectedProduct: null,
      similarProducts: [],
      totalResults: 0
    });
  }
});
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  
  app.listen(PORT, async () => {
    await createDefaultAdmin();
    
  });
}
module.exports = app;
