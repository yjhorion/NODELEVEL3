import express from "express";
import Categoriesrouter from "./routes/categories.router.js";
import MenusRouter from "./routes/menus.router.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/api", [Categoriesrouter, MenusRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
