const { prisma } = require("../prisma/prisma-client");
const { check, validationResult } = require("express-validator");

const CreditController = {
  createCredit: [
    check("amount")
      .isFloat({ min: 0 })
      .withMessage("Сумма должна быть положительным числом"),

    async (req, res) => {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        const errorMessages = error.array().map((error) => error.msg);
        return res.status(400).json({ error: errorMessages });
      }

      try {
        const { fullName, userId, number } = req.body;

        const existingCredit = await prisma.credit.findFirst({
          where: {
            userId: userId,
          },
          orderBy: {
            createdAt: 'desc',
        },
        });
        console.log(existingCredit.status)
        if (existingCredit.status !== "Отказано") 
        {
          return res.status(400).json({
            error: "У вас уже есть кредит!",
          });
        }

        const credit = await prisma.credit.create({
          data: {
            userId,
            fullName,
            passportId: req.body.passportId,
            number,
            amount: Number(req.body.amount),
            status: "Обработка",
          },
        });

        res.json(credit);
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: "Не удалось подать заявку",
        });
      }
    },
  ],

  getAllCredits: async (req, res) => {
    try {
      const { userId } = req.params;
      const credits = await prisma.credit.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      credits.forEach((c) => {
        c.amount = parseFloat(c.amount.toFixed(2));
      });

      res.json(credits);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Не удалось получить кредиты",
      });
    }
  },

  getAllCreditsForAdmin: async (req, res) => {
    try {
      const { userId } = req.params;
      const credits = await prisma.credit.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      if (userId !== "6639e82810ad6718a9cc091c") {
        return res.status(400).json({
          error: "Отказано в доступе",
        });
      }

      credits.forEach((c) => {
        c.amount = parseFloat(c.amount.toFixed(2));
      });

      res.json(credits);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Не удалось получить кредиты",
      });
    }
  },
  updateCredit: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const credit = await prisma.credit.findUnique({
        where: {
          id: id,
        },
      });

      if (!credit) {
        return res.status(400).json({
          error: "Кредит не найден",
        });
      }

      const updatedCredit = await prisma.credit.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });

      res.json(updatedCredit);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Не удалось обновить кредит",
      });
    }
  },
};

module.exports = CreditController;
