"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatters"
import { startTransition, useActionState, useEffect, useState } from "react"
import { addProduct } from "../../_actions/product"
import { useFormStatus } from "react-dom"

export function ProductForm() {
  const [state, action] = useActionState(addProduct, {})
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priceInCents, setPriceInCents] = useState<number | "">("")

  useEffect(() => {
    if (!state.values) return

    startTransition(() => {
      setName(state.values!.name)
      setDescription(state.values!.description)
      setPriceInCents(state.values!.priceInCents === "" ? "" : Number(state.values!.priceInCents))
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
          onChange={e => setPriceInCents(e.target.value === "" ? "" : Number(e.target.value))}
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
        <Input type="file" id="file" name="file" required></Input>
        {state.errors?.file?.[0] && (
          <div className="text-destructive">{state.errors.file[0]}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required></Input>
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