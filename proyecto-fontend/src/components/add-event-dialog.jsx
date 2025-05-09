"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

export default function AddEventDialog({ isOpen, onClose, onAddEvent, selectedDate }) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]
      setDate(formattedDate)
    }
  }, [selectedDate])

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = "El título es obligatorio"
    if (!date) newErrors.date = "La fecha es obligatoria"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onAddEvent(title, new Date(date))
      setTitle("")
      setDate("")
      setErrors({})
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir nuevo evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <div className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.title}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Fecha
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <div className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.date}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Añadir evento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
