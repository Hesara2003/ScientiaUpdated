
/**
 * 
 * @param {...string} classes - The class names to be joined.
 * @returns {string} - A string containing the joined class names.
 */
export const cn = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };
  