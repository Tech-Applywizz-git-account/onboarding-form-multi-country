const { z } = require('zod');

// Simulating a simplified version of the schema
const schema = z.object({
  convicted_of_felony: z.enum(["yes", "no"]),
  felony_explanation: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.convicted_of_felony === "yes") {
    if (!data.felony_explanation || data.felony_explanation.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["felony_explanation"],
      });
    }
  }
});

const testData = {
    convicted_of_felony: "yes",
    felony_explanation: "   " // Just spaces
};

const result = schema.safeParse(testData);
if (!result.success) {
    console.log("Validation failed (Correct):", JSON.stringify(result.error.issues, null, 2));
} else {
    console.log("Validation passed (Incorrect):", result.data);
}
