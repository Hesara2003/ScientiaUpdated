/**
 * Trigger cart updated event to update cart indicators across the app
 */
export const triggerCartUpdated = () => {
  const event = new Event('cartUpdated');
  window.dispatchEvent(event);
};