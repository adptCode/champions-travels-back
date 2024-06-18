import { body } from 'express-validator';


export const loginValidator = [
  body("email").isEmail().withMessage("Provide valid email"),
  body("password")
    .exists().withMessage("Password is required")
    .isString().withMessage("Password should be string")
    .isLength({ min: 5 }).withMessage("Password should be at least 5 characters")
];

export const registerValidator = [
  body("email").isEmail().withMessage("Provide valid email"),
  body("password")
    .exists().withMessage("Password is required")
    .isString().withMessage("Password should be string")
    .isLength({ min: 5 }).withMessage("Password should be at least 5 characters")
    .custom(value => {
      if (value == '123456') {
        throw new Error('Este pass es muy básico');
      }
      return true;
    }),
  body("first_name").isString().withMessage("First name should be string"),
  body("last_name").isString().withMessage("Last name should be string"),
  body("birth_date")
    .isISO8601().withMessage("Birth date should be a valid date in YYYY-MM-DD format")
    .custom(value => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        throw new Error('Debes ser mayor de edad para registrarte.');
      }
      return true;
    })
];

export const forgotPasswordValidator = [
    body("email").isEmail()
];

export const changePasswordValidator = [
    body("token")
        .exists(),
        body("password")
        .exists()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password should be string")
        .isLength({ min: 5 })
        .withMessage("Password should be at least 5 characters")
];
