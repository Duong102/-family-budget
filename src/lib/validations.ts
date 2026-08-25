import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const baseRegisterFields = {
  name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
};

export const createHouseholdSchema = z.object({
  ...baseRegisterFields,
  householdName: z.string().trim().min(1, "Vui lòng nhập tên hộ gia đình"),
});

export const joinHouseholdSchema = z.object({
  ...baseRegisterFields,
  inviteCode: z.string().trim().min(1, "Vui lòng nhập mã mời"),
});

export const walletSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên ví"),
  type: z.enum(["CASH", "BANK", "CREDIT", "EWALLET", "OTHER"]),
  initialBalance: z.coerce.number().default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên danh mục"),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().optional(),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    amount: z.coerce.number().positive("Số tiền phải lớn hơn 0"),
    walletId: z.string().min(1, "Vui lòng chọn ví"),
    toWalletId: z.string().optional(),
    categoryId: z.string().optional(),
    note: z.string().optional(),
    date: z.string().min(1, "Vui lòng chọn ngày"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "TRANSFER") {
      if (!data.toWalletId) {
        ctx.addIssue({ code: "custom", message: "Vui lòng chọn ví nhận", path: ["toWalletId"] });
      } else if (data.toWalletId === data.walletId) {
        ctx.addIssue({
          code: "custom",
          message: "Ví nguồn và ví nhận phải khác nhau",
          path: ["toWalletId"],
        });
      }
    } else if (!data.categoryId) {
      ctx.addIssue({ code: "custom", message: "Vui lòng chọn danh mục", path: ["categoryId"] });
    }
  });

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  limitAmount: z.coerce.number().positive("Hạn mức phải lớn hơn 0"),
});

export const savingsGoalSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên mục tiêu"),
  targetAmount: z.coerce.number().positive("Số tiền mục tiêu phải lớn hơn 0"),
  currentAmount: z.coerce.number().min(0, "Số tiền đã có không được âm").default(0),
  targetDate: z.string().optional(),
});
