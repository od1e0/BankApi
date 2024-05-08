const { prisma } = require("../prisma/prisma-client");
const { getCard } = require("./card-controller");
const { check, validationResult } = require('express-validator');


const TransactionController = {
  getRecentTransactions: async (req, res) => {
    try {
      const { userId } = req.params;
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      transactions.forEach(c => {
        c.amount = parseFloat(c.amount.toFixed(2));
      });

      res.json(transactions);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Не удалось получить транзакции",
      });
    }
  },

  getAllTransactions: async (req, res) => {
    try {
      const { userId } = req.params;
      const transactions = await prisma.transaction.findMany({
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

      transactions.forEach(c => {
        c.amount = parseFloat(c.amount.toFixed(2));
      });

      res.json(transactions);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Не удалось получить транзакции",
      });
    }
  },

  sendMoney: [
    check('toCard').isLength({ min: 1 }).withMessage('Номер карты не должен быть пустым'),
    check('amount').isFloat({ min: 0 }).withMessage('Сумма должна быть положительным числом'),

    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { toCard, userId } = req.body;
        const card = await prisma.card.findMany({
          where: {
            userId: userId,
          },
          include: {
            user: true,
          },
          take: 1,
        });

        const cardTo = await prisma.card.findMany({
          where: {
            cardNumber: toCard,
          },
          include: {
            user: true,
          },
          take: 1,
        });

        const fromCard = card[0]?.cardNumber;
        const balance = card[0]?.balance;

        if (Number(req.body.amount) > balance) {
          return res.status(404).json({
            error: "Недостаточно средств",
          });
        }
        if (Number(req.body.amount) === 0) {
          return res.status(404).json({
            error: "Введите сумма большу 0",
          });
        }
        const cardToUpdate = cardTo[0];
        if (!cardToUpdate) {
          return res.status(404).json({
            error: "Карта не найдена",
          });
        }

        const transaction = await prisma.transaction.create({
          data: {
            amount: Number(req.body.amount),
            fromCard,
            toCard,
            userId,
          },
        });

        await prisma.card.update({
          where: { id: cardToUpdate.id },
          data: { balance: { increment: Number(req.body.amount) } },
        });
        await prisma.card.update({
          where: { id: card[0]?.id },
          data: { balance: { decrement: Number(req.body.amount) } },
        });

        

        res.json(transaction);
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: "Не удалось отправить деньги",
        });
      }
    }
  ],
};

module.exports = TransactionController;
