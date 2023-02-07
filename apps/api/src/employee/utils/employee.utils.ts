export const getPaginationDetails = (pageRequest: number, totalCount: number) => {
  const limit: number = 3;
  let totalPages: number = Math.trunc(totalCount / limit);
  const isFraction: number = totalCount % limit;
  if (isFraction > 0) totalPages += 1;
  if (pageRequest > totalPages || pageRequest < 1) return undefined;
  const skip: number = limit * (pageRequest - 1);
  return {
    skip: skip,
    limit: limit,
    total: totalPages,
  };
};
