/**
 * Minimal in-memory stand-in for the Mongoose User model, so API tests run with no database.
 * Supports exactly the queries the controllers use.
 */
let counter = 0;
const store = new Map();

class FakeUser {
    constructor(data = {}) {
        this._id = String(++counter).padStart(24, '0');
        this.income = [];
        this.expenses = [];
        this.savingsGoals = [];
        Object.assign(this, data);
        ['income', 'expenses', 'savingsGoals'].forEach((key) => {
            const arr = this[key];
            // Mongoose gives array sub-documents their own _id; mimic that on push.
            const push = arr.push.bind(arr);
            arr.push = (item) => push({ _id: String(++counter).padStart(24, '0'), ...item });
        });
    }

    async save() {
        store.set(this._id, this);
        return this;
    }

    static reset() {
        store.clear();
    }

    static all() {
        return [...store.values()];
    }

    static async findOne(query) {
        return (
            FakeUser.all().find((u) =>
                Object.entries(query).every(([key, cond]) => {
                    if (cond && typeof cond === 'object' && '$gt' in cond) return u[key] && u[key] > cond.$gt;
                    if (cond && typeof cond === 'object') throw new Error('Operator objects are not supported (possible injection)');
                    return u[key] === cond;
                })
            ) || null
        );
    }

    static findById(id) {
        const found = store.get(id) || null;
        const promise = Promise.resolve(found);
        promise.select = () => Promise.resolve(found);
        return promise;
    }
}

module.exports = FakeUser;
