export const getPrecision = (value: string) => {
  // check if number has decimals
  if (value.indexOf(".") !== -1) {
    return Math.pow(10, value.split(".")[1].length * -1);
  } else {
    return 1; // default precision if the number is an integer
  }
};
