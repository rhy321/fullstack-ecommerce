"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatters"
import { startTransition, useActionState, useEffect, useState } from "react"
import { addProduct, updateProduct } from "../../_actions/product"
import { useFormStatus } from "react-dom"
import { Product } from "../../../../../generated/prisma/browser"
import Image from "next/image"

export function ProductForm({ product }: { product?: Product | null }) {
  const [state, action] = useActionState(
    product == null ? 
    addProduct : 
    updateProduct.bind(null, product.id), {}
  )
  const [name, setName] = useState(product ? product.name : "")
  const [description, setDescription] = useState(product ? product.description : "")
  const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents)

  useEffect(() => {
    if (!state.values) return

    startTransition(() => {
      setName(state.values!.name)
      setDescription(state.values!.description)
      setPriceInCents(state.values!.priceInCents === undefined ? undefined : Number(state.values!.priceInCents))
    })
  }, [state.values])

  return (

    <form action={action} className="space-y-8">

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        {state.errors?.name?.[0] && (
          <div className="text-destructive">{state.errors.name[0]}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          value={priceInCents}
          onChange={e => setPriceInCents(e.target.value === undefined ? undefined : Number(e.target.value))}
          required
        />
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
        {state.errors?.priceInCents?.[0] && (
          <div className="text-destructive">{state.errors.priceInCents[0]}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        {state.errors?.description?.[0] && (
          <div className="text-destructive">{state.errors.description[0]}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input
          type="file"
          id="file"
          name="file"
          required={product == null}
        />
        {product != null &&
          <div className="text-muted-foreground">{product.filePath}</div>
        }
        {state.errors?.file?.[0] && (
          <div className="text-destructive">{state.errors.file[0]}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required={product == null} />
        {product != null &&
          <Image src={product.imagePath} height='200' width='200' alt="Product Image" />
        }
        {state.errors?.image?.[0] && (
          <div className="text-destructive">{state.errors.image[0]}</div>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  )
}