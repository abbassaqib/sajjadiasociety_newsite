import * as z from "zod";

const subscribeFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
});

export default subscribeFormSchema;
