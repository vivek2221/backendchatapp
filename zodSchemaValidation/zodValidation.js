import z from 'zod'
const nameSchema=z.string().min(3,'name is less than 3 length');
const emailSchema=z.email('enter the email correctly');
const passwordSchema=z.string().min(3,'password should be greater than 3');
export {
    nameSchema,
    emailSchema,
    passwordSchema
}