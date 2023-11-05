import express from "express";
import { prisma } from "../utils/prisma/index.js";
import joi from "joi";

const router = express.Router();

const createMenus = joi.object({
  name: joi.string(),
  order: joi.number(),
  description: joi.string(),
  image: joi.string(),
  price: joi.number().min(1).label("메뉴 가격은 0보다 작을 수 없습니다."),
  status: joi.string().valid("FOR_SALE", "SOLD_OUT"),
});

/** 메뉴 등록 **/
router.post("/categories/:categoryId/menus", async (req, res) => {
  try {
    const validation = await createMenus.validateAsync(req.body);
    const { name, description, image, price, order } = validation;
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ message: "존재하지 않는 카테고리입니다." });
    }

    const maxOrder = await prisma.menus.findFirst({
      orderBy: { order: "desc" },
    });

    const orderPlus = maxOrder ? maxOrder.order + 1 : 1; //order + 1 해주기 위함. (id는 따로 있어서 autoincrement불가로 인하여 불가피하게 +1씩 해줌)

    const menu = await prisma.menus.create({
      data: {
        CategoryId: +categoryId,
        name,
        description,
        image,
        price,
        order: +orderPlus,
      },
    });

    return res.status(200).json({ message: "메뉴를 등록하였습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 카테고리별 메뉴 조회 **/
router.get("/categories/:categoryId/menus", async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

    const menu = await prisma.menus.findMany({
      select: {
        CategoryId: true,
        menuId: true,
        name: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
      where: { CategoryId: +categoryId, deletedAt: null },
      orderBy: { order: "asc" },
    });

    if (!menu) {
      return res.status(400).json({ message: "존재하지 않는 카테고리입니다." });
    }

    return res.status(200).json({ data: menu });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 메뉴 상세 조회 **/
router.get("/categories/:categoryId/menus/:menuId", async (req, res) => {
  try {
    const { categoryId, menuId } = req.params;

    if (!categoryId || !menuId) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

    //소프트딜리트 쓰는 경우 => where에 deletedAt: null 넣기
    const menu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId, menuId: +menuId, deletedAt: null },
      select: {
        CategoryId: true,
        name: true,
        description: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
    });

    if (!menu) {
      return res.status(400).json({ message: "존재하지 않는 카테고리입니다." });
    }

    return res.status(200).json({ data: menu });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 메뉴 수정 **/
router.patch("/categories/:categoryId/menus/:menuId", async (req, res) => {
  try {
    const validation = await createMenus.validateAsync(req.body);
    const { name, description, price, order, status } = validation;
    const { categoryId, menuId } = req.params;

    // if (status !== "FOR_SALE" || status !== "SOLD_OUT") {
    //   return res
    //     .status(400)
    //     .json({ message: "FOR_SALE와 SOLD_OUT만 입력해주세요." });
    // }

    const menu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId, menuId: +menuId },
      orderBy: { order: "desc" },
    });

    if (!menu) {
      return res.status(400).json({ message: "존재하지 않는 메뉴입니다." });
    }

    const currentMenu = await prisma.menus.findFirst({
      where: { order: +order },
    });

    if (currentMenu) {
      await prisma.menus.updateMany({
        where: {
          CategoryId: +categoryId,
          OR: [{ order: { gt: order } }, { order }],
        },
        data: { order: { increment: 1 } },
      });
    }

    await prisma.menus.update({
      data: { name, description, price, order, status },
      where: { CategoryId: +categoryId, menuId: +menuId },
    });

    return res.status(200).json({ message: "메뉴를 수정하였습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 메뉴 삭제 **/
router.delete("/categories/:categoryId/menus/:menuId", async (req, res) => {
  try {
    const { categoryId, menuId } = req.params;

    const menu = await prisma.menus.findUnique({
      where: { CategoryId: +categoryId, menuId: +menuId },
    });

    // await prisma.menus.delete({
    //   where: { CategoryId: +categoryId, menuId: +menuId },
    // });
    //소프트딜리트를 할 것인가 말 것인가 그것이 문제로다.
    await prisma.menus.update({
      where: { CategoryId: +categoryId, menuId: +menuId },
      data: { deletedAt: new Date() },
    });

    return res.status(200).json({ message: "메뉴를 삭제하였습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
