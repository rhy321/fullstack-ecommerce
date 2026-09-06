"use server"

import { db } from "@/db/db"
import { z } from "zod"
import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"

const fileSchema = z.instanceof(File, { message: "Required" })
const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/")
)

//file size checks in here in case of editing
const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  file: fileSchema.refine(file => file.size > 0, "Required"),
  image: imageSchema.refine(file => file.size > 0, "Required")
})

type FormState = {
  errors?: Record<string, string[] | undefined>
  values?: {
    name: string
    description: string
    priceInCents: string
  }
}

//: Promise<FormState> means "This function will eventually return a FormState object."

export async function addProduct(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  
  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    priceInCents: String(formData.get("priceInCents") ?? ""),
  }

  const result = addSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return {
      errors: z.flattenError(result.error).fieldErrors,
      values,
    }
  }

  const data = result.data

  //where we store product files
  await fs.mkdir("products", {recursive: true})

  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))


  await fs.mkdir("public/products", {recursive: true})

  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
  await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))

  await db.product.create({ data: {
    isAvailableForPurchase: false,
    name: data.name,
    description: data.description,
    priceInCents: data.priceInCents,
    filePath,
    imagePath
  }})

  redirect("/admin/products")
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional()
})

export async function updateProduct(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  
  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    priceInCents: String(formData.get("priceInCents") ?? ""),
  }

  const result = editSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!result.success) {
    return {
      errors: z.flattenError(result.error).fieldErrors,
      values,
    }
  }

  const data = result.data //data user gave
  const product = await db.product.findUnique({where: {id}}) //lookup in db

  if (product == null) return notFound()

  
  let filePath = product.filePath //default filepath
  
  //if user uploaded new files
  if (data.file != null && data.file.size > 0) {

    await fs.unlink(product.filePath)
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
    
  }

  let imagePath = product.imagePath

  //if user uploaded new files
  if (data.image != null && data.image.size > 0) {

    await fs.unlink(`public${product.imagePath}`)
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))
    
  }

  await db.product.update({
    where: { id },
    data: {
    name: data.name,
    description: data.description,
    priceInCents: data.priceInCents,
    filePath,
    imagePath
  }})

  redirect("/admin/products")
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({where: {id}, data: {
    isAvailableForPurchase
  }})
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({where: {id}})

  if (product == null) return notFound()

  await fs.unlink(product.filePath)
  await fs.unlink(`public${product.imagePath}`)
}