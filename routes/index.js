const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { TransactionController, CardController, UserController, CreditController } = require("../controllers");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.current);

router.post("/transactions/send",authenticateToken, TransactionController.sendMoney);
router.get("/transactions/all/:userId", authenticateToken, TransactionController.getAllTransactions)
router.get("/transactions/recent/:userId", authenticateToken, TransactionController.getRecentTransactions)

router.post("/cards", authenticateToken, CardController.createCard)
router.get("/cards/:userId", authenticateToken, CardController.getCard)

router.post("/credit", authenticateToken, CreditController.createCredit)
router.get("/credits/:userId", authenticateToken, CreditController.getAllCredits)
router.get("/credits/admin/:userId", authenticateToken, CreditController.getAllCreditsForAdmin)
router.patch("/credit/:id", authenticateToken, CreditController.updateCredit)

module.exports = router;