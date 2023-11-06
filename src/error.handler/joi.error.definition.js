import joi from "joi";

const createCategories = joi.object({
  name: joi.string(),
  order: joi.number()
});

const createMenus = joi.object({
  name: joi.string(),
  description: joi.string(),
  image: joi.string(),
  price: joi.number().min(1),
  order: joi.number(),
  status: joi
    .string()
    .valid("FOR_SALE", "SOLD_OUT")
    .label("status는 FOR_SALE 혹은 SOLD_OUT 중 한가지만 설정 가능합니다"),
});

export { createCategories, createMenus };
