import { body } from 'express-validator';

export const eventValidator = [
  body("title")
    .exists().withMessage("Title is required")
    .isString().withMessage("Title should be a string")
    .isLength({ min: 5 }).withMessage("Title should be at least 5 characters"),
  body("description")
    .exists().withMessage("Description is required")
    .isString().withMessage("Description should be a string"),
  body("event_date")
    .exists().withMessage("Event date is required")
    .isISO8601().withMessage("Event date should be a valid date"),
  body("location")
    .exists().withMessage("Location is required")
    .isString().withMessage("Location should be a string")
];