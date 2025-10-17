class roi {
    calculateROI(amountGained, amountSpent) {
        if (amountGained <= 0) {
            throw new Error("Amount gained must be greater than zero.");
        }
        if (amountSpent < 0) {
            throw new Error("Amount spent cannot be negative.");
        }
        //if roi is < an amount = 1, greater than another amount = 2, and so on
        return ((amountGained - amountSpent) / amountSpent) * 100;
    }
}