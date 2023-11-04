import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

//라우터 넣어주세요

// https://hanghae00-assets-1.s3.ap-northeast-2.amazonaws.com/sampleIMG.jpg

/* 카테고리 등록 */
router.post("/categories", async (req, res, next) => {
  const { name } = req.body;
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
  return res.status(201).json({ message: "카테고리가 등록되었습니다." });
});

/* 이미 등록되어있는 카테고리를 order 기준 내림차순으로 정렬, 첫번째를 찾는다 (order값이 가장 큰 값) */
//   if (categoriesExists !== 0) {
//   const lastCategory = await prisma.categories.findFirst({
//     where: {
//       NOT: { order: null },
//     },
//     orderBy: {
//       order: "desc",
//     },
//   });

//   /* 등록된 카테고리가 없다면, order의 값은 1, 있다면 마지막 order값에 1을 더한값을 부여한다 */

//     const order = lastCategory.order + 1;

//   const categories = await prisma.categories.create({
//     data: { name, order },
//   });
//   return res.status(201).json({ message: "카테고리를 등록하였습니다." });
// } else {
//     const order = 1
//     const categories = prisma.categories.create({
//         data : { name, order }
//     })
//     return res.status(200).
// }
// });

// router.post("/categories", async (req, res, next) => {
//     const { name } = req.body;
//     const categoriesExists = await prisma.categories.count();

//   });

/* 카테고리 전체조회 */
router.get("/categories", async (req, res, next) => {
  const categories = await prisma.categories.findMany({
    select: {
      categoryId: true,
      name: true,
      order: true,
    },
  });
  return res.status(200).json({ data: categories });
});

/* 카테고리 정보 수정 */
router.patch("/categories/:categoryId", async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, order } = req.body;


  const currentCategory = await prisma.categories.findFirst({
    where: { order: order },
  });
  

  if (currentCategory) {

    await prisma.categories.updateMany({
        where : { OR :[{order : { gt: order}}, {order}] },
        data : { order : { increment : 1 }}

    })
}
await prisma.categories.update({
  where: { categoryId: +categoryId },
  data: { name, order},
})


res.status(201).json({ message: "카테고리 수정이 완료되었습니다 " });
})

/*
router.patch("/categories/:categoryId", async (req, res, next) => {
  const { categoryId } = req.params;
  const { name, order } = req.body;

  const currentCategory = await prisma.categories.findFirst({
    where: { order: order },
  });

  if (currentCategory) {
    await prisma.$queryRaw`UPDATE "Categories" SET "order" = "order" + 1 WHERE "order" >= ${order}`;
  }

  await prisma.categories.update({
    where: { categoryId: +categoryId },
    data: { name, order },
  });

  res.status(201).json({ message: "카테고리 수정이 완료되었습니다" });
});

 */




/* 카테고리 삭제 */
router.delete("/categories/:categoryId", async (req, res, next) => {
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
});

export default router;
