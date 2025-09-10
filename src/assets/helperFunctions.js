export const convertTimestamps = (docData) => {
  if (!docData) {
    return null;
  }
  const data = { ...docData };
  for (const key in data) {
    if (data[key] && typeof data[key].seconds === 'number') {
      // then to a universal ISO string format (e.g., "2025-09-08T12:30:00.000Z").
      data[key] = new Date(data[key].seconds * 1000).toISOString();
    }
  }
  return data;
};


export const getDefaultRouteForRole =  function (role) {
  switch (role) {
    case "sales":
      return "/sales";
    case "admin":
    case "superuser":
      return "/dashboard";
    case "manager":
      return "/manager";
    case "dispatch":
      return "/dispatch";
    case "accounts":
      return "/accounts";
    default:
      return "/unauthorized";
  }
}