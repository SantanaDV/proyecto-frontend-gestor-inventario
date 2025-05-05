"use client"

import { useState } from "react"
import { X, Save, Trash2, Package, RotateCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function ShelfModal({ shelf, onClose, onSave, onDelete, apiEndpoints }) {
  const [name, setName] = useState(shelf.name)
  const [orientation, setOrientation] = useState(shelf.orientation)
  const [products, setProducts] = useState(shelf.products || [])
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    quantity: "1",
  })

  const handleSave = () => {
    onSave({
      ...shelf,
      name,
      orientation,
      products,
    })
  }

  const addProduct = () => {
    if (!newProduct.name) return

    const product = {
      id: `product-${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku || `SKU-${Date.now()}`,
      quantity: Number.parseInt(newProduct.quantity) || 1,
    }

    setProducts([...products, product])
    setNewProduct({ name: "", sku: "", quantity: "1" })
  }

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const rotateShelf = () => {
    setOrientation(orientation === "horizontal" ? "vertical" : "horizontal")
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Estantería</DialogTitle>
          <DialogDescription>Modifica los detalles de la estantería y gestiona sus productos</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Posición</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="row" className="text-xs">
                      Fila
                    </Label>
                    <Input id="row" value={shelf.position.row} disabled />
                  </div>
                  <div>
                    <Label htmlFor="col" className="text-xs">
                      Columna
                    </Label>
                    <Input id="col" value={shelf.position.col} disabled />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Orientación</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant={orientation === "horizontal" ? "default" : "outline"}>Horizontal</Badge>
                  <Badge variant={orientation === "vertical" ? "default" : "outline"}>Vertical</Badge>
                  <Button variant="outline" size="icon" onClick={rotateShelf} className="ml-2">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Productos en esta estantería</Label>
                {products.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No hay productos en esta estantería</div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2">
                            <span>SKU: {product.sku}</span>
                            <span>•</span>
                            <span>Cantidad: {product.quantity}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeProduct(product.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Añadir nuevo producto</Label>
                <div className="grid gap-2">
                  <Input
                    placeholder="Nombre del producto"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="SKU"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      min="1"
                    />
                  </div>
                  <Button variant="outline" onClick={addProduct} disabled={!newProduct.name}>
                    <Package className="h-4 w-4 mr-2" />
                    Añadir Producto
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
