const records = [
    { id: 1, item: "早餐", amount: 15 },
    { id: 2, item: "打车", amount: 30 },
    { id: 3, item: "购买书籍", amount: 88 },
    { id: 4, item: "退款", amount: -20 },      
    { id: 5, item: "错误数据", amount: "50" }  
];
const cleanData = (list) => {
    return list.filter(record => typeof record.amount === 'number' && record.amount > 0);
};
const calculateTotal = (list) => {
    return list.reduce((sum, record) => sum + record.amount, 0);
};
const getItemNames = (list) => {
    return list.map(record => record.item);
};
const getMaxExpense = (list) => {
    if (list.length === 0) return null;
    return list.reduce((max, record) => record.amount > max.amount ? record : max, list[0]);
};
