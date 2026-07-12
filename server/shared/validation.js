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
  sn: z.string().min(1, 'Serial number is required').trim(),
  description: z.string().min(2, 'Item description must be at least 2 characters').trim(),
  pack: z.string().min(1, 'Pack type is required').trim(),
  batch: z.string().min(1, 'Batch number is required').trim(),
  productionDate: z.string().min(1, 'Production date is required').trim(),
  expiryDate: z.string().min(1, 'Expiry date is required').trim(),
  qty: z.preprocess((val) => Number(val), z.number().int().nonnegative('Quantity cannot be negative')),
  costRate: z.preprocess((val) => Number(val), z.number().nonnegative('Cost rate cannot be negative')),
  amount: z.preprocess((val) => Number(val), z.number().nonnegative('Amount cannot be negative')),
  mrp: z.preprocess((val) => Number(val), z.number().positive('MRP must be greater than zero')),
  discount: z.preprocess((val) => val === '' || val === undefined ? 0 : Number(val), z.number().nonnegative().max(100, 'Discount cannot exceed 100%').default(0)),
  remarks: z.string().optional()
});

export const MedicineSchema = MedicineBaseSchema;

export const MedicineUpdateSchema = MedicineBaseSchema.partial();

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
