import express from "express";
import { prisma } from "../utils/prisma/index.js";
import joi from "joi";

const router = express.Router();

const createCategories = joi.object({
  name: joi.string(),
  order: joi.number(),
});

/** 카테고리 등록 **/
router.post("/categories", async (req, res) => {
  try {
    const validation = await createCategories.validateAsync(req.body);
    const { name, order } = validation;

    if (!name) {
      return res
        .status(400)
        .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    }

    //뭔가 더 논리적으로 깔끔한 코드를 만들 수 있을 것같아. 필요없는 코드 같음...
    const maxOrder = await prisma.Categories.findFirst({
      orderBy: { order: "desc" },
    });

    const orderPlus = maxOrder ? maxOrder.order + 1 : 1; //order + 1 해주기 위함. (id는 따로 있어서 autoincrement불가로 인하여 불가피하게 +1씩 해줌)

    const category = await prisma.Categories.create({
      data: { name, order: +orderPlus },
    });
    return res.status(200).json({ messge: "카테고리를 등록하였습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 카테고리 목록 조회 **/
router.get("/categories", async (req, res) => {
  try {
    const validation = await createCategories.validateAsync(req.body);
    const category = await prisma.Categories.findMany({
      select: {
        categoryId: true,
        name: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });

    if (!category) {
      return res.status(400).json({ errorMessage: "데이터가 없습니다." });
    }

    return res.status(200).json({ data: category });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 카테고리 정보 변경 **/
router.patch("/categories/:categoryId", async (req, res) => {
  try {
    const validation = await createCategories.validateAsync(req.body);
    const { name, order } = validation;
    const { categoryId } = req.params;

    if (!name || !order) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

    const currentCategory = await prisma.Categories.findFirst({
      where: { order: +order },
    });

    if (currentCategory) {
      await prisma.categories.updateMany({
        where: {
          OR: [{ order: { gt: order } }, { order }],
        },
        data: { order: { increment: 1 } },
      });
    }

    console.log(currentCategory.order);

    //기본조건 : 수정한다고 두 order의 값들이 뒤바뀌진않음.
    //입력받은 order : order
    //수정할 order: currentCate.order
    // 1. 기존 order 보다 뒷번호로 교체
    // 교체되는 order보다 큰 order들 : order-1
    // 2. 기존 order 보다 앞번호로 교체
    // 교체되는 order보다 작은 order 값들 : order+1

    await prisma.Categories.update({
      data: { name, order },
      where: {
        categoryId: +categoryId,
      },
      // orderBy: { order: "desc" },
    });
    return res.status(200).json({ messge: "카테고리 정보를 수정하였습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 카테고리 삭제 **/
router.delete("/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

    const category = await prisma.Categories.findFirst({
      where: { categoryId: +categoryId },
    });

    if (!category) {
      return res.status(400).json({ message: "존재하지않는 카테고리입니다." });
    }

    await prisma.Categories.delete({ where: { categoryId: +categoryId } });

    return res.status(200).json({ messge: "카테고리 정보를 삭제하였습니다." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
