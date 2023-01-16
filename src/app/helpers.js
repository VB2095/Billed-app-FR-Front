export const compareBillsByDate = (billA, billB) => {
    return new Date(billB.date) > new Date(billA.date);
  }