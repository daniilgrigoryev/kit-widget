export const getUUID = function getUUID(): string {
  // https://gist.github.com/jed/982883
  return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function () {
    return (0 | (Math.random() * 16)).toString(16);
  });
};
