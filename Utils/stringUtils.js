




export const removeHyphens = (str) => {
  return str.replace(/-/g, ' ');
}

export const capitalizeEachWord = (str) => {
  return str.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
}
