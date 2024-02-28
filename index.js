import { getProducts, getProduct } from "./api.js";
import { createOrder, retrieveOrder } from "./klarna.js";
import express from "express";
const app = express();
import { config } from "dotenv";
config();

app.get("/", async (req, res) => {
  const products = await getProducts();
  const markup = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; justify-items: center; padding: 10px;">
            ${products
              .map(
                (p) =>
                  `<a href="/products/${p.id}" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: black; border: solid 2px black; padding: 8px; width: 100%; max-width: 400px;">
                    <img src="${p.image}" alt="${p.title}" style="width: 100%; max-width: 100px; margin-bottom: 8px;"/>
                    ${p.title} - ${p.price} kr
                </a>`
              )
              .join("")}
        </div>
    `;
  res.send(markup);
});

app.get("/products/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const product = await getProduct(id);
    const klarnaResponse = await createOrder(product);
    const html_snippet = klarnaResponse.html_snippet;
    res.send(html_snippet);
  } catch (error) {
    res.send(error.message);
  }
});

app.get("/confirmation", async function (req, res) {
  const order_id = req.query.order_id;
  // Antagande att `retrieveOrder` är funktionen som hämtar ordern från Klarna med givet ID
  const order = await retrieveOrder(order_id);
  const html_snippet = order.html_snippet;
  if (html_snippet) {
    // Skicka tillbaka orderns detaljer eller en bekräftelsesida
    res.send(html_snippet);
  } else {
    // Hantera fall där ordern inte hitta
    res.status(404).send("Order not found");
  }
});

app.listen(process.env.PORT);
