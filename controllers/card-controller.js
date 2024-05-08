const { prisma } = require("../prisma/prisma-client");
const { check, validationResult } = require("express-validator");

const CardController = {
  createCard: [
    check("cardHolder")
      .isLength({ min: 1 })
      .withMessage("Имя владельца карты не должно быть пустым"),
    check("cardHolder")
      .isLength({ max: 20 })
      .withMessage("Имя владельца карты не должно превышать 20 символов")
      .isAlpha()
      .withMessage("Имя владельца карты должно содержать только буквы"),

    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const genCardNumber = generateCardNumber();
        const validity = generateValidity();
        const { cardHolder, userId } = req.body;

        const card = await prisma.card.create({
          data: {
            userId,
            cardNumber: genCardNumber,
            cardHolder,
            validity,
            balance: 0,
          },
        });

        res.json(card);
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: "Не удалось создать карту",
        });
      }
    },
  ],
  getCard: async (req, res) => {
    try {
      const { userId } = req.params;
      const card = await prisma.card.findMany({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
      });

      card.forEach(c => {
        c.balance = parseFloat(c.balance.toFixed(2));
      });

      res.json(card);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Не удалось найти карту",
      });
    }
  },
};

function generateCardNumber() {
  let cardNumber = "";
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function generateValidity() {
  const validity = new Date();
  validity.setFullYear(validity.getFullYear() + 3);
  return validity.toLocaleDateString("en-GB", {
    month: "2-digit",
    year: "2-digit",
  });
}

module.exports = CardController;
