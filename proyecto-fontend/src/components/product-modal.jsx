"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

export function ProductModal({ product, onClose, onSave, apiEndpoints, categories, shelfId }) {
  const [formData, setFormData] = useState({
    id_producto: null,
    nombre: "",
    cantidad: 0,
    estado: "activo",
    codigoQr: "",
    categoria: { id: 1, descripcion: "" },
    estanteria: { id_estanteria: shelfId },
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        id_producto: product.id_producto,
        nombre: product.nombre || "",
        cantidad: product.cantidad || 0,
        estado: product.estado || "activo",
        codigoQr: product.codigoQr || "",
        categoria: product.categoria || { id: 1, descripcion: "" },
        estanteria: { id_estanteria: shelfId },
      })
    } else {
      // Nuevo producto
      setFormData({
        id_producto: null,
        nombre: "",
        cantidad: 0,
        estado: "activo",
        codigoQr: "",
        categoria: { id: 1, descripcion: "" },
        estanteria: { id_estanteria: shelfId },
      })
    }
  }, [product, shelfId])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCategoryChange = (categoryId) => {
    const selectedCategory = categories.find((cat) => cat.id.toString() === categoryId.toString())
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        categoria: { id: selectedCategory.id, descripcion: selectedCategory.descripcion },
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar datos básicos
      if (!formData.nombre.trim()) {
        throw new Error("El nombre del producto es obligatorio")
      }

      if (formData.cantidad < 0) {
        throw new Error("La cantidad no puede ser negativa")
      }

      if (!formData.categoria || !formData.categoria.id) {
        throw new Error("Debe seleccionar una categoría")
      }

      // Preparar el objeto para enviar a la API
      const productData = {
        ...formData,
        // Asegurarse de que la estantería esté correctamente formateada
        estanteria: { id_estanteria: shelfId },
      }

      console.log("Enviando datos del producto:", JSON.stringify(productData))

      await onSave(productData)
      onClose()
    } catch (error) {
      console.error("Error al guardar el producto:", error)
      alert("Error al guardar el producto: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Añadir Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => handleChange("cantidad", Number.parseInt(e.target.value) || 0)}
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigoQr">Código QR</Label>
              <Input
                id="codigoQr"
                value={formData.codigoQr || ""}
                onChange={(e) => handleChange("codigoQr", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={formData.categoria?.id?.toString()} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="estado"
              checked={formData.estado === "activo"}
              onCheckedChange={(checked) => handleChange("estado", checked ? "activo" : "desactivado")}
            />
            <Label htmlFor="estado">Activo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
