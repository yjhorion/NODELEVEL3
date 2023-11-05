import express from "express";
import { prisma } from "../utils/prisma/index.js";
import { createMenus } from "../error.handler/joi.error.definition.js";

const router = express.Router();

/* 메뉴등록 */
router.post("/categories/:categoryId/menus", async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const validation = await createMenus.validateAsync(req.body);
    const { name, description, image, price } = validation;

    const targetCategory = await prisma.categories.findFirst({
      where: { categoryId: +categoryId },
    });

    if (!targetCategory) {
      return res
        .status(404)
        .json({ message: "등록되지 않은 카테고리입니다. " });
    }

    let order = 1;
    const currentMenu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId },
      orderBy: { order: "desc" },
    });

    if (currentMenu) {
      order = currentMenu.order + 1;
    }

    const menu = await prisma.menus.create({
      data: { CategoryId: +categoryId, name, order, description, image, price },
    });
    return res.status(201).json({ message: "메뉴가 등록되었습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/* 메뉴 전체 조회 */
router.get("/categories/:categoryId/menus", async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const targetCategory = await prisma.categories.findFirst({
      where: { categoryId: +categoryId },
    });
    const targetMenu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId },
    });

    if (!targetCategory) {
      return res.status(404).json({ message: "존재하지 않는 카테고리입니다 " });
    } else if (!targetMenu) {
      return res
        .status(404)
        .json({ message: "해당 카테고리에 등록된 메뉴가 없습니다 " });
    }

    const data = await prisma.menus.findMany({
      where: { CategoryId: +categoryId },
      orderBy: { order: "asc" },
      select: {
        menuId: true,
        name: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
    });
    return res.status(200).json({ menus: data });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/* 메뉴 상세 조회 */
router.get("/categories/:categoryId/menus/:menuId", async (req, res, next) => {
  try {
    const { categoryId, menuId } = req.params;

    const targetMenu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId, menuId: +menuId },
    });

    const targetCategory = await prisma.categories.findFirst({
      where: { categoryId: +categoryId },
    });

    const targetCategoryMenu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId },
    });

    if (!targetCategory) {
      return res.status(404).json({ message: "등록되지 않은 카테고리입니다" });
    } else if (!targetCategoryMenu) {
      return res
        .status(404)
        .json({ message: "메뉴가 등록되지 않은 카테고리입니다" });
    } else if (!targetMenu) {
      return res.status(404).json({ message: "등록되지 않은 메뉴입니다" });
    }

    const menu = await prisma.menus.findFirst({
      where: { CategoryId: +categoryId, menuId: +menuId },
      select: {
        menuId: true,
        name: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
    });
    return res.status(200).json({ menu });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/* 메뉴 수정 */
router.patch(
  "/categories/:categoryId/menus/:menuId",
  async (req, res, next) => {
    try {
      const { categoryId, menuId } = req.params;
      const validation = await createMenus.validateAsync(req.body);
      const { name, description, price, order, status } = validation;

      const currentMenu = await prisma.menus.findFirst({
        where: { CategoryId: +categoryId, order },
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
        where: { CategoryId: +categoryId, menuId: +menuId },
        data: { name, description, price, order, status },
      });
      return res.status(201).json({ message: "메뉴 정보가 수정되었습니다" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

/* 메뉴 삭제 */
router.delete(
  "/categories/:cateogoryId/menus/:menuId",
  async (req, res, next) => {
    try {
      const { categoryId, menuId } = req.params;

      const deletingMenu = await prisma.menus.findFirst({
        where: { menuId: +menuId },
      });

      if (!deletingMenu) {
        return res
          .status(404)
          .json({ message: "삭제하려는 메뉴가 존재하지 않습니다" });
      }

      await prisma.menus.delete({
        where: { menuId: +menuId },
      });
      return res.status(200).json({ message: "메뉴가 삭제되었습니다" });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

export default router;
