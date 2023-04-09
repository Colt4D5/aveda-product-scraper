const puppeteer = require('puppeteer')
const fs = require('fs')

const urls = [
  'https://www.aveda.com/hair-care',
  'https://www.aveda.com/styling',
  'https://www.aveda.com/skin-care',
  'https://www.aveda.com/body-care',
  'https://www.aveda.com/makeup-products',
  'https://www.aveda.com/mens-products',
  'https://www.aveda.com/aroma-products',
]

async function getProducts(url) {

  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null 
  });
  // const browser = await puppeteer.launch(
  //   defaultViewport: null
  // );
  const page = await browser.newPage();

  await page.goto(url, {waitUntil: 'load', timeout: 0});

  // Set screen size
  await page.setViewport({width: 1920, height: 1024});


  const allProducts = []

  // loop each url and get products
  try {

    await page.waitForSelector('li.swiper-slide', {timeout: 0})
    
    const products = await page.$$('li.swiper-slide')
    
    for (product of products) {

      const currProduct = {
        name: null,
        img: null,
        link: null,
        price: null,
      }

      const productName = await page.evaluate(el => el.querySelector('h2').textContent, product)
      currProduct.name = productName.trim()
      
      const productImg = await page.evaluate(el => el.querySelector('picture source').getAttribute('srcset'), product)
      currProduct.img = productImg.trim()
      
      const productLink = await page.evaluate(el => el.querySelector('a[rel="prefetch"]').getAttribute('href'), product)
      currProduct.link = productLink.trim()
      
      const productPrice= await page.evaluate(el => el.querySelector('form .text-lg-2').textContent, product)
      currProduct.price = productPrice.trim().replace('$', '')

      allProducts.push(currProduct)
    }
  } catch (err) {
    console.log(err)
  }

  // console.log(allProducts)

  const categoryArr = url.split('/')
  const category = categoryArr[categoryArr.length - 1]

  fs.writeFile(`./${category}.json`, JSON.stringify(allProducts), err => {
    if (err) {
      console.error(err);
    }
    console.log(`File written successfully for ${category}`)
  });

  await browser.close();
}

const getProductsInit = async () => {
  for (url of urls) {
    console.log(`Starting ${url}...`)
    await getProducts(url)
    console.log(`Done with ${url}!`)
  }
}
getProductsInit()