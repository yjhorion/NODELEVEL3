import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

/** 메뉴 등록 **/
router.post("/categories/:categoryId/menus", async (req, res) => {
  const { name, description, image, price, order } = req.body;
  const { categoryId } = req.params;

  if (!name || !description || !image) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  } else if (!categoryId) {
    return res.status(400).json({ message: "존재하지 않는 카테고리입니다." });
  } else if (price <= 0) {
    return res
      .status(400)
      .json({ messge: "메뉴 가격은 0보다 작을 수 없습니다. " });
  }

  //뭔가 더 논리적으로 깔끔한 코드를 만들 수 있을 것같아. 필요없는 코드 같음...
  const maxOrder = await prisma.menus.findFirst({
    orderBy: { order: "desc" },
  });

  const orderPlus = maxOrder ? maxOrder.order + 1 : 1; //order + 1 해주기 위함. (id는 따로 있어서 autoincrement불가로 인하여 불가피하게 +1씩 해줌)

  const menus = await prisma.menus.create({
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
});

/** 카테고리별 메뉴 조회 **/
router.get("/categories/:categoryId/menus", async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  const menus = await prisma.menus.findMany({
    where: { CategoryId: +categoryId },
    orderBy: { order: "desc" },
    select: {
      CategoryId: true,
      menuId: true,
      name: true,
      image: true,
      price: true,
      order: true,
      status: true,
    },
  });

  if (!menus) {
    return res.status(400).json({ message: "존재하지 않는 카테고리입니다." });
  }

  return res.status(200).json({ data: menus });
});

/** 메뉴 상세 조회 **/
router.get("/categories/:categoryId/menus/:menuId", async (req, res) => {
  const { categoryId, menuId } = req.params;

  if (!categoryId || !menuId) {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  const menus = await prisma.menus.findFirst({
    where: { CategoryId: +categoryId, menuId: +menuId },
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

  if (!menus) {
    return res.status(400).json({ message: "존재하지 않는 카테고리입니다." });
  }

  return res.status(200).json({ data: menus });
});

/** 메뉴 수정 **/
router.patch("/categories/:categoryId/menus/:menuId", async (req, res) => {
  const { name, description, price, order, status } = req.body;
  const { categoryId, menuId } = req.params;

  if (!categoryId || !menuId) {
    return res
      .status(400)
      .json({ message: "주소 Id의 데이터형식이 올바르지 않습니다." });
  } else if (!name || !description || !order || !status) {
    return res.status(400).json({ message: "데이터형식이 올바르지 않습니다." });
  } else if (price <= 0) {
    return res
      .status(400)
      .json({ messge: "메뉴 가격은 0보다 작을 수 없습니다. " });
  } else if (!price) {
    return res.status(400).json({ message: "데이터형식이 올바르지 않습니다." });
  } else if (
    status.toUpperCase() !== "FOR_SALE" ||
    status.toUpperCase() !== "SOLD_OUT"
  ) {
    return res
      .status(400)
      .json({ message: " FOR_SALE와 SOLD_OUT만 입력해주세요. " });
  }

  const menus = await prisma.menus.findFirst({
    where: { CategoryId: +categoryId, menuId: +menuId },
    orderBy: { order: "desc" },
  });

  if (!menus) {
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
    data: { name, description, price, order, status: status.toUpperCase() },
    where: { CategoryId: +categoryId, menuId: +menuId },
  });

  return res.status(200).json({ message: "메뉴를 수정하였습니다." });
});

/** 메뉴 삭제 **/
router.delete("/categories/:categoryId/menus/:menuId", async (req, res) => {
  const { categoryId, menuId } = req.params;

  const menus = await prisma.menus.findUnique({
    where: { CategoryId: +categoryId, menuId: +menuId },
  });

  await prisma.menus.delete({
    where: { CategoryId: +categoryId, menuId: +menuId },
  });

  return res.status(200).json({ message: "메뉴를 삭제하였습니다." });
});

export default router;
