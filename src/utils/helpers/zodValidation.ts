import { z } from "zod";

export const searchListInputSchema = () => {
  return z
    .object({
      pageSize: z.string().optional(),
      offset: z.string().optional(),
      search: z.string().optional(),
      filter: z.string().optional(),
      sort: z.string().optional(),
      companyId: z.number().optional(),
      email: z.string().optional(),
    })
    .optional();
};
