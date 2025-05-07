"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

export function ProductModal({
  product,
  onClose,
  apiEndpoints,
  categories,
  shelfId,
  onSaved,
}) {
  const [formData, setFormData] = useState({
    id_producto: null,
    nombre: "",
    cantidad: 0,
    codigoQr: "",
    estado: "activo",
    fecha_creacion: new Date().toISOString().split("T")[0],
    categoria: categories[0] || { id: 1, descripcion: "" },
    estanteria: { id_estanteria: shelfId },
  })
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        id_producto: product.id_producto,
        nombre: product.nombre || "",
        cantidad: product.cantidad || 0,
        codigoQr: product.codigoQr || "",
        estado: product.estado || "activo",
        fecha_creacion: product.fecha_creacion
          ? product.fecha_creacion.split("T")[0]
          : new Date().toISOString().split("T")[0],
        categoria: product.categoria || categories[0],
        estanteria: { id_estanteria: shelfId },
      })
      setFile(null)
    } else {
      setFormData({
        id_producto: null,
        nombre: "",
        cantidad: 0,
        codigoQr: "",
        estado: "activo",
        fecha_creacion: new Date().toISOString().split("T")[0],
        categoria: categories[0] || { id: 1, descripcion: "" },
        estanteria: { id_estanteria: shelfId },
      })
      setFile(null)
    }
  }, [product, shelfId, categories])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = categoryId => {
    const selected = categories.find(c => c.id.toString() === categoryId)
    if (selected) {
      setFormData(prev => ({
        ...prev,
        categoria: { id: selected.id, descripcion: selected.descripcion },
      }))
    }
  }

  const handleFileChange = e => {
    setFile(e.target.files[0] || null)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Validaciones básicas
      if (!formData.nombre.trim()) throw new Error("El nombre del producto es obligatorio")
      if (isNaN(formData.cantidad) || formData.cantidad < 0) throw new Error("La cantidad debe ser un número válido y no negativo")
      if (!formData.categoria || !formData.categoria.id) throw new Error("Debe seleccionar una categoría")

      // Construir payload del producto
      const productoPayload = {
        id_producto: formData.id_producto,
        nombre: formData.nombre,
        cantidad: Number(formData.cantidad),
        codigoQr: formData.codigoQr,
        estado: formData.estado,
        id_categoria: Number(formData.categoria.id),
        fecha_creacion: new Date(formData.fecha_creacion).toISOString(),
        id_estanteria: shelfId,
      }

      // FormData para multipart
      const data = new FormData()
      if (file) {
        data.append("imagen", file)
      }
      data.append(
        "producto",
        new Blob([JSON.stringify(productoPayload)], { type: "application/json" })
      )

      const token = localStorage.getItem("authToken")
      const url = apiEndpoints.producto
      const method = product ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: data,
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Error en la petición al servidor")
      }
      const result = await res.json()
      onSaved(result)
      onClose()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Añadir Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={e => handleChange("nombre", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={e => handleChange("cantidad", parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoQr">Código QR</Label>
            <Input
              id="codigoQr"
              value={formData.codigoQr}
              onChange={e => handleChange("codigoQr", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_creacion">Fecha de Creación</Label>
            <Input
              id="fecha_creacion"
                type="date"
                value={formData.fecha_creacion}
                onChange={e => handleChange("fecha_creacion", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file">Imagen</Label>
              <Input id="file" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoria.id.toString()}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.estado === "activo"}
              onCheckedChange={v => handleChange("estado", v ? "activo" : "desactivado")}
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