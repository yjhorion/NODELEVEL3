import express from "express";
import { prisma } from "../utils/prisma/index.js";
import { createCategories } from "../error.handler/joi.error.definition.js";

const router = express.Router();

//라우터 넣어주세요

// https://hanghae00-assets-1.s3.ap-northeast-2.amazonaws.com/sampleIMG.jpg

/* 카테고리 등록 */
router.post("/categories", async (req, res, next) => {
  try {
    const validation = await createCategories.validateAsync(req.body);
    const { name } = validation;
    let order = 1;
    const currentCategory = await prisma.categories.findFirst({
      orderBy: { order: "desc" },
    });
    if (currentCategory) {
      order = currentCategory.order + 1;
    }
    const category = await prisma.categories.create({
      data: { name, order },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(201).json({ message: "카테고리가 등록되었습니다." });
});

/* 카테고리 전체조회 */
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.categories.findMany({
      select: {
        categoryId: true,
        name: true,
        order: true,
      },
    });
    return res.status(200).json({ data: categories });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/* 카테고리 정보 수정 */
router.patch("/categories/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const validation = await createCategories.validateAsync(req.body);
    const { name, order } = validation;

    const currentCategory = await prisma.categories.findFirst({
      where: { order: order },
    });

    if (currentCategory) {
      await prisma.categories.updateMany({
        where: { OR: [{ order: { gt: order } }, { order }] },
        data: { order: { increment: 1 } },
      });
    }
    await prisma.categories.update({
      where: { categoryId: +categoryId },
      data: { name, order },
    });
    res.status(201).json({ message: "카테고리 수정이 완료되었습니다 " });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/* 카테고리 삭제 */
router.delete("/categories/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.categories.findFirst({
      where: { categoryId: +categoryId },
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: "해당 카테고리가 존재하지 않습니다" });
    }

    await prisma.categories.delete({
      where: { categoryId: +categoryId },
    });
    return res.status(200).json({ message: "카테고리 정보를 삭제하였습니다" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
