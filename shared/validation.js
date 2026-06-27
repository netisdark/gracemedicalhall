import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const SignupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const MedicineBaseSchema = z.object({
  name: z.string().min(2, 'Medicine name must be at least 2 characters').trim(),
  company: z.string().min(2, 'Company name must be at least 2 characters').trim(),
  batchNo: z.string().min(1, 'Batch number is required').trim(),
  productionDate: z.preprocess((val) => new Date(val), z.date({ invalid_type_error: 'Invalid production date' })),
  expiryDate: z.preprocess((val) => new Date(val), z.date({ invalid_type_error: 'Invalid expiry date' })),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative('Stock cannot be negative')),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be greater than zero')),
  discount: z.preprocess((val) => val === '' || val === undefined ? 0 : Number(val), z.number().nonnegative().max(100, 'Discount cannot exceed 100%').default(0))
});

export const MedicineSchema = MedicineBaseSchema.refine(data => data.expiryDate > data.productionDate, {
  message: "Expiry date must be after production date",
  path: ["expiryDate"]
});

export const MedicineUpdateSchema = MedicineBaseSchema.partial().refine(data => {
  if (data.expiryDate && data.productionDate) {
    return data.expiryDate > data.productionDate;
  }
  return true;
}, {
  message: "Expiry date must be after production date",
  path: ["expiryDate"]
});

export const SaleItemSchema = z.object({
  medicineId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid medicine ID'),
  quantity: z.preprocess((val) => Number(val), z.number().int().positive('Quantity must be at least 1')),
  price: z.preprocess((val) => Number(val), z.number().positive('Price must be greater than zero')),
  discount: z.preprocess((val) => val === '' || val === undefined ? 0 : Number(val), z.number().nonnegative().max(100, 'Discount cannot exceed 100%').default(0))
});

export const SaleSchema = z.object({
  items: z.array(SaleItemSchema).min(1, 'Cart must contain at least one item'),
  paymentMethod: z.enum(['Cash', 'Card', 'Fonepay'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  })
});
