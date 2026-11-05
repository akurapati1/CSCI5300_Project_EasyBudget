const FREQUENCIES = ['weekly', 'bi-weekly', 'monthly'];

const isPositiveNumber = (v) => typeof v !== 'undefined' && v !== '' && Number.isFinite(Number(v)) && Number(v) > 0;
const isValidDate = (v) => !Number.isNaN(new Date(v).getTime());

/** Validate an income/expense payload. Returns an error message, or null when valid. */
function validateTransaction({ date, amount, description, frequency } = {}) {
    if (!date || !amount || !description || !frequency) return 'All fields are required.';
    if (!isValidDate(date)) return 'Date is invalid.';
    if (!isPositiveNumber(amount)) return 'Amount must be a positive number.';
    if (typeof description !== 'string' || !description.trim()) return 'Description is required.';
    if (description.length > 200) return 'Description must be 200 characters or fewer.';
    if (!FREQUENCIES.includes(frequency)) return `Frequency must be one of: ${FREQUENCIES.join(', ')}.`;
    return null;
}

/** Validate a savings goal payload. Returns an error message, or null when valid. */
function validateSavingsGoal({ goalName, goalAmount, allocatedPercentage } = {}) {
    if (!goalName || !goalAmount || !allocatedPercentage) return 'All fields are required.';
    if (typeof goalName !== 'string' || !goalName.trim()) return 'Goal name is required.';
    if (!isPositiveNumber(goalAmount)) return 'Goal amount must be a positive number.';
    if (!isPositiveNumber(allocatedPercentage) || Number(allocatedPercentage) > 100) {
        return 'Allocated percentage must be greater than 0 and at most 100.';
    }
    return null;
}

module.exports = { validateTransaction, validateSavingsGoal, FREQUENCIES };
