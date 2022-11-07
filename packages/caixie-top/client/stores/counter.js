"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCounterStore = void 0;
const pinia_1 = require("../../node_modules/pinia");
exports.useCounterStore = (0, pinia_1.defineStore)({
    id: 'counter',
    state: () => ({
        counter: 0,
    }),
    getters: {
        doubleCount: (state) => state.counter * 2,
    },
    actions: {
        increment() {
            this.counter++;
        },
    },
});
//# sourceMappingURL=counter.js.map