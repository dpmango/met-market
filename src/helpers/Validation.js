export const ruPhoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/i;

export const phoneMaskCleared = (phone) => {
  return phone.replace(/\s+/g, '');
};
